import type { SceneModel2D } from '../../types/types_sceneModel';
import type { type_keyframe_model2D, type_keyframe_position2D, type_keyframe_rotation2D, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeMain2D instance.
 */
export interface NodeMain2DProps {
	name: string;
	chapter: string;
	sceneModel: SceneModel2D;
	time: type_time;
	duration: number;
	position?: type_keyframe_position2D;
	rotation?: type_keyframe_rotation2D;
	opacity?: number;
	scale?: number;
}

/**
 * Represents a main 2D animation node in the reconciliation process.
 */
export class NodeMain2D {
	name: string;
	chapter: string;
	sceneModel: SceneModel2D;
	time: type_time;
	duration: number;
	position?: type_keyframe_position2D;
	rotation?: type_keyframe_rotation2D;
	opacity?: number;
	scale?: number;

	constructor(props: NodeMain2DProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneModel = props.sceneModel;
		this.time = props.time;
		this.duration = props.duration;
		this.position = props.position;
		this.rotation = props.rotation;
		this.opacity = props.opacity;
		this.scale = props.scale;
	}

	/**
	 * Used for other keyframes to use as a reference when using relative time.
	 * @returns The node's name as the keyframe ID.
	 */
	getRelativeID(): string {
		return this.name;
	}

	/**
	 * Reconciles the node's properties into an array of keyframes.
	 * @returns An array containing a single keyframe model representing the 2D state.
	 */
	reconcile(): Array<type_keyframe_model2D> {
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
				scale: this.scale,
				chapter: this.chapter,
			},
		];
	}
}

