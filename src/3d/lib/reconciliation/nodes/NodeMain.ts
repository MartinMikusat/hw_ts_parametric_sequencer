import type { SceneModel } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_keyframe_position, type_keyframe_rotation, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeMain instance.
 * 
 * NodeMain is the primary node type for animating 3D models with position, rotation, and opacity changes.
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
	 * The SceneModel instance to animate. This model will be affected by the position, rotation, and opacity properties.
	 */
	sceneModel: SceneModel;
	
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
	 * Optional position change for the model.
	 * Can be absolute (world position), relative (offset from current), or marker-based (relative to a marker on another model).
	 */
	position?: type_keyframe_position;
	
	/** 
	 * Optional rotation change for the model.
	 * Can be absolute (world rotation), relative (offset from current), or worldSpace (rotation in world space).
	 */
	rotation?: type_keyframe_rotation;
	
	/** 
	 * Optional opacity value for the model, ranging from 0 (transparent) to 1 (opaque).
	 * If not specified, the model's opacity remains unchanged.
	 */
	opacity?: number;
}

/**
 * Represents a main animation node for 3D models.
 * 
 * NodeMain is used to animate a model's position, rotation, and/or opacity over time.
 * It's the most commonly used node type for basic model animations.
 * 
 * @remarks
 * This node generates a single keyframe that defines the target state for the model.
 * The animation system will interpolate smoothly from the previous state to this target state.
 * 
 * @example
 * ```typescript
 * // Animate model position and rotation
 * const node = new NodeMain({
 *   name: 'model1-move',
 *   chapter: 'intro',
 *   sceneModel: myModel,
 *   time: { type: 'absolute', value: 0 },
 *   duration: 2,
 *   position: { type: 'absolute', value: new Vector3(1, 2, 3) },
 *   rotation: { type: 'relative', value: new Euler(0, 90, 0) },
 *   opacity: 1.0
 * });
 * 
 * // Start animation relative to another keyframe
 * const node2 = new NodeMain({
 *   name: 'model1-fade',
 *   chapter: 'intro',
 *   sceneModel: myModel,
 *   time: { 
 *     type: 'relative', 
 *     value: { offset: 0.5, side: 'End', parentID: 'model1-move' } 
 *   },
 *   duration: 1,
 *   opacity: 0
 * });
 * ```
 */
export class NodeMain {
	name: string;
	chapter: string;
	sceneModel: SceneModel;
	time: type_time;
	duration: number;
	position?: type_keyframe_position;
	rotation?: type_keyframe_rotation;
	opacity?: number;

	constructor(props: NodeMainProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneModel = props.sceneModel;
		this.time = props.time;
		this.duration = props.duration;
		this.position = props.position;
		this.rotation = props.rotation;
		this.opacity = props.opacity;
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
				sceneModel: this.sceneModel,
				time: this.time,
				duration: this.duration,
				position: this.position,
				rotation: this.rotation,
				opacity: this.opacity,
				chapter: this.chapter,
			},
		];
	}
}

