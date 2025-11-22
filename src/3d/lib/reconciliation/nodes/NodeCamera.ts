import type { Vector3 } from '../../math';
import type { type_keyframe_camera, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeCamera instance.
 * 
 * NodeCamera animates the camera's rotation, target position, and zoom level.
 */
export interface NodeCameraProps {
	/** 
	 * Unique identifier for this node. Used as the keyframe ID and for relative timing references.
	 */
	name: string;
	
	/** 
	 * Chapter identifier for organizing animations into logical groups.
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
	 * Rotation angle around the X-axis in degrees. Positive values rotate upward (pitch).
	 */
	rotationX: number;
	
	/** 
	 * Rotation angle around the Y-axis in degrees. Positive values rotate to the right (yaw).
	 */
	rotationY: number;
	
	/** 
	 * The target point that the camera is looking at in 3D space.
	 */
	target: Vector3;
	
	/** 
	 * The zoom level. Values greater than 1 zoom in, values less than 1 zoom out.
	 */
	zoom: number;
}

/**
 * Represents a camera animation node.
 * 
 * NodeCamera is used to animate the camera's rotation, target position, and zoom level.
 * Camera animations are interpolated linearly between keyframes.
 * 
 * @example
 * ```typescript
 * const cameraNode = new NodeCamera({
 *   name: 'camera-intro',
 *   chapter: 'intro',
 *   time: { type: 'absolute', value: 0 },
 *   duration: 2,
 *   rotationX: 45,
 *   rotationY: -30,
 *   target: new Vector3(0, 0, 0),
 *   zoom: 1.2
 * });
 * ```
 */
export class NodeCamera {
	name: string;
	chapter: string;
	duration: number;
	time: type_time;
	rotationX: number;
	rotationY: number;
	target: Vector3;
	zoom: number;

	constructor(props: NodeCameraProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.duration = props.duration;
		this.time = props.time;
		this.rotationX = props.rotationX;
		this.rotationY = props.rotationY;
		this.target = props.target;
		this.zoom = props.zoom;
	}

	/**
	 * Reconciles this node into camera keyframes for the animation system.
	 * 
	 * @returns An array containing a single camera keyframe representing this camera state.
	 * 
	 * @internal
	 */
	reconcile(): Array<type_keyframe_camera> {
		const keyframes: Array<type_keyframe_camera> = [
			{
				id: this.name,
				chapter: this.chapter,
				time: this.time,
				rotationX: this.rotationX,
				rotationY: this.rotationY,
				target: this.target,
				zoom: this.zoom,
				duration: this.duration,
			},
		];

		return keyframes;
	}
}

