import { Vector2 } from '../../math/Vector2';
import type { SceneModel2D, type_sceneModel_marker2D_withParent } from '../../types/types_sceneModel';
import type { type_keyframe_model2D, type_keyframes2D, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeToMarkerPosition2D instance.
 */
export interface NodeToMarkerPosition2DProps {
	name: string;
	chapter: string;
	sceneModel: SceneModel2D;
	time: type_time;
	marker: type_sceneModel_marker2D_withParent;
	offset_position: Vector2;
	offset_rotation?: number; // Angle in degrees
	// Optional slotting definition
	slotting?: {
		duration: number;
		delay: number;
		id?: string; // Optional custom ID for slotting keyframe
	};
	// Optional reveal definition
	reveal?: {
		duration: number;
		delay: number; // Delay is relative to initial keyframe end
	};
}

/**
 * Represents a node that moves a 2D scene model to a marker position, including reveal and slotting animations.
 */
export class NodeToMarkerPosition2D {
	name: string;
	chapter: string;
	sceneModel: SceneModel2D;
	time: type_time;
	marker: type_sceneModel_marker2D_withParent;
	offset_position: Vector2;
	offset_rotation: number;
	slotting: {
		duration: number;
		delay: number;
		id?: string;
	};
	reveal: {
		duration: number;
		delay: number;
	};

	constructor(props: NodeToMarkerPosition2DProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneModel = props.sceneModel;
		this.time = props.time;
		this.marker = props.marker;
		this.offset_position = props.offset_position;
		this.offset_rotation = props.offset_rotation ?? 0;
		this.slotting = props.slotting ?? {
			delay: 0,
			duration: 1,
		};
		this.reveal = props.reveal ?? {
			delay: 0,
			duration: 1,
		};
	}

	/**
	 * Used for other keyframes to use as a reference when using relative time.
	 * Defaults to `${this.name}-slotted` if no specific ID is provided in slotting props.
	 * @returns The relative ID string for the slotting keyframe.
	 */
	getRelativeID(): string {
		return this.slotting.id ?? `${this.name}-slotted`;
	}

	/**
	 * Reconciles the node's properties into an array of keyframes representing its initial state, reveal, and slotting animations.
	 * @returns An array of keyframe models.
	 */
	reconcile(): Array<type_keyframes2D> {
		const initialKeyframeID = `${this.name}-initial`;
		const revealKeyframeID = `${this.name}-reveal`;
		const slottingKeyframeID = this.getRelativeID();

		const offset_position = this.offset_position ?? new Vector2(0, 0);

		// Calculate the combined rotation (marker rotation + offset rotation)
		const combinedRotation = this.marker.rotation + this.offset_rotation;

		const reveal_duration = this.reveal.duration ?? 1;
		const reveal_delay = this.reveal.delay ?? 0; // Reveal delay relative to initial keyframe end

		console.assert(reveal_duration >= 0, 'Reveal duration must be greater or equal to 0');
		console.assert(reveal_delay >= 0, 'Reveal delay must be greater or equal to 0');

		const slotting_duration = this.slotting.duration ?? 1;
		const slotting_delay = this.slotting.delay ?? 0; // Slotting delay relative to reveal keyframe end

		console.assert(slotting_duration >= 0, 'Slotting duration must be greater or equal to 0');
		console.assert(slotting_delay >= 0, 'Slotting delay must be greater or equal to 0');

		// Safe add using clone()
		const initialPosition = this.marker.position.clone().add(offset_position);

		const keyframe_initial: type_keyframe_model2D = {
			id: initialKeyframeID,
			sceneModel: this.sceneModel,
			time: this.time,
			duration: 1 / 240, // Minimal duration for initial state
			opacity: 0,
			position: {
				type: 'marker',
				value: {
					position: initialPosition,
					rotation: combinedRotation,
					parent: this.marker.parent,
				},
			},
			// No chapter for initial invisible state usually
		};

		const keyframe_reveal: type_keyframe_model2D = {
			id: revealKeyframeID,
			sceneModel: this.sceneModel,
			time: {
				type: 'relative',
				value: {
					// Apply reveal_delay relative to the end of the initial keyframe
					offset: reveal_delay,
					parentID: initialKeyframeID,
					side: 'End',
				},
			},
			duration: reveal_duration,
			opacity: 1,
			chapter: this.chapter, // Reveal belongs to the chapter
		};

		const keyframe_slotting: type_keyframe_model2D = {
			id: slottingKeyframeID,
			sceneModel: this.sceneModel,
			time: {
				type: 'relative',
				value: {
					// Apply slotting_delay relative to the end of the reveal keyframe
					offset: slotting_delay,
					parentID: revealKeyframeID,
					side: 'End',
				},
			},
			duration: slotting_duration,
			opacity: 1, // Opacity remains 1 unless changed
			position: {
				type: 'marker',
				value: {
					position: this.marker.position,
					rotation: this.marker.rotation,
					parent: this.marker.parent,
				},
			},
			chapter: this.chapter, // Slotting also belongs to the chapter
		};

		return [keyframe_initial, keyframe_reveal, keyframe_slotting];
	}
}

