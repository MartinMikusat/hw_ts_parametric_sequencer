import { Euler, Quaternion, Vector3 } from '../../math';
import type { type_keyframes_reconciledTimeExtended_camera, type_keyframes_reconciledTimeExtended_model } from '../keyframes/02_reconcileKeyframes_expandTime';
import type { type_separatedKeyframes_extended, type_keyframe_camera, type_keyframe_model, type_keyframe_position } from '../keyframes/types';

// Constant for float comparisons
const EPSILON = 1e-6;

// Define the state structures using custom types
export interface ModelAnimationState {
	opacity: number;
	position: Vector3;
	rotation: Quaternion;
	cumulativeModelRotation: Quaternion;
}

export interface CameraAnimationState {
	rotationX: number;
	rotationY: number;
	target: Vector3;
	zoom: number;
}

// Final output structure
export interface AnimationSnapshot {
	models: Map<string, ModelAnimationState>;
	camera: CameraAnimationState;
}

// Default initial camera state
const defaultCameraState: CameraAnimationState = {
	rotationX: 0.0,
	rotationY: 0.0,
	target: new Vector3(0.0, 0.0, 0.0),
	zoom: 1.0,
};

/**
 * Simple linear interpolation between two values
 */
const lerp = (start: number, end: number, t: number): number => {
	return start + (end - start) * t;
};

/**
 * Creates a Vector3 from either an array or an object with x, y, z properties
 */
const createVector3FromInput = (input: Array<number> | { x: number; y: number; z: number }): Vector3 => {
	return new Vector3().fromArray(Array.isArray(input) ? input : [input.x, input.y, input.z]);
};

/**
 * Creates a Quaternion from rotation values specified in DEGREES.
 *
 * Runtime contract: all rotation values throughout the reconciliation pipeline are degrees,
 * regardless of whether they're provided as plain objects, arrays, or Euler instances.
 */
const createQuaternionFromEuler = (
	rotValues: number[] | { x: number; y: number; z: number; order?: Euler['order'] } | Euler
): Quaternion => {
	const { x, y, z, order } = Array.isArray(rotValues)
		? { x: Number(rotValues[0]), y: Number(rotValues[1]), z: Number(rotValues[2]), order: 'XYZ' as Euler['order'] }
		: { x: rotValues.x, y: rotValues.y, z: rotValues.z, order: (rotValues as any).order ?? 'XYZ' };

	// Convert degrees to radians before constructing the math Euler
	const xRad = x * Math.PI / 180;
	const yRad = y * Math.PI / 180;
	const zRad = z * Math.PI / 180;

	return new Quaternion().setFromEuler(new Euler(xRad, yRad, zRad, order));
};

/**
 * Helper to get string ID from sceneModel
 */
const getModelIDFromKeyframe = (modelKeyframe: type_keyframe_model): string => {
	if (modelKeyframe.sceneModel && modelKeyframe.sceneModel.sceneModelID) {
		return modelKeyframe.sceneModel.sceneModelID;
	}
	throw new Error(
		`Cannot determine SceneModel ID from keyframe. ` +
		`This indicates a bug in the keyframe structure or type definitions.`
	);
};

/**
 * Helper to convert keyframe camera state to local CameraAnimationState
 */
const cameraStateFromKeyframe = (keyframe: type_keyframe_camera): CameraAnimationState => {
	return {
		rotationX: keyframe.rotationX,
		rotationY: keyframe.rotationY,
		target: createVector3FromInput(keyframe.target as any), // Cast as any because target might be array in raw json but typed as Vector3
		zoom: keyframe.zoom,
	};
};

/**
 * Processes rotation based on type (absolute, relative, worldSpace)
 */
const processRotation = (
	rotationInfo: any,
	previousRotation: Quaternion,
	previousCumulativeRotation: Quaternion,
	progression: number
): { nextRotation: Quaternion; nextCumulativeRotation: Quaternion } => {
	let targetRotation: Quaternion | null = null;
	let targetCumulative: Quaternion | null = null;
	let nextRotation = previousRotation.clone();
	let nextCumulativeRotation = previousCumulativeRotation.clone();

	switch (rotationInfo.type) {
		case 'absolute': {
			const baseQuat = createQuaternionFromEuler(rotationInfo.value);
			targetRotation = baseQuat;
			targetCumulative = baseQuat;
			nextRotation.copy(previousRotation).slerp(targetRotation, progression);
			nextCumulativeRotation.copy(previousCumulativeRotation).slerp(targetCumulative, progression);
			break;
		}
		case 'relative': {
			const relativeQuat = createQuaternionFromEuler(rotationInfo.value);
			targetRotation = new Quaternion().copy(previousRotation).multiply(relativeQuat);
			targetCumulative = new Quaternion().copy(previousCumulativeRotation).multiply(relativeQuat);
			nextRotation.copy(previousRotation).slerp(targetRotation, progression);
			nextCumulativeRotation.copy(previousCumulativeRotation).slerp(targetCumulative, progression);
			break;
		}
		case 'worldSpace': {
			const worldQuat = createQuaternionFromEuler(rotationInfo.value);
			targetRotation = new Quaternion().copy(worldQuat).multiply(previousRotation);
			targetCumulative = previousCumulativeRotation.clone();
			nextRotation.copy(previousRotation).slerp(targetRotation, progression);
			nextCumulativeRotation = targetCumulative;
			break;
		}
	}

	return { nextRotation, nextCumulativeRotation };
};

