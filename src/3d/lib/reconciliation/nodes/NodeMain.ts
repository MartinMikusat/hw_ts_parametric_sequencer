import type { SceneObject } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_keyframe_position, type_keyframe_rotation, type_time, type_custom } from '../keyframes/types';

/**
 * Properties required to create a NodeMain instance.
 * 
 * NodeMain is the primary node type for animating 3D objects with position, rotation, and opacity changes.
 */
export interface NodeMainProps {
	/** 
	 * Unique identifier for this node. Used as the keyframe ID and for relative timing references.
	 * Must be unique within the scene definition.
	 */
	name: string;

	/** 
	 * Chapter identifier for organizing animations into logical groups.
	 * Can be used to filter or organize keyframes by chapter.
	 */
	chapter: string;

	/** 
	 * The SceneObject instance to animate. This object will be affected by the position, rotation, and opacity properties.
	 */
	sceneObject: SceneObject;

	/** 
	 * Timing specification for when this animation starts.
	 * Can be absolute (fixed time), relative (relative to another keyframe), or multiple (relative to multiple keyframes).
	 */
	time: type_time;

	/** 
	 * Duration of this animation in seconds.
	 * The animation will interpolate from the previous state to the target state over this duration.
	 */
	duration: number;

	/** 
	 * Optional position change for the object.
	 * Can be absolute (world position), relative (offset from current), or marker-based (relative to a marker on another object).
	 */
	position?: type_keyframe_position;

	/** 
	 * Optional rotation change for the object.
	 * Can be absolute (world rotation), relative (offset from current), or worldSpace (rotation in world space).
	 */
	rotation?: type_keyframe_rotation;

	/** 
	 * Optional opacity value for the object, ranging from 0 (transparent) to 1 (opaque).
	 * If not specified, the object's opacity remains unchanged.
	 */
	opacity?: number;

	/** 
	 * Optional custom properties to animate.
	 * Each property can specify its own interpolation method (linear or step).
	 * Properties persist across keyframes until explicitly changed.
	 * 
	 * @example
	 * ```typescript
	 * custom: {
	 *   brightness: { value: 1.5, interpolation: 'linear' },
	 *   intensity: { value: 0.8 }
	 * }
	 * ```
	 */
	custom?: type_custom;
}

/**
 * Represents a main animation node for 3D objects.
 * 
 * NodeMain is used to animate an object's position, rotation, opacity, and/or custom properties over time.
 * It's the most commonly used node type for basic object animations.
 * 
 * @remarks
 * This node generates a single keyframe that defines the target state for the object.
 * The animation system will interpolate smoothly from the previous state to this target state.
 * 
 * @example
 * ```typescript
 * // Animate object position and rotation
 * const node = new NodeMain({
 *   name: 'object1-move',
 *   chapter: 'intro',
 *   sceneObject: myObject,
 *   time: { type: 'absolute', value: 0 },
 *   duration: 2,
 *   position: { type: 'absolute', value: new Vector3(1, 2, 3) },
 *   rotation: { type: 'relative', value: new Euler(0, 90, 0) },
 *   opacity: 1.0
 * });
 * 
 * // Start animation relative to another keyframe
 * const node2 = new NodeMain({
 *   name: 'object1-fade',
 *   chapter: 'intro',
 *   sceneObject: myObject,
 *   time: { 
 *     type: 'relative', 
 *     value: { offset: 0.5, side: 'End', parentID: 'object1-move' } 
 *   },
 *   duration: 1,
 *   opacity: 0
 * });
 * 
 * // Animate custom properties (e.g., brightness for a light)
 * const node3 = new NodeMain({
 *   name: 'light-brighten',
 *   chapter: 'intro',
 *   sceneObject: lightObject,
 *   time: { type: 'absolute', value: 2 },
 *   duration: 1.5,
 *   custom: {
 *     brightness: { value: 1.5, interpolation: 'linear' },
 *     intensity: { value: 0.8 }
 *   }
 * });
 * ```
 */
export class NodeMain {
	name: string;
	chapter: string;
	sceneObject: SceneObject;
	time: type_time;
	duration: number;
	position?: type_keyframe_position;
	rotation?: type_keyframe_rotation;
	opacity?: number;
	custom?: type_custom;

	constructor(props: NodeMainProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneObject = props.sceneObject;
		this.time = props.time;
		this.duration = props.duration;
		this.position = props.position;
		this.rotation = props.rotation;
		this.opacity = props.opacity;
		this.custom = props.custom;
	}

	/**
	 * Gets the relative ID used for timing references.
	 * 
	 * Other nodes can reference this node's timing using this ID in their relative time specifications.
	 * 
	 * @returns The node's name, which serves as the keyframe ID for relative timing.
	 * 
	 * @example
	 * ```typescript
	 * const node1 = new NodeMain({ name: 'move-model', ... });
	 * const node2 = new NodeMain({
	 *   name: 'fade-model',
	 *   time: { 
	 *     type: 'relative',
	 *     value: { offset: 0, side: 'Start', parentID: node1.getRelativeID() }
	 *   },
	 *   ...
	 * });
	 * ```
	 */
	getRelativeID(): string {
		return this.name;
	}

	/**
	 * Reconciles this node into keyframes for the animation system.
	 * 
	 * Converts the node's properties into a keyframe that can be processed by the reconciliation pipeline.
	 * 
	 * @returns An array containing a single keyframe model representing this animation state.
	 * 
	 * @internal
	 */
	reconcile(): Array<type_keyframe_model> {
		const keyframeID = this.getRelativeID();

		return [
			{
				id: keyframeID,
				sceneObject: this.sceneObject,
				time: this.time,
				duration: this.duration,
				position: this.position,
				rotation: this.rotation,
				opacity: this.opacity,
				custom: this.custom,
				chapter: this.chapter,
			},
		];
	}
}

