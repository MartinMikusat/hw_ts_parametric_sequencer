import type { SceneObject2D } from '../../2d/lib/types/types_sceneModel';
import type { type_keyframe_model2D, type_time, type_custom } from '../../2d/lib/reconciliation/keyframes/types';

export interface NodeBasicHide2DProps {
	name: string;
	chapter: string;
	sceneObject: SceneObject2D;
	duration: number;
	time: type_time;
	custom?: type_custom;
}

export class NodeBasicHide2D {
	name: string;
	chapter: string;
	sceneObject: SceneObject2D;
	duration: number;
	time: type_time;
	custom?: type_custom;

	constructor(props: NodeBasicHide2DProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneObject = props.sceneObject;
		this.duration = props.duration;
		this.time = props.time;
		this.custom = props.custom;
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
				sceneObject: this.sceneObject,
				time: this.time,
				opacity: 0.0,
				duration: this.duration,
				custom: this.custom,
				chapter: this.chapter,
			},
		];
	}
}

