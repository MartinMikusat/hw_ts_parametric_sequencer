import { reconcileKeyframes } from './reconciliation/keyframes/reconcileKeyframes';
import { keyframes_getSceneDuration } from './reconciliation/keyframes/keyframes_getSceneDuration';
import type { type_reconciliation_node } from './reconciliation/nodes/nodes_reconcile';
import type { type_separatedKeyframes_extended } from './reconciliation/keyframes/types';
import type { SceneObject } from './types/types_sceneModel';

/**
 * Definition of a 3D animation scene as an array of 3D nodes.
 * 
 * Each node in the array defines an animation instruction, such as moving a model,
 * animating the camera, or revealing/hiding models. Nodes can have relative timing
 * dependencies, allowing complex animation sequences to be defined declaratively.
 * 
 * @example
 * ```typescript
 * const scene: SceneDefinition3D = [
 *   new NodeMain({
 *     name: 'model1-move',
 *     sceneModel: model1,
 *     time: { type: 'absolute', value: 0 },
 *     duration: 2,
 *     position: { type: 'absolute', value: new Vector3(1, 0, 0) }
 *   }),
 *   new NodeCamera({
 *     name: 'camera-rotate',
 *     time: { type: 'relative', value: { offset: 0.5, side: 'Start', parentID: 'model1-move' } },
 *     duration: 1.5,
 *     rotationX: 45,
 *     rotationY: -30
 *   })
 * ];
 * ```
 */
export type SceneDefinition3D = type_reconciliation_node[];

/**
 * Result of reconciling a 3D scene definition.
 * Contains the reconciled keyframes, scene objects, and calculated duration.
 */
export interface ReconciledScene3D extends type_separatedKeyframes_extended {
	/** Set of all SceneObject instances referenced in the scene */
	sceneObjects: Set<SceneObject>;
	/** Total duration of the scene in seconds */
	duration: number;
}

/**
 * Reconciles a 3D scene definition and calculates its duration.
 * 
 * This is a convenience function that combines `reconcileKeyframes` and
 * `keyframes_getSceneDuration` into a single call. It processes all nodes
 * in the scene, resolves timing dependencies, and prepares the scene for
 * state calculation at any point in time.
 * 
 * @param scene - Array of 3D animation nodes defining the scene
 * @returns Reconciled scene with keyframes, scene objects, and duration
 * 
 * @remarks
 * The reconciliation process:
 * 1. Converts nodes into keyframes
 * 2. Resolves relative timing dependencies
 * 3. Extends keyframe durations to fill gaps
 * 4. Sorts keyframes for marker-based positioning
 * 5. Calculates the total scene duration
 * 
 * After reconciliation, you can use `reconcile_animationState()` to get
 * the animation state at any point in time.
 * 
 * @example
 * ```typescript
 * const scene: SceneDefinition3D = [
 *   new NodeMain({
 *     name: 'move-model',
 *     sceneModel: myModel,
 *     time: { type: 'absolute', value: 0 },
 *     duration: 2,
 *     position: { type: 'absolute', value: new Vector3(1, 0, 0) }
 *   })
 * ];
 * 
 * const reconciled = reconcileScene(scene);
 * console.log(`Scene duration: ${reconciled.duration}s`);
 * 
 * // Get state at any time
 * const state = reconcile_animationState(reconciled, 1.5);
 * ```
 */
export function reconcileScene(scene: SceneDefinition3D): ReconciledScene3D {
	const reconciled = reconcileKeyframes(scene);
	const duration = keyframes_getSceneDuration(reconciled);
	return {
		...reconciled,
		duration,
	};
}

