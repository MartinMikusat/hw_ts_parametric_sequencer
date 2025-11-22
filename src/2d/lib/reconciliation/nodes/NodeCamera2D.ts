import type { Vector2 } from '../../math/Vector2';
import type { type_keyframe_camera2D, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeCamera2D instance.
 * 
 * NodeCamera2D animates the camera's pan, zoom, and rotation.
 */
export interface NodeCamera2DProps {
	/** 
	 * Unique identifier for this node.
	 */
	name: string;
	
	/** 
	 * Chapter identifier for organizing animations.
	 */
	chapter: string;
	
	/** 
	 * Duration of this camera animation in seconds.
	 */
	duration: number;
	
	/** 
	 * Timing specification for when this camera animation starts.
	 */
	time: type_time;
	
	/** 
	 * The pan offset of the camera in 2D space.
	 */
	pan: Vector2;
	
	/** 
	 * The zoom level. Values > 1 zoom in, values < 1 zoom out.
	 */
	zoom: number;
	
	/** 
	 * The rotation angle of the camera in degrees.
	 */
	rotation: number;
}

/**
 * Represents a camera animation node for 2D scenes.
 * 
 * NodeCamera2D is used to animate the camera's pan, zoom, and rotation.
 * Camera animations are interpolated linearly between keyframes.
 * 
 * @example
 * ```typescript
 * const cameraNode = new NodeCamera2D({
 *   name: 'camera-intro',
 *   chapter: 'intro',
 *   time: { type: 'absolute', value: 0 },
 *   duration: 2,
 *   pan: new Vector2(50, 0),
 *   zoom: 1.2,
 *   rotation: 15
 * });
 * ```
 */
export class NodeCamera2D {
	name: string;
	chapter: string;
	duration: number;
	time: type_time;
	pan: Vector2;
	zoom: number;
	rotation: number;

	constructor(props: NodeCamera2DProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.duration = props.duration;
		this.time = props.time;
		this.pan = props.pan;
		this.zoom = props.zoom;
		this.rotation = props.rotation;
	}

	/**
	 * Reconciles this node into camera keyframes for the animation system.
	 * 
	 * @returns An array containing a single camera keyframe representing this camera state.
	 * 
	 * @internal
	 */
	reconcile(): Array<type_keyframe_camera2D> {
		const keyframes: Array<type_keyframe_camera2D> = [
			{
				id: this.name,
				chapter: this.chapter,
				time: this.time,
				pan: this.pan,
				zoom: this.zoom,
				rotation: this.rotation,
				duration: this.duration,
			},
		];

		return keyframes;
	}
}