/**
 * Processes position based on type (absolute, relative)
 */
const processPosition = (positionInfo: any, previousPosition: Vector3, progression: number): Vector3 => {
	let targetPosition: Vector3;

	switch (positionInfo.type) {
		case 'relative': {
			const relativeMove = createVector3FromInput(positionInfo.value);
			targetPosition = new Vector3().copy(previousPosition).add(relativeMove);
			break;
		}
		case 'absolute': {
			targetPosition = createVector3FromInput(positionInfo.value);
			break;
		}
		default:
			return previousPosition.clone();
	}

	return new Vector3().copy(previousPosition).lerp(targetPosition, progression);
};

/**
 * Calculates the transform for a model attached to a marker.
 */
const _calculateMarkerTransform = (
	markerData: Extract<type_keyframe_position, { type: 'marker' }>['value'],
	parentState: ModelAnimationState | undefined,
	previousState: ModelAnimationState,
	progression: number
): {
	finalPosition: Vector3;
	finalRotation: Quaternion;
	finalCumulativeRotation: Quaternion;
	finalOpacity: number;
} => {
	if (!parentState) {
		throw new Error(
			`Parent model not found for marker positioning. ` +
			`This indicates a bug in the scene definition - parent models must be processed before children that depend on them.`
		);
	}

	const parentPosition = parentState.position;
	const parentRotation = parentState.cumulativeModelRotation;
	const parentOpacity = parentState.opacity;

	// --- Position Calculation ---
	const markerLocalPosUnrotated = createVector3FromInput(markerData.position as any);
	const markerWorldOffset = markerLocalPosUnrotated.clone().applyQuaternion(parentRotation);
	const endPositionWorld = new Vector3().copy(parentPosition).add(markerWorldOffset);
	const finalPosition = new Vector3().copy(previousState.position).lerp(endPositionWorld, progression);

	// --- Rotation Calculation ---
	const markerBaseQuat = createQuaternionFromEuler(markerData.rotation as any);

	// Simplified: Assumes no offsetRotation based on type definition
	const targetLocalToParent = markerBaseQuat;
	const finalTargetOrientationWorld = new Quaternion().copy(parentRotation).multiply(targetLocalToParent);
	const finalRotation = new Quaternion().copy(previousState.rotation).slerp(finalTargetOrientationWorld, progression);
	const finalCumulativeRotation = new Quaternion().copy(previousState.cumulativeModelRotation).slerp(finalTargetOrientationWorld, progression);

	// --- Opacity Calculation (Inherited) ---
	const finalOpacity = Math.min(previousState.opacity, parentOpacity);

	return { finalPosition, finalRotation, finalCumulativeRotation, finalOpacity };
};

/**
 * Reconciles the state of all models based on typed model keyframes and current time.
 */
