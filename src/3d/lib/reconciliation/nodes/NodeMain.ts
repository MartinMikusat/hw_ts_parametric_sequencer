import type { SceneModel } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_keyframe_position, type_keyframe_rotation, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodePosition instance.
 */
export interface NodeMainProps {
	name: string;
	chapter: string;
	sceneModel: SceneModel;
	time: type_time;
	duration: number;
	position?: type_keyframe_position;
	rotation?: type_keyframe_rotation;
	opacity?: number;
}

/**
 * Represents a position node in the reconciliation process.
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
	 * Used for other keyframes to use as a reference when using relative time.
	 * @returns The node's name as the keyframe ID.
	 */
	getRelativeID(): string {
		return this.name;
	}

	/**
	 * Reconciles the position node's properties into an array of keyframes.
	 * @returns An array containing a single keyframe model representing the position state.
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

