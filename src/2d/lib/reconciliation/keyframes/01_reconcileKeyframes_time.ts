import type { type_reconciliation_keyframe2D } from '../nodes/nodes_reconcile2D';
import type { type_separatedKeyframes2D, type_separatedKeyframes_reconciled2D, type_keyframe_model2D, type_keyframe_camera2D } from './types';

/**
 * Represents a keyframe with reconciled absolute start and end times
 */
type type_keyframes_reconciledTime2D = {
	reconciled: {
		startTime: number;
		endTime: number;
	};
	keyframe: type_reconciliation_keyframe2D;
};

/**
 * Represents a model keyframe with reconciled absolute start and end times
 */
type type_keyframes_reconciledTime_model2D = {
	reconciled: {
		startTime: number;
		endTime: number;
	};
	keyframe: type_keyframe_model2D;
};

/**
 * Represents a camera keyframe with reconciled absolute start and end times
 */
type type_keyframes_reconciledTime_camera2D = {
	reconciled: {
		startTime: number;
		endTime: number;
	};
	keyframe: type_keyframe_camera2D;
};

/**
 * Type guard for absolute time keyframes
 */
function isAbsoluteKeyframe(kf: type_reconciliation_keyframe2D): kf is type_reconciliation_keyframe2D & { time: { type: 'absolute'; value: number } } {
	return kf.time.type === 'absolute';
}

/**
 * Type guard for relative or multiple time keyframes
 */
function isRelativeOrMultipleKeyframe(kf: type_reconciliation_keyframe2D): kf is type_reconciliation_keyframe2D & { time: { type: 'relative'; value: any } | { type: 'multiple'; values: any[] } } {
	return kf.time.type === 'relative' || kf.time.type === 'multiple';
}

/**
 * Creates a reconciled keyframe with calculated start and end times
 */
function createReconciledKeyframe(startTime: number, keyframe: type_reconciliation_keyframe2D): type_keyframes_reconciledTime2D {
	return {
		reconciled: {
			startTime,
			endTime: startTime + keyframe.duration,
		},
		keyframe,
	};
}

/**
 * Attempts to resolve a keyframe's start time based on its dependencies
 * @returns An object indicating if resolution was successful and the calculated start time
 */
function tryResolveKeyframeTime(keyframe: type_reconciliation_keyframe2D, resolvedMap: Map<string, type_keyframes_reconciledTime2D>): { resolved: boolean; startTime: number } {
	// Handle absolute time keyframes
	if (keyframe.time.type === 'absolute') {
		return { resolved: true, startTime: keyframe.time.value };
	}

	// Handle relative time keyframes
	if (keyframe.time.type === 'relative') {
		const parentKf = resolvedMap.get(keyframe.time.value.parentID);
		if (!parentKf) {
			return { resolved: false, startTime: -1 };
		}

		const startTime = keyframe.time.value.side === 'Start' ? parentKf.reconciled.startTime + keyframe.time.value.offset : parentKf.reconciled.endTime + keyframe.time.value.offset;

		return { resolved: true, startTime };
	}

	// Handle multiple dependencies
	if (keyframe.time.type === 'multiple') {
		let latestParentTime = -Infinity;

		for (const parentInfo of keyframe.time.values) {
			const parentKf = resolvedMap.get(parentInfo.parentID);
			if (!parentKf) {
				return { resolved: false, startTime: -1 };
			}

			const parentTime = parentInfo.side === 'Start' ? parentKf.reconciled.startTime + parentInfo.offset : parentKf.reconciled.endTime + parentInfo.offset;

			latestParentTime = Math.max(latestParentTime, parentTime);
		}

		return { resolved: true, startTime: latestParentTime };
	}

	// Unhandled time type
	return { resolved: false, startTime: -1 };
}

// Define a type that ensures time property has a type field
interface TimeWithType {
	type: string;
	[key: string]: any;
}

/**
 * Validates keyframes before reconciliation and returns only valid ones.
 * Logs warnings for invalid keyframes.
 */
