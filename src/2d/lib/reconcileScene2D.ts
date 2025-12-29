import { reconcileKeyframes2D } from './reconciliation/keyframes/reconcileKeyframes2D';
import { keyframes_getSceneDuration2D } from './reconciliation/keyframes/keyframes_getSceneDuration';
import type { type_reconciliation_node2D } from './reconciliation/nodes/nodes_reconcile2D';
import type { type_separatedKeyframes_extended2D } from './reconciliation/keyframes/types';
import type { SceneObject2D } from './types/types_sceneModel';

/**
 * Definition of a 2D animation scene as an array of 2D nodes.
 * 
 * Each node in the array defines an animation instruction, such as moving a model,
 * animating the camera, or revealing/hiding models. Nodes can have relative timing
 * dependencies, allowing complex animation sequences to be defined declaratively.
 * 
 * @example
 * ```typescript
 * const scene: SceneDefinition2D = [
 *   new NodeMain2D({
 *     name: 'model1-move',
 *     sceneModel: model1,
 *     time: { type: 'absolute', value: 0 },
 *     duration: 2,
 *     position2D: { type: 'absolute', value: new Vector2(100, 50) }
 *   }),
 *   new NodeCamera2D({
 *     name: 'camera-pan',
 *     time: { type: 'relative', value: { offset: 0.5, side: 'Start', parentID: 'model1-move' } },
 *     duration: 1.5,
 *     pan: new Vector2(50, 0),
 *     zoom: 1.2
 *   })
 * ];
 * ```
 */
export type SceneDefinition2D = type_reconciliation_node2D[];

/**
 * Result of reconciling a 2D scene definition.
 * Contains the reconciled keyframes, scene objects, and calculated duration.
 */
export interface ReconciledScene2D extends type_separatedKeyframes_extended2D {
	/** Set of all SceneObject2D instances referenced in the scene */
	sceneObjects: Set<SceneObject2D>;
	/** Total duration of the scene in seconds */
	duration: number;
}

/**
 * Reconciles a 2D scene definition and calculates its duration.
 * 
 * This is a convenience function that combines `reconcileKeyframes2D` and
 * `keyframes_getSceneDuration2D` into a single call. It processes all nodes
 * in the scene, resolves timing dependencies, and prepares the scene for
 * state calculation at any point in time.
 * 
 * @param scene - Array of 2D animation nodes defining the scene
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
 * After reconciliation, you can use `reconcile_animationState2D()` to get
 * the animation state at any point in time.
 * 
 * @example
 * ```typescript
 * const scene: SceneDefinition2D = [
 *   new NodeMain2D({
 *     name: 'move-model',
 *     sceneModel: myModel,
 *     time: { type: 'absolute', value: 0 },
 *     duration: 2,
 *     position2D: { type: 'absolute', value: new Vector2(100, 50) }
 *   })
 * ];
 * 
 * const reconciled = reconcileScene2D(scene);
 * console.log(`Scene duration: ${reconciled.duration}s`);
 * 
 * // Get state at any time
 * const state = reconcile_animationState2D(reconciled, 1.5);
 * ```
 */
export function reconcileScene2D(scene: SceneDefinition2D): ReconciledScene2D {
	const reconciled = reconcileKeyframes2D(scene);
	const duration = keyframes_getSceneDuration2D(reconciled);
	return {
		...reconciled,
		duration,
	};
}

