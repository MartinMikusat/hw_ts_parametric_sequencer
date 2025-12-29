import type { SceneObject2D } from '../../types/types_sceneModel';
import type { type_keyframe_model2D, type_keyframe_position2D, type_keyframe_rotation2D, type_time, type_custom } from '../keyframes/types';

/**
 * Properties required to create a NodeMain2D instance.
 * 
 * NodeMain2D is the primary node type for animating 2D objects with position, angle, opacity, and scale changes.
 */
export interface NodeMain2DProps {
	/** 
	 * Unique identifier for this node. Used as the keyframe ID and for relative timing references.
	 * Must be unique within the scene definition.
	 */
	name: string;
	
	/** 
	 * Chapter identifier for organizing animations into logical groups.
	 */
	chapter: string;
	
	/** 
	 * The SceneObject2D instance to animate.
	 */
	sceneObject: SceneObject2D;
	
	/** 
	 * Timing specification for when this animation starts.
	 */
	time: type_time;
	
	/** 
	 * Duration of this animation in seconds.
	 */
	duration: number;
	
	/** 
	 * Optional 2D position change for the object.
	 * Can be absolute (world position) or relative (offset from current).
	 */
	position?: type_keyframe_position2D;
	
	/** 
	 * Optional rotation angle change for the object in degrees.
	 * Can be absolute (world angle) or relative (offset from current).
	 */
	rotation?: type_keyframe_rotation2D;
	
	/** 
	 * Optional opacity value, ranging from 0 (transparent) to 1 (opaque).
	 */
	opacity?: number;
	
	/** 
	 * Optional scale factor. Values > 1 enlarge, values < 1 shrink.
	 */
	scale?: number;

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
 * Represents a main animation node for 2D objects.
 * 
 * NodeMain2D is used to animate an object's position, angle, opacity, scale, and/or custom properties over time.
 * It's the most commonly used node type for basic 2D object animations.
 * 
 * @example
 * ```typescript
 * const node = new NodeMain2D({
 *   name: 'object1-move',
 *   chapter: 'intro',
 *   sceneObject: myObject,
 *   time: { type: 'absolute', value: 0 },
 *   duration: 2,
 *   position: { type: 'absolute', value: new Vector2(100, 50) },
 *   rotation: { type: 'relative', value: 90 },
 *   opacity: 1.0,
 *   scale: 1.5
 * });
 * 
 * // Animate custom properties
 * const nodeWithCustom = new NodeMain2D({
 *   name: 'sprite-glow',
 *   chapter: 'intro',
 *   sceneObject: spriteObject,
 *   time: { type: 'absolute', value: 1 },
 *   duration: 2,
 *   custom: {
 *     glowIntensity: { value: 2.0, interpolation: 'linear' },
 *     pulseSpeed: { value: 1.5 }
 *   }
 * });
 * ```
 */
export class NodeMain2D {
	name: string;
	chapter: string;
	sceneObject: SceneObject2D;
	time: type_time;
	duration: number;
	position?: type_keyframe_position2D;
	rotation?: type_keyframe_rotation2D;
	opacity?: number;
	scale?: number;
	custom?: type_custom;

	constructor(props: NodeMain2DProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneObject = props.sceneObject;
		this.time = props.time;
		this.duration = props.duration;
		this.position = props.position;
		this.rotation = props.rotation;
		this.opacity = props.opacity;
		this.scale = props.scale;
		this.custom = props.custom;
	}

	/**
	 * Gets the relative ID used for timing references.
	 * 
	 * @returns The node's name, which serves as the keyframe ID for relative timing.
	 */
	getRelativeID(): string {
		return this.name;
	}

	/**
	 * Reconciles this node into keyframes for the animation system.
	 * 
	 * @returns An array containing a single keyframe model representing this animation state.
	 * 
	 * @internal
	 */
	reconcile(): Array<type_keyframe_model2D> {
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
				scale: this.scale,
				custom: this.custom,
				chapter: this.chapter,
			},
		];
	}
}

