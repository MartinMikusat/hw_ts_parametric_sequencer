import type { Vector2 } from '../../math/Vector2';
import type { type_keyframe_camera2D, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeCamera2D instance.
 */
export interface NodeCamera2DProps {
	name: string;
	chapter: string;
	duration: number;
	time: type_time;
	pan: Vector2;
	zoom: number;
	rotation: number; // Angle in degrees
}

/**
 * Represents a 2D camera node in the reconciliation process.
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
	 * Reconciles the camera node's properties into an array of camera keyframes.
	 * @returns An array containing a single camera keyframe representing the 2D camera state.
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

