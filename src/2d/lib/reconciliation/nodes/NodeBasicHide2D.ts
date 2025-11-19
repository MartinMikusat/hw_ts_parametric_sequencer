import type { SceneModel2D } from '../../types/types_sceneModel';
import type { type_keyframe_model2D, type_time } from '../keyframes/types';

export interface NodeBasicHide2DProps {
	name: string;
	chapter: string;
	sceneModel: SceneModel2D;
	duration: number;
	time: type_time;
}

export class NodeBasicHide2D {
	name: string;
	chapter: string;
	sceneModel: SceneModel2D;
	duration: number;
	time: type_time;

	constructor(props: NodeBasicHide2DProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneModel = props.sceneModel;
		this.duration = props.duration;
		this.time = props.time;
	}

	/**
	 * Used for other keyframes to use as a reference when using relative time.
	 * @returns The node's name as the keyframe ID.
	 */
	getRelativeID(): string {
		return `${this.name}-hide`;
	}

	/**
	 * Reconciles the node's properties into an array of keyframes representing the hide animation.
	 * @returns An array of keyframe models.
	 */
	reconcile(): Array<type_keyframe_model2D> {
		const keyframeID = this.getRelativeID();

		return [
			{
				id: keyframeID,
				sceneModel: this.sceneModel,
				time: this.time,
				opacity: 0.0,
				duration: this.duration,
				chapter: this.chapter,
			},
		];
	}
}

