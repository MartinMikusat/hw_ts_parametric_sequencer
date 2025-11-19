import { Euler, Vector3 } from '../../math';
import type { SceneModel } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_time } from '../keyframes/types';

export interface NodeBasicRevealProps {
	name: string;
	chapter: string; 
	sceneModel: SceneModel;
	duration: number;
	time: type_time;
	startingPosition: Vector3;
	startingRotation: Euler;
}

export class NodeBasicReveal {
	name: string;
	chapter: string;
	sceneModel: SceneModel;
	duration: number;
	time: type_time;
	startingPosition: Vector3;
	startingRotation: Euler;

	constructor(props: NodeBasicRevealProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneModel = props.sceneModel;
		this.duration = props.duration;
		this.time = props.time;
		this.startingPosition = props.startingPosition;
		this.startingRotation = props.startingRotation;
	}

	/**
	 * Used for other keyframes to use as a reference when using relative time.
	 * @returns One of the IDs of the keyframes of this node.
	 */
	getRelativeID(): string {
		return `${this.name}-reveal`;
	}

	/**
	 * Reconciles the node's properties into an array of keyframes representing its initial state and reveal animation.
	 * @returns An array of keyframe models.
	 */
	reconcile(): Array<type_keyframe_model> {
		const initialKeyframeID = `${this.name}-initial`;
		const revealKeyframeID = this.getRelativeID();

		return [
			{
				id: initialKeyframeID,
				sceneModel: this.sceneModel,
				time: this.time,
				opacity: 0.0,
				duration: 1 / 240, // Keep specific duration for initial state
				position: {
					type: 'absolute',
					value: this.startingPosition,
				},
				rotation: {
					type: 'absolute',
					value: this.startingRotation,
				},
				chapter: this.chapter,
			},
			{
				id: revealKeyframeID,
				sceneModel: this.sceneModel,
				time: this.time, // Reveal starts at the same time
				opacity: 1.0,
				duration: this.duration, // Use the node's duration for the reveal
				chapter: this.chapter,
				// Position and rotation are inherited from the previous keyframe unless specified
			},
		];
	}
}