const _reconcileModelStates = (keyframes: Array<type_keyframes_reconciledTimeExtended_model>, currentTime: number): Map<string, ModelAnimationState> => {
	const modelStates = new Map<string, ModelAnimationState>();

	// --- Model State Initialization ---
	keyframes.forEach((extendedKeyframe) => {
		const modelKeyframe = extendedKeyframe.keyframe;
		const sceneModelID = getModelIDFromKeyframe(modelKeyframe);
		if (!modelStates.has(sceneModelID)) {
			modelStates.set(sceneModelID, {
				opacity: 0.0,
				position: new Vector3(0.0, 0.0, 0.0),
				rotation: new Quaternion(),
				cumulativeModelRotation: new Quaternion(),
			});
		}
	});

	// --- Model Reconciliation Loop ---
	keyframes.forEach((extendedKeyframe) => {
		const modelKeyframe = extendedKeyframe.keyframe;
		const timeStart = extendedKeyframe.reconciled.startTime;
		const timeEnd = extendedKeyframe.extended.endTime;
		const duration = timeEnd - timeStart;
		const sceneModelID = getModelIDFromKeyframe(modelKeyframe);
		const previousState = modelStates.get(sceneModelID);

		if (!previousState) {
			throw new Error(
				`Model state not found during reconciliation for ID: ${sceneModelID}. ` +
				`This indicates a bug in the reconciliation pipeline - all models must be initialized before processing their keyframes.`
			);
		}

		const currentKeyframeTime = currentTime - timeStart;
		let keyframeProgression = duration <= EPSILON ? 1.0 : currentKeyframeTime / duration;
		const clampedKeyframeProgression = Math.min(Math.max(keyframeProgression, 0.0), 1.0);

		// --- Calculate Next State Values (Opacity, Rotation) ---
		let nextOpacity = previousState.opacity;
		if (modelKeyframe.opacity !== undefined && modelKeyframe.opacity !== null) {
			nextOpacity = lerp(previousState.opacity, modelKeyframe.opacity, clampedKeyframeProgression);
		}

		let nextRotation = previousState.rotation.clone();
		let nextCumulativeRotation = previousState.cumulativeModelRotation.clone();

		if (modelKeyframe.rotation) {
			const rotationResult = processRotation(
				modelKeyframe.rotation,
				previousState.rotation,
				previousState.cumulativeModelRotation,
				clampedKeyframeProgression
			);
			nextRotation = rotationResult.nextRotation;
			nextCumulativeRotation = rotationResult.nextCumulativeRotation;
		}

		// --- Calculate Final Position, considering Markers ---
		let finalPosition = previousState.position.clone();
		let finalRotation = nextRotation;
		let finalCumulativeRotation = nextCumulativeRotation;
		let finalOpacity = nextOpacity;

		if (modelKeyframe.position) {
			const positionInfo = modelKeyframe.position;

			if (positionInfo.type === 'marker') {
				// Type of positionInfo.value is narrowed here to the marker structure
				const keyframeMarkerData = positionInfo.value;
				const parentSceneModelID = keyframeMarkerData.parent.sceneModelID;
				const parentState = modelStates.get(parentSceneModelID);

				// Pass previous state opacity to marker calculation, adjust result opacity
				const markerTransform = _calculateMarkerTransform(
					keyframeMarkerData,
					parentState,
					{ ...previousState, opacity: nextOpacity }, // Pass the potentially updated opacity to marker calc
					clampedKeyframeProgression
				);

				finalPosition = markerTransform.finalPosition;
				finalRotation = markerTransform.finalRotation;
				finalCumulativeRotation = markerTransform.finalCumulativeRotation;
				// Marker opacity calculation now combines keyframe target opacity AND parent opacity
				finalOpacity = markerTransform.finalOpacity; 
			} else {
				// Handle absolute and relative positions
				finalPosition = processPosition(positionInfo, previousState.position, clampedKeyframeProgression);
			}
		}

		// --- Update State Dictionary ---
		const nextState: ModelAnimationState = {
			opacity: finalOpacity,
			position: finalPosition,
			rotation: finalRotation,
			cumulativeModelRotation: finalCumulativeRotation,
		};
		modelStates.set(sceneModelID, nextState);
	});

	return modelStates;
};

/**
 * Reconciles the camera state based on typed camera keyframes and current time.
 */
const _reconcileCameraState = (keyframes: Array<type_keyframes_reconciledTimeExtended_camera>, currentTime: number): CameraAnimationState => {
	const sortedKeyframes = [...keyframes].sort((a, b) => a.reconciled.startTime - b.reconciled.startTime);

	if (sortedKeyframes.length === 0) {
		return defaultCameraState;
	}

	// Before the first keyframe: stick to default
	if (currentTime < sortedKeyframes[0].reconciled.startTime) {
		return defaultCameraState;
	}

	// Walk through keyframes and respect each keyframe's own duration when blending
	for (let i = 0; i < sortedKeyframes.length; i++) {
		const current = sortedKeyframes[i];
		const prevState = i === 0 ? defaultCameraState : cameraStateFromKeyframe(sortedKeyframes[i - 1].keyframe);
		const targetState = cameraStateFromKeyframe(current.keyframe);
		const start = current.reconciled.startTime;
		const end = current.extended.endTime;

		if (currentTime >= start && currentTime <= end + EPSILON) {
			const denom = Math.max(end - start, EPSILON);
			const progression = Math.min(Math.max((currentTime - start) / denom, 0.0), 1.0);

			const rotationX = lerp(prevState.rotationX, targetState.rotationX, progression);
			const rotationY = lerp(prevState.rotationY, targetState.rotationY, progression);
			const zoom = lerp(prevState.zoom, targetState.zoom, progression);
			const target = new Vector3().copy(prevState.target).lerp(targetState.target, progression);

			return { rotationX, rotationY, target, zoom };
		}

		const nextStart = sortedKeyframes[i + 1]?.reconciled.startTime;
		if (nextStart !== undefined && currentTime < nextStart) {
			// Within hold segment after this keyframe finishes and before the next begins
			return targetState;
		}
	}

	// After the last keyframe: hold its target state
	return cameraStateFromKeyframe(sortedKeyframes[sortedKeyframes.length - 1].keyframe);
};

/**
 * Calculates the interpolated animation state for all models and the camera at `currentTime`.
 * Uses the efficient separated keyframe pipeline for optimal performance.
 * @param separatedKeyframes Object containing separated model and camera keyframe arrays.
 * @param currentTime The current time in the animation timeline.
 * @returns An AnimationSnapshot containing the state of all models and the camera.
 */
export const reconcile_animationState = (separatedKeyframes: type_separatedKeyframes_extended, currentTime: number): AnimationSnapshot => {
	// Process keyframes directly without any type checking
	const modelStates = _reconcileModelStates(separatedKeyframes.modelKeyframes, currentTime);
	const cameraState = _reconcileCameraState(separatedKeyframes.cameraKeyframes, currentTime);

	return {
		models: modelStates,
		camera: cameraState,
	};
};
