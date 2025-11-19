import { Vector2 } from '../../math/Vector2';
import { shortestArcInterpolation } from '../../math/angle';
import type { type_keyframes_reconciledTimeExtended_camera2D, type_keyframes_reconciledTimeExtended_model2D } from '../keyframes/02_reconcileKeyframes_expandTime';
import type { type_separatedKeyframes_extended2D, type_keyframe_camera2D, type_keyframe_model2D, type_keyframe_position2D } from '../keyframes/types';
import type { ModelAnimationState2D, CameraAnimationState2D } from '../../types/types_animationState';
import type { AnimationSnapshot2D } from '../../types/types_animationState';

// Re-export for convenience
export type { AnimationSnapshot2D, ModelAnimationState2D, CameraAnimationState2D } from '../../types/types_animationState';

// Constant for float comparisons
const EPSILON = 1e-6;

// Default initial camera state
const defaultCameraState: CameraAnimationState2D = {
	pan: new Vector2(0.0, 0.0),
	zoom: 1.0,
	rotation: 0.0,
};

/**
 * Simple linear interpolation between two values
 */
const lerp = (start: number, end: number, t: number): number => {
	return start + (end - start) * t;
};

/**
 * Creates a Vector2 from either an array or an object with x, y properties
 */
const createVector2FromInput = (input: Array<number> | { x: number; y: number } | Vector2): Vector2 => {
	if (input instanceof Vector2) {
		return input.clone();
	}
	return new Vector2().fromArray(Array.isArray(input) ? input : [input.x, input.y]);
};

/**
 * Helper to get string ID from sceneModel
 */
const getModelIDFromKeyframe = (modelKeyframe: type_keyframe_model2D): string => {
	if (modelKeyframe.sceneModel && modelKeyframe.sceneModel.sceneModelID) {
		return modelKeyframe.sceneModel.sceneModelID;
	}
	throw new Error(
		`Cannot determine SceneModel ID from keyframe. ` +
		`This indicates a bug in the keyframe structure or type definitions.`
	);
};

/**
 * Helper to convert keyframe camera state to local CameraAnimationState2D
 */
const cameraStateFromKeyframe = (keyframe: type_keyframe_camera2D): CameraAnimationState2D => {
	return {
		pan: createVector2FromInput(keyframe.pan as any),
		zoom: keyframe.zoom,
		rotation: keyframe.rotation,
	};
};

/**
 * Processes rotation based on type (absolute, relative)
 */
const processRotation = (
	rotationInfo: { type: 'absolute' | 'relative'; value: number },
	previousRotation: number,
	progression: number
): number => {
	let targetRotation: number;

	switch (rotationInfo.type) {
		case 'absolute': {
			targetRotation = rotationInfo.value;
			break;
		}
		case 'relative': {
			targetRotation = previousRotation + rotationInfo.value;
			break;
		}
		default:
			return previousRotation;
	}

	return shortestArcInterpolation(previousRotation, targetRotation, progression);
};

/**
 * Processes position based on type (absolute, relative)
 */
const processPosition = (positionInfo: type_keyframe_position2D, previousPosition: Vector2, progression: number): Vector2 => {
	let targetPosition: Vector2;

	switch (positionInfo.type) {
		case 'relative': {
			const relativeMove = createVector2FromInput(positionInfo.value);
			targetPosition = new Vector2().copy(previousPosition).add(relativeMove);
			break;
		}
		case 'absolute': {
			targetPosition = createVector2FromInput(positionInfo.value);
			break;
		}
		default:
			return previousPosition.clone();
	}

	return new Vector2().copy(previousPosition).lerp(targetPosition, progression);
};

/**
 * Calculates the transform for a model attached to a marker.
 * In 2D, markers are used for relative positioning only (no hierarchical transforms).
 */
