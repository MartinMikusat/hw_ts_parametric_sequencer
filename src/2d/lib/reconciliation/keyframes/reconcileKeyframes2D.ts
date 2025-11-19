import type { SceneModel2D } from '../../types/types_sceneModel';
import { nodes_reconcile2D, type type_reconciliation_node2D } from '../nodes/nodes_reconcile2D';
import { reconcileKeyframesTime2D } from './01_reconcileKeyframes_time';
import { extendTimeOfKeyframes2D } from './02_reconcileKeyframes_expandTime';
import { sortKeyframesForMarkerPositions2D } from './03_reconcileKeyframes_sortForMarkerPositions';
import type { type_separatedKeyframes_extended2D } from './types';

/**
 * Reconciles keyframes using the efficient separated pipeline.
 * Processes model and camera keyframes separately for optimal performance.
 */
export const reconcileKeyframes2D = (scene: type_reconciliation_node2D[]): type_separatedKeyframes_extended2D & { sceneModels: Set<SceneModel2D> } => {
	const keyframes_fromNodes = nodes_reconcile2D(scene);
	const keyframes_reconciledTime = reconcileKeyframesTime2D(keyframes_fromNodes);
	const keyframes_extendedTime = extendTimeOfKeyframes2D(keyframes_reconciledTime);
	const keyframes_sorted = sortKeyframesForMarkerPositions2D(keyframes_extendedTime);

	return {
		modelKeyframes: keyframes_sorted.modelKeyframes,
		cameraKeyframes: keyframes_sorted.cameraKeyframes,
		sceneModels: keyframes_fromNodes.sceneModels,
	};
};