function validateKeyframes(keyframes: Array<type_reconciliation_keyframe2D>): Array<type_reconciliation_keyframe2D> {
	if (!Array.isArray(keyframes)) {
		console.warn('Keyframes input must be an array');
		return [];
	}

	// Check for duplicate IDs
	const idSet = new Set<string>();
	const duplicateIds: string[] = [];

	keyframes.forEach((kf) => {
		if (idSet.has(kf.id)) {
			duplicateIds.push(kf.id);
		} else {
			idSet.add(kf.id);
		}
	});

	if (duplicateIds.length > 0) {
		throw new Error(`Duplicate keyframe IDs found: ${duplicateIds.join(', ')}. Scene definitions must use unique IDs for deterministic reconciliation.`);
	}

	// Validate individual keyframes
	const validKeyframes = keyframes.filter((kf) => {
		// Check required properties
		if (!kf.id || typeof kf.id !== 'string') {
			console.warn('Keyframe is missing valid ID:', kf);
			return false;
		}

		if (typeof kf.duration !== 'number' || isNaN(kf.duration) || !isFinite(kf.duration)) {
			console.warn('Keyframe has invalid duration:', kf.id);
			return false;
		}

		if (kf.duration < 0) {
			console.warn('Keyframe has negative duration:', kf.id);
			return false;
		}

		// Check time property validity
		if (!kf.time || typeof kf.time !== 'object') {
			console.warn('Keyframe is missing time property:', kf.id);
			return false;
		}

		// Safely check time type using a type assertion
		const timeObj = kf.time as TimeWithType;
		if (typeof timeObj.type !== 'string') {
			console.warn('Keyframe has invalid time type property:', kf.id);
			return false;
		}

		// Validate based on time type
		if (timeObj.type === 'absolute') {
			if (typeof timeObj.value !== 'number' || isNaN(timeObj.value) || !isFinite(timeObj.value)) {
				console.warn('Absolute keyframe has invalid time value:', kf.id);
				return false;
			}
		} else if (timeObj.type === 'relative') {
			if (!timeObj.value || typeof timeObj.value.parentID !== 'string') {
				console.warn('Relative keyframe is missing valid parentID:', kf.id);
				return false;
			}

			if (typeof timeObj.value.offset !== 'number' || isNaN(timeObj.value.offset) || !isFinite(timeObj.value.offset)) {
				console.warn('Relative keyframe has invalid offset:', kf.id);
				return false;
			}

			if (timeObj.value.side !== 'Start' && timeObj.value.side !== 'End') {
				console.warn('Relative keyframe has invalid side (must be "Start" or "End"):', kf.id);
				return false;
			}
		} else if (timeObj.type === 'multiple') {
			if (!Array.isArray(timeObj.values) || timeObj.values.length === 0) {
				console.warn('Multiple keyframe has empty or invalid values array:', kf.id);
				return false;
			}

			for (const val of timeObj.values) {
				if (!val || typeof val.parentID !== 'string') {
					console.warn('Multiple keyframe has entry with invalid parentID:', kf.id);
					return false;
				}

				if (typeof val.offset !== 'number' || isNaN(val.offset) || !isFinite(val.offset)) {
					console.warn('Multiple keyframe has entry with invalid offset:', kf.id);
					return false;
				}

				if (val.side !== 'Start' && val.side !== 'End') {
					console.warn('Multiple keyframe has entry with invalid side (must be "Start" or "End"):', kf.id);
					return false;
				}
			}
		} else {
			console.warn('Keyframe has unknown time type:', kf.id, timeObj.type);
			return false;
		}

		return true;
	});

	if (validKeyframes.length < keyframes.length) {
		console.warn(`Filtered out ${keyframes.length - validKeyframes.length} invalid keyframes`);
	}

	return validKeyframes;
}

