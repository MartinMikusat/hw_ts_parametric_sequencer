import type { type_keyframe_camera, type_keyframe_model, type_separatedKeyframes } from '../keyframes/types';
import type { SceneModel } from '../../types/types_sceneModel';
import type { NodeBasicHide } from './NodeBasicHide';
import type { NodeBasicReveal } from './NodeBasicReveal';
import type { NodeBasicUnhide } from './NodeBasicUnhide';
import { NodeCamera } from './NodeCamera';
import type { NodeMain } from './NodeMain';
import { NodeToMarkerPosition } from './NodeToMarkerPosition';

/**
 * Union type representing any of the possible node classes used in reconciliation.
 */
export type type_reconciliation_node = NodeCamera | NodeToMarkerPosition | NodeMain | NodeBasicHide | NodeBasicReveal | NodeBasicUnhide;

/**
 * Union type representing any of the possible keyframe types generated during reconciliation.
 * Note: Camera keyframes have a different structure than model keyframes.
 */
export type type_reconciliation_keyframe = type_keyframe_model | type_keyframe_camera;

/**
 * Reconciles an array of various node instances into separated model and camera keyframe arrays.
 * It iterates through each node, calls its specific `reconcile` method, and separates
 * the generated keyframes by type for more efficient downstream processing.
 *
 * @param nodes An array of node instances (e.g., NodeBasicReveal, NodeCamera, NodePosition).
 * @returns An object containing separated arrays of model and camera keyframes and scene models used.
 */
export const nodes_reconcile = (nodes: Array<type_reconciliation_node>): type_separatedKeyframes & { sceneModels: Set<SceneModel> } => {
	const modelKeyframes: type_keyframe_model[] = [];
	const cameraKeyframes: type_keyframe_camera[] = [];
	const sceneModels = new Set<SceneModel>();

	// Iterate through each node and separate keyframes by type
	nodes.forEach((node) => {
		const keyframes = node.reconcile();
		keyframes.forEach((kf) => {
			// Use property checking to separate keyframes
			if ('sceneModel' in kf) {
				modelKeyframes.push(kf as type_keyframe_model);
				sceneModels.add((kf as type_keyframe_model).sceneModel);
			} else {
				cameraKeyframes.push(kf as type_keyframe_camera);
			}
		});
	});

	return {
		modelKeyframes,
		cameraKeyframes,
		sceneModels,
	};
};

