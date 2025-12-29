import type { type_keyframe_camera2D, type_keyframe_model2D, type_separatedKeyframes2D } from '../keyframes/types';
import type { SceneObject2D } from '../../types/types_sceneModel';
import type { NodeBasicHide2D } from './NodeBasicHide2D';
import type { NodeBasicReveal2D } from './NodeBasicReveal2D';
import type { NodeBasicUnhide2D } from './NodeBasicUnhide2D';
import { NodeCamera2D } from './NodeCamera2D';
import type { NodeMain2D } from './NodeMain2D';
import { NodeToMarkerPosition2D } from './NodeToMarkerPosition2D';

/**
 * Union type representing any of the possible 2D node classes used in reconciliation.
 */
export type type_reconciliation_node2D = NodeCamera2D | NodeToMarkerPosition2D | NodeMain2D | NodeBasicHide2D | NodeBasicReveal2D | NodeBasicUnhide2D;

/**
 * Union type representing any of the possible 2D keyframe types generated during reconciliation.
 * Note: Camera keyframes have a different structure than model keyframes.
 */
export type type_reconciliation_keyframe2D = type_keyframe_model2D | type_keyframe_camera2D;

/**
 * Reconciles an array of various 2D node instances into separated model and camera keyframe arrays.
 * It iterates through each node, calls its specific `reconcile` method, and separates
 * the generated keyframes by type for more efficient downstream processing.
 *
 * @param nodes An array of 2D node instances (e.g., NodeBasicReveal2D, NodeCamera2D, NodeMain2D).
 * @returns An object containing separated arrays of model and camera keyframes and scene objects used.
 */
export const nodes_reconcile2D = (nodes: Array<type_reconciliation_node2D>): type_separatedKeyframes2D & { sceneObjects: Set<SceneObject2D> } => {
	const modelKeyframes: type_keyframe_model2D[] = [];
	const cameraKeyframes: type_keyframe_camera2D[] = [];
	const sceneObjects = new Set<SceneObject2D>();

	// Iterate through each node and separate keyframes by type
	nodes.forEach((node) => {
		const keyframes = node.reconcile();
		keyframes.forEach((kf) => {
			// Use property checking to separate keyframes
			if ('sceneObject' in kf) {
				modelKeyframes.push(kf as type_keyframe_model2D);
				sceneObjects.add((kf as type_keyframe_model2D).sceneObject);
			} else {
				cameraKeyframes.push(kf as type_keyframe_camera2D);
			}
		});
	});

	return {
		modelKeyframes,
		cameraKeyframes,
		sceneObjects,
	};
};

