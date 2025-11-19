import { Euler, Quaternion, Vector3 } from '../../math';
import { rad2deg } from '../../utils/deg2rad';
import type { SceneModel, type_sceneModel_marker_withParent } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_keyframes, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeToMarkerPosition instance.
 */
export interface NodeToMarkerPositionProps {
	name: string;
	chapter: string;
	sceneModel: SceneModel;
	time: type_time;
	marker: type_sceneModel_marker_withParent;
	offset_position: Vector3;
	offset_rotation?: Euler;
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
 * Represents a node that moves a scene model to a marker position, including reveal and slotting animations.
 */
// Helper: convert a degrees-based Euler-ish input (plain object or Euler) to a radians Euler
const toRadiansEuler = (deg: { x: number; y: number; z: number; order?: Euler['order'] } | Euler): Euler => {
	return new Euler(
		(deg.x * Math.PI) / 180,
		(deg.y * Math.PI) / 180,
		(deg.z * Math.PI) / 180,
		('order' in deg && deg.order) ? deg.order : 'XYZ'
	);
};

export class NodeToMarkerPosition {
	name: string;
	chapter: string;
	sceneModel: SceneModel;
	time: type_time;
	marker: type_sceneModel_marker_withParent;
	offset_position: Vector3;
	offset_rotation?: Euler;
	slotting: {
		duration: number;
		delay: number;
		id?: string;
	};
	reveal: {
		duration: number;
		delay: number;
	};

	constructor(props: NodeToMarkerPositionProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneModel = props.sceneModel;
		this.time = props.time;
		this.marker = props.marker;
		this.offset_position = props.offset_position;
		this.offset_rotation = props.offset_rotation ?? new Euler(0, 0, 0);
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
	reconcile(): Array<type_keyframes> {
		const initialKeyframeID = `${this.name}-initial`;
		const revealKeyframeID = `${this.name}-reveal`;
		const slottingKeyframeID = this.getRelativeID();

		const offset_position = this.offset_position ?? new Vector3(0, 0, 0);

		// ---------------------------------------
		// Calculate the summed up offset rotation
		const offset_rotation = this.offset_rotation ?? new Euler(0, 0, 0);
		// Convert degrees to radians (runtime requirement: all rotations are specified in DEGREES)
		const offset_rotation_rad = toRadiansEuler(offset_rotation);
		const marker_rotation_rad = toRadiansEuler(this.marker.rotation);
		const quaternion_offset = new Quaternion().setFromEuler(offset_rotation_rad);
		const quaternion_marker = new Quaternion().setFromEuler(marker_rotation_rad);
		
		// Use clone to avoid mutation if multiply was in-place (it is in my implementation)
		const combinedQuaternion = quaternion_marker.clone().multiply(quaternion_offset); 
		const combinedEuler = new Euler().setFromQuaternion(combinedQuaternion);
		// Calculate the summed up offset rotation
		// ---------------------------------------

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

        // Convert radians back to degrees for the keyframe, to match the contract that keyframes store degrees.
        // The reconcile_animationState function expects degrees for plain objects.
        const rotationInDegrees = {
            x: rad2deg(combinedEuler.x),
            y: rad2deg(combinedEuler.y),
            z: rad2deg(combinedEuler.z)
        };

        // Marker rotations are also defined in DEGREES across the codebase.
        const markerRotationDegrees = {
            x: this.marker.rotation.x,
            y: this.marker.rotation.y,
            z: this.marker.rotation.z
        };

		const keyframe_initial: type_keyframe_model = {
			id: initialKeyframeID,
			sceneModel: this.sceneModel,
			time: this.time,
			duration: 1 / 240, // Minimal duration for initial state
			opacity: 0,
			position: {
				type: 'marker',
				value: {
					position: initialPosition,
					rotation: rotationInDegrees as unknown as Euler, // Cast to satisfy strict type but deliver degrees
					parent: this.marker.parent,
				},
			},
			// No chapter for initial invisible state usually
		};

		const keyframe_reveal: type_keyframe_model = {
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

		const keyframe_slotting: type_keyframe_model = {
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
                    rotation: markerRotationDegrees as unknown as Euler, // Cast to satisfy strict type but deliver degrees
                    parent: this.marker.parent,
                },
			},
			chapter: this.chapter, // Slotting also belongs to the chapter
		};

		return [keyframe_initial, keyframe_reveal, keyframe_slotting];
	}
}
