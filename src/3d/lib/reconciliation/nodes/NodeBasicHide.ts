import { Euler, Vector3 } from '../../math';
import type { SceneModel } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_time } from '../keyframes/types';

export interface NodeBasicHideProps {
	name: string;
	chapter: string;
	sceneModel: SceneModel;
	duration: number;
	time: type_time;
	offsetPosition?: Vector3;
	offsetRotation?: Euler;
}

export class NodeBasicHide {
	name: string;
	chapter: string;
	sceneModel: SceneModel;
	duration: number;
	time: type_time;
	offsetPosition: Vector3;
	offsetRotation: Euler;

	constructor(props: NodeBasicHideProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneModel = props.sceneModel;
		this.duration = props.duration;
		this.time = props.time;
		this.offsetPosition = props.offsetPosition ?? new Vector3(0, 0, 0);
		this.offsetRotation = props.offsetRotation ?? new Euler(0, 0, 0);
	}

	/**
	 * Used for other keyframes to use as a reference when using relative time.
	 * @returns One of the IDs of the keyframes of this node.
	 */
	getRelativeID(): string {
		return `${this.name}-hide`;
	}

	/**
	 * Reconciles the node's properties into an array of keyframes representing its visible state and hide animation.
	 * @returns An array of keyframe models.
	 */
	reconcile(): Array<type_keyframe_model> {
		const keyframeID_hide = this.getRelativeID();
		const position = this.offsetPosition;
		const rotation = this.offsetRotation;

		return [
			{
				id: keyframeID_hide,
				sceneModel: this.sceneModel,
				time: this.time,
				opacity: 0.0,
				duration: this.duration,
				position: {
					type: 'relative',
					value: position,
				},
				rotation: {
					type: 'relative',
					value: rotation,
				},
				chapter: this.chapter,
			},
		];
	}
}

