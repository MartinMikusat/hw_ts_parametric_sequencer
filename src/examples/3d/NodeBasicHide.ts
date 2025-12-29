import { Euler, Vector3 } from '../../3d/lib/math';
import type { SceneObject } from '../../3d/lib/types/types_sceneModel';
import type { type_keyframe_model, type_time } from '../../3d/lib/reconciliation/keyframes/types';

/**
 * Properties required to create a NodeBasicHide instance.
 * 
 * NodeBasicHide creates a fade-out effect with optional position/rotation offset.
 */
export interface NodeBasicHideProps {
	/** 
	 * Unique identifier for this node. Used as the keyframe ID and for relative timing references.
	 */
	name: string;
	
	/** 
	 * Chapter identifier for organizing animations into logical groups.
	 */
	chapter: string;
	
	/** 
	 * The SceneObject instance to hide.
	 */
	sceneObject: SceneObject;
	
	/** 
	 * Duration of the hide animation in seconds.
	 */
	duration: number;
	
	/** 
	 * Timing specification for when this hide animation starts.
	 */
	time: type_time;
	
	/** 
	 * Optional position offset to apply while hiding. Defaults to (0, 0, 0).
	 */
	offsetPosition?: Vector3;
	
	/** 
	 * Optional rotation offset to apply while hiding. Defaults to (0, 0, 0).
	 */
	offsetRotation?: Euler;
}

/**
 * Represents a basic hide animation node for 3D objects.
 * 
 * NodeBasicHide creates a fade-out effect, optionally combined with a position/rotation offset.
 * The object fades from its current opacity to 0 over the specified duration.
 * 
 * @remarks
 * This node generates a single keyframe that sets opacity to 0 and applies
 * optional relative position/rotation offsets.
 * 
 * @example
 * ```typescript
 * const hideNode = new NodeBasicHide({
 *   name: 'hide-object1',
 *   chapter: 'outro',
 *   sceneObject: myObject,
 *   time: { type: 'absolute', value: 10 },
 *   duration: 1,
 *   offsetPosition: new Vector3(0, -5, 0), // Move down while hiding
 *   offsetRotation: new Euler(0, 180, 0) // Rotate while hiding
 * });
 * ```
 */
export class NodeBasicHide {
	name: string;
	chapter: string;
	sceneObject: SceneObject;
	duration: number;
	time: type_time;
	offsetPosition: Vector3;
	offsetRotation: Euler;

	constructor(props: NodeBasicHideProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneObject = props.sceneObject;
		this.duration = props.duration;
		this.time = props.time;
		this.offsetPosition = props.offsetPosition ?? new Vector3(0, 0, 0);
		this.offsetRotation = props.offsetRotation ?? new Euler(0, 0, 0);
	}

	/**
	 * Gets the relative ID used for timing references.
	 * 
	 * @returns The hide keyframe ID, which can be referenced by other nodes for relative timing.
	 */
	getRelativeID(): string {
		return `${this.name}-hide`;
	}

	/**
	 * Reconciles this node into keyframes for the animation system.
	 * 
	 * @returns An array containing a single keyframe for the hide animation.
	 * 
	 * @internal
	 */
	reconcile(): Array<type_keyframe_model> {
		const keyframeID_hide = this.getRelativeID();
		const position = this.offsetPosition;
		const rotation = this.offsetRotation;

		return [
			{
				id: keyframeID_hide,
				sceneObject: this.sceneObject,
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