const _calculateMarkerTransform = (
	markerData: Extract<type_keyframe_position2D, { type: 'marker' }>['value'],
	parentState: ModelAnimationState2D | undefined,
	previousState: ModelAnimationState2D,
	progression: number
): {
	finalPosition: Vector2;
	finalRotation: number;
	finalOpacity: number;
} => {
	if (!parentState) {
		throw new Error(
			`Parent model not found for marker positioning. ` +
			`This indicates a bug in the scene definition - parent models must be processed before children that depend on them.`
		);
	}

	const parentPosition = parentState.position;
	const parentRotation = parentState.rotation;
	const parentOpacity = parentState.opacity;

	// --- Position Calculation ---
	// In 2D, marker position is relative to parent position (no rotation transform)
	const markerLocalPos = createVector2FromInput(markerData.position);
	const endPositionWorld = new Vector2().copy(parentPosition).add(markerLocalPos);
	const finalPosition = new Vector2().copy(previousState.position).lerp(endPositionWorld, progression);

	// --- Rotation Calculation ---
	// In 2D, marker rotation is relative to parent rotation (simple addition)
	const markerRotation = markerData.rotation;
	const targetRotation = parentRotation + markerRotation;
	const finalRotation = shortestArcInterpolation(previousState.rotation, targetRotation, progression);

	// --- Opacity Calculation (Inherited) ---
	const finalOpacity = Math.min(previousState.opacity, parentOpacity);

	return { finalPosition, finalRotation, finalOpacity };
};

/**
 * Reconciles the state of all models based on typed model keyframes and current time.
 */
const _reconcileModelStates = (keyframes: Array<type_keyframes_reconciledTimeExtended_model2D>, currentTime: number): Map<string, ModelAnimationState2D> => {
	const modelStates = new Map<string, ModelAnimationState2D>();

	// --- Model State Initialization ---
	keyframes.forEach((extendedKeyframe) => {
		const modelKeyframe = extendedKeyframe.keyframe;
		const sceneModelID = getModelIDFromKeyframe(modelKeyframe);
		if (!modelStates.has(sceneModelID)) {
			modelStates.set(sceneModelID, {
				opacity: 0.0,
				position: new Vector2(0.0, 0.0),
				rotation: 0.0,
				scale: 1.0,
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

		// --- Calculate Next State Values (Opacity, Rotation, Scale) ---
		let nextOpacity = previousState.opacity;
		if (modelKeyframe.opacity !== undefined && modelKeyframe.opacity !== null) {
			nextOpacity = lerp(previousState.opacity, modelKeyframe.opacity, clampedKeyframeProgression);
		}

		let nextRotation = previousState.rotation;
		if (modelKeyframe.rotation) {
			nextRotation = processRotation(
				modelKeyframe.rotation,
				previousState.rotation,
				clampedKeyframeProgression
			);
		}

		let nextScale = previousState.scale;
		if (modelKeyframe.scale !== undefined && modelKeyframe.scale !== null) {
			nextScale = lerp(previousState.scale, modelKeyframe.scale, clampedKeyframeProgression);
		}

		// --- Calculate Final Position, considering Markers ---
		let finalPosition = previousState.position.clone();
		let finalRotation = nextRotation;
		let finalOpacity = nextOpacity;
		let finalScale = nextScale;

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
					{ ...previousState, opacity: nextOpacity, scale: nextScale }, // Pass the potentially updated values to marker calc
					clampedKeyframeProgression
				);

				finalPosition = markerTransform.finalPosition;
				finalRotation = markerTransform.finalRotation;
				// Marker opacity calculation now combines keyframe target opacity AND parent opacity
				finalOpacity = markerTransform.finalOpacity;
			} else {
				// Handle absolute and relative positions
				finalPosition = processPosition(positionInfo, previousState.position, clampedKeyframeProgression);
			}
		}

		// --- Update State Dictionary ---
		const nextState: ModelAnimationState2D = {
			opacity: finalOpacity,
			position: finalPosition,
			rotation: finalRotation,
			scale: finalScale,
		};
		modelStates.set(sceneModelID, nextState);
	});

	return modelStates;
};

/**
 * Reconciles the camera state based on typed camera keyframes and current time.
 */
const _reconcileCameraState = (keyframes: Array<type_keyframes_reconciledTimeExtended_camera2D>, currentTime: number): CameraAnimationState2D => {
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

			const pan = new Vector2().copy(prevState.pan).lerp(targetState.pan, progression);
			const zoom = lerp(prevState.zoom, targetState.zoom, progression);
			const rotation = shortestArcInterpolation(prevState.rotation, targetState.rotation, progression);

			return { pan, zoom, rotation };
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
 * @returns An AnimationSnapshot2D containing the state of all models and the camera.
 */
export const reconcile_animationState2D = (separatedKeyframes: type_separatedKeyframes_extended2D, currentTime: number): AnimationSnapshot2D => {
	// Process keyframes directly without any type checking
	const modelStates = _reconcileModelStates(separatedKeyframes.modelKeyframes, currentTime);
	const cameraState = _reconcileCameraState(separatedKeyframes.cameraKeyframes, currentTime);

	return {
		models: modelStates,
		camera: cameraState,
	};
};

