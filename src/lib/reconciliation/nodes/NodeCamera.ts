import type { Vector3 } from '../../math';
import type { type_keyframe_camera, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeCamera instance.
 */
export interface NodeCameraProps {
	name: string;
	chapter: string;
	duration: number;
	time: type_time;
	rotationX: number;
	rotationY: number;
	target: Vector3;
	zoom: number;
}

/**
 * Represents a camera node in the reconciliation process.
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
	 * Reconciles the camera node's properties into an array of camera keyframes.
	 * @returns An array containing a single camera keyframe model representing the initial state.
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

