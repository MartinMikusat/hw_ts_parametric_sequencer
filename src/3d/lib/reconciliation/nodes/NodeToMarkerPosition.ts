import { Euler, Quaternion, Vector3 } from '../../math';
import { rad2deg } from '../../utils/deg2rad';
import type { SceneObject, type_sceneObject_marker_withParent } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_keyframes, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeToMarkerPosition instance.
 * 
 * NodeToMarkerPosition positions an object relative to a marker on another object, with optional reveal and slotting animations.
 */
export interface NodeToMarkerPositionProps {
	/** 
	 * Unique identifier for this node. Used as the keyframe ID and for relative timing references.
	 */
	name: string;
	
	/** 
	 * Chapter identifier for organizing animations into logical groups.
	 */
	chapter: string;
	
	/** 
	 * The SceneObject instance to position.
	 */
	sceneObject: SceneObject;
	
	/** 
	 * Timing specification for when this animation starts.
	 */
	time: type_time;
	
	/** 
	 * The marker on the parent object to position relative to.
	 * Must include parent reference for hierarchical positioning.
	 */
	marker: type_sceneObject_marker_withParent;
	
	/** 
	 * Position offset relative to the marker's position.
	 */
	offset_position: Vector3;
	
	/** 
	 * Optional rotation offset relative to the marker's rotation.
	 * Defaults to (0, 0, 0) if not specified.
	 */
	offset_rotation?: Euler;
	
	/** 
	 * Optional slotting animation configuration.
	 * Slotting is the final animation that positions the object precisely at the marker.
	 */
	slotting?: {
		/** Duration of the slotting animation in seconds. */
		duration: number;
		/** Delay before slotting starts, relative to reveal keyframe end. */
		delay: number;
		/** Optional custom ID for the slotting keyframe. Defaults to `${name}-slotted`. */
		id?: string;
	};
	
	/** 
	 * Optional reveal animation configuration.
	 * Reveal makes the object visible before slotting.
	 */
	reveal?: {
		/** Duration of the reveal animation in seconds. */
		duration: number;
		/** Delay before reveal starts, relative to initial keyframe end. */
		delay: number;
	};
}

/**
 * Represents a node that positions an object relative to a marker on another object.
 * 
 * NodeToMarkerPosition creates a hierarchical positioning animation where an object is positioned
 * relative to a marker on a parent object. This enables complex assembly animations where parts
 * attach to other parts.
 * 
 * @remarks
 * This node generates three keyframes:
 * 1. Initial state: Object is invisible at the marker position with offset
 * 2. Reveal: Object fades in (if reveal is configured)
 * 3. Slotting: Object animates to the final marker position
 * 
 * The marker's position and rotation are transformed by the parent object's transform,
 * creating hierarchical positioning in 3D space.
 * 
 * @example
 * ```typescript
 * const marker = parentObject.getMarker('attachment-point');
 * const node = new NodeToMarkerPosition({
 *   name: 'attach-part',
 *   chapter: 'assembly',
 *   sceneObject: partObject,
 *   time: { type: 'absolute', value: 5 },
 *   marker: marker,
 *   offset_position: new Vector3(0, 0, 0),
 *   offset_rotation: new Euler(0, 0, 0),
 *   reveal: {
 *     duration: 0.5,
 *     delay: 0
 *   },
 *   slotting: {
 *     duration: 1,
 *     delay: 0.2
 *   }
 * });
 * ```
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
	sceneObject: SceneObject;
	time: type_time;
	marker: type_sceneObject_marker_withParent;
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
		this.sceneObject = props.sceneObject;
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
	 * Gets the relative ID used for timing references.
	 * 
	 * @returns The slotting keyframe ID, which can be referenced by other nodes for relative timing.
	 *          Defaults to `${name}-slotted` if no custom ID is provided in slotting configuration.
	 */
	getRelativeID(): string {
		return this.slotting.id ?? `${this.name}-slotted`;
	}

	/**
	 * Reconciles this node into keyframes for the animation system.
	 * 
	 * @returns An array containing three keyframes: initial state, reveal, and slotting animations.
	 * 
	 * @internal
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
			sceneObject: this.sceneObject,
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
			sceneObject: this.sceneObject,
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
			sceneObject: this.sceneObject,
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