// Internal function to reconcile timing - used by the separated version
const reconcileKeyframesTimeInternal = (keyframes: Array<type_reconciliation_keyframe2D>): Array<type_keyframes_reconciledTime2D> => {
	// Validate the input keyframes
	const validKeyframes = validateKeyframes(keyframes);

	if (validKeyframes.length === 0) {
		return [];
	}

	// Split keyframes by time type
	const absoluteKeyframes = validKeyframes.filter(isAbsoluteKeyframe);
	let unresolvedKeyframes = validKeyframes.filter(isRelativeOrMultipleKeyframe);

	// Map to store resolved keyframes by their ID
	const resolvedMap = new Map<string, type_keyframes_reconciledTime2D>();
	// Array to store the final reconciled keyframes in order
	const reconciledResult: Array<type_keyframes_reconciledTime2D> = [];

	// Process absolute keyframes first (they have no dependencies)
	absoluteKeyframes.forEach((keyframe) => {
		const reconciledKf = createReconciledKeyframe(keyframe.time.value, keyframe);
		resolvedMap.set(keyframe.id, reconciledKf);
		reconciledResult.push(reconciledKf);
	});

	// Resolve dependent keyframes iteratively
	const MAX_ITERATIONS = 100; // Safety limit

	for (let iteration = 0; iteration < MAX_ITERATIONS && unresolvedKeyframes.length > 0; iteration++) {
		const newlyResolved: Array<type_keyframes_reconciledTime2D> = [];
		const stillUnresolved: typeof unresolvedKeyframes = [];
		let madeProgress = false;

		for (const keyframe of unresolvedKeyframes) {
			const { resolved, startTime } = tryResolveKeyframeTime(keyframe, resolvedMap);

			if (resolved) {
				const reconciledKf = createReconciledKeyframe(startTime, keyframe);
				newlyResolved.push(reconciledKf);
				resolvedMap.set(keyframe.id, reconciledKf);
				madeProgress = true;
			} else {
				stillUnresolved.push(keyframe);
			}
		}

		// Add newly resolved keyframes to the result
		reconciledResult.push(...newlyResolved);
		unresolvedKeyframes = stillUnresolved;

		// If no progress was made, we can't resolve any more keyframes
		if (!madeProgress) {
			break;
		}
	}

	// Check if we hit the iteration limit
	if (unresolvedKeyframes.length > 0) {
		// Build detailed error message
		const unresolvedDetails = unresolvedKeyframes.map((kf: type_reconciliation_keyframe2D) => {
			if (kf.time.type === 'relative') {
				return `${kf.id} (depends on: ${kf.time.value.parentID})`;
			} else if (kf.time.type === 'multiple') {
				const deps = kf.time.values.map((v: { parentID: string }) => v.parentID).join(', ');
				return `${kf.id} (depends on: ${deps})`;
			}
			return kf.id;
		});

		throw new Error(
			`Keyframe time reconciliation failed with ${unresolvedKeyframes.length} unresolved keyframes. ` +
			`This indicates a bug in the scene definition - all dependencies must be resolvable.\n` +
			`Unresolved keyframes: ${unresolvedDetails.join(', ')}`
		);
	}

	return reconciledResult;
};

/**
 * Reconciles the timing of separated keyframes, converting relative and multiple-dependency times
 * into absolute start and end times based on their dependencies.
 *
 * @param separatedKeyframes Object containing separated model and camera keyframe arrays
 * @returns Object containing separated arrays of keyframes with reconciled absolute timing
 */
export const reconcileKeyframesTime2D = (separatedKeyframes: type_separatedKeyframes2D): type_separatedKeyframes_reconciled2D => {
	// Process both model and camera keyframes together to resolve cross-dependencies
	const allKeyframes = [...separatedKeyframes.modelKeyframes, ...separatedKeyframes.cameraKeyframes];
	const reconciledAll = reconcileKeyframesTimeInternal(allKeyframes);

	// Separate the reconciled keyframes back into model and camera arrays
	const modelKeyframes: type_keyframes_reconciledTime_model2D[] = [];
	const cameraKeyframes: type_keyframes_reconciledTime_camera2D[] = [];

	reconciledAll.forEach((reconciled) => {
		if ('sceneObject' in reconciled.keyframe) {
			modelKeyframes.push(reconciled as type_keyframes_reconciledTime_model2D);
		} else {
			cameraKeyframes.push(reconciled as type_keyframes_reconciledTime_camera2D);
		}
	});

	return {
		modelKeyframes,
		cameraKeyframes,
	};
};

