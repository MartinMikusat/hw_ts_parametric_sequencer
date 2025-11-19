import { Vector2 } from '../../math/Vector2';
import type { SceneModel2D } from '../../types/types_sceneModel';
import type { type_keyframe_model2D, type_time } from '../keyframes/types';

export interface NodeBasicReveal2DProps {
	name: string;
	chapter: string;
	sceneModel: SceneModel2D;
	duration: number;
	time: type_time;
	startingPosition: Vector2;
	startingRotation: number; // Angle in degrees
	startingScale?: number;
}

export class NodeBasicReveal2D {
	name: string;
	chapter: string;
	sceneModel: SceneModel2D;
	duration: number;
	time: type_time;
	startingPosition: Vector2;
	startingRotation: number;
	startingScale: number;

	constructor(props: NodeBasicReveal2DProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneModel = props.sceneModel;
		this.duration = props.duration;
		this.time = props.time;
		this.startingPosition = props.startingPosition;
		this.startingRotation = props.startingRotation;
		this.startingScale = props.startingScale ?? 1.0;
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
	reconcile(): Array<type_keyframe_model2D> {
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
				scale: this.startingScale,
				chapter: this.chapter,
			},
			{
				id: revealKeyframeID,
				sceneModel: this.sceneModel,
				time: this.time, // Reveal starts at the same time
				opacity: 1.0,
				duration: this.duration, // Use the node's duration for the reveal
				chapter: this.chapter,
				// Position, rotation, and scale are inherited from the previous keyframe unless specified
			},
		];
	}
}

