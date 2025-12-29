import { Euler, Vector3 } from '../../math';
import type { SceneObject } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeBasicUnhide instance.
 * 
 * NodeBasicUnhide makes a hidden object visible again with optional position/rotation offset.
 */
export interface NodeBasicUnhideProps {
	/** 
	 * Unique identifier for this node. Used as the keyframe ID and for relative timing references.
	 */
	name: string;
	
	/** 
	 * Chapter identifier for organizing animations into logical groups.
	 */
	chapter: string;
	
	/** 
	 * The SceneObject instance to unhide.
	 */
	sceneObject: SceneObject;
	
	/** 
	 * Duration of the unhide animation in seconds.
	 */
	duration: number;
	
	/** 
	 * Timing specification for when this unhide animation starts.
	 */
	time: type_time;
	
	/** 
	 * Position offset to apply when unhiding.
	 */
	offsetPosition: Vector3;
	
	/** 
	 * Rotation offset to apply when unhiding.
	 */
	offsetRotation: Euler;
}

/**
 * Represents a basic unhide animation node for 3D objects.
 * 
 * NodeBasicUnhide makes a previously hidden object visible again by setting opacity to 1.
 * It can optionally apply position and rotation offsets relative to the current state.
 * 
 * @remarks
 * This node generates a single keyframe that sets opacity to 1 and applies
 * relative position/rotation offsets.
 * 
 * @example
 * ```typescript
 * const unhideNode = new NodeBasicUnhide({
 *   name: 'unhide-object1',
 *   chapter: 'intro',
 *   sceneObject: myObject,
 *   time: { type: 'absolute', value: 5 },
 *   duration: 0.5,
 *   offsetPosition: new Vector3(0, 2, 0), // Move up when unhiding
 *   offsetRotation: new Euler(0, 0, 0)
 * });
 * ```
 */
export class NodeBasicUnhide {
	name: string;
	chapter: string;
	sceneObject: SceneObject;
	duration: number;
	time: type_time;
	offsetPosition: Vector3;
	offsetRotation: Euler;

	constructor(props: NodeBasicUnhideProps) {
		this.name = props.name;
		this.chapter = props.chapter;
		this.sceneObject = props.sceneObject;
		this.duration = props.duration;
		this.time = props.time;
		this.offsetPosition = props.offsetPosition;
		this.offsetRotation = props.offsetRotation;
	}

	/**
	 * Gets the relative ID used for timing references.
	 * 
	 * @returns The unhide keyframe ID, which can be referenced by other nodes for relative timing.
	 */
	getRelativeID(): string {
		return `${this.name}-unhide`;
	}

	/**
	 * Reconciles this node into keyframes for the animation system.
	 * 
	 * @returns An array containing a single keyframe for the unhide animation.
	 * 
	 * @internal
	 */
	reconcile(): Array<type_keyframe_model> {
		const unhideKeyframeID = this.getRelativeID();

		const position = this.offsetPosition ?? new Vector3(0, 0, 0);
		const rotation = this.offsetRotation ?? new Euler(0, 0, 0);

		return [
			{
				id: unhideKeyframeID,
				sceneObject: this.sceneObject,
				time: this.time,
				opacity: 1.0,
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

