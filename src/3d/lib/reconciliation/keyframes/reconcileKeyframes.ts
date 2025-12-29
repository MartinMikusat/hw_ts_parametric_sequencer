import type { SceneObject } from '../../types/types_sceneModel';
import { nodes_reconcile, type type_reconciliation_node } from '../nodes/nodes_reconcile';
import { reconcileKeyframesTime } from './01_reconcileKeyframes_time';
import { extendTimeOfKeyframes } from './02_reconcileKeyframes_expandTime';
import { sortKeyframesForMarkerPositions } from './03_reconcileKeyframes_sortForMarkerPositions';
import type { type_separatedKeyframes_extended } from './types';

/**
 * Reconciles keyframes using the efficient separated pipeline.
 * Processes model and camera keyframes separately for optimal performance.
 */
export const reconcileKeyframes = (scene: type_reconciliation_node[]): type_separatedKeyframes_extended & { sceneObjects: Set<SceneObject> } => {
	const keyframes_fromNodes = nodes_reconcile(scene);
	const keyframes_reconciledTime = reconcileKeyframesTime(keyframes_fromNodes);
	const keyframes_extendedTime = extendTimeOfKeyframes(keyframes_reconciledTime);
	const keyframes_sorted = sortKeyframesForMarkerPositions(keyframes_extendedTime);

	return {
		modelKeyframes: keyframes_sorted.modelKeyframes,
		cameraKeyframes: keyframes_sorted.cameraKeyframes,
		sceneObjects: keyframes_fromNodes.sceneObjects,
	};
};

