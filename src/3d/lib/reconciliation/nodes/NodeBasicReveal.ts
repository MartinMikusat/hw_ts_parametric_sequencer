import { Euler, Vector3 } from '../../math';
import type { SceneModel } from '../../types/types_sceneModel';
import type { type_keyframe_model, type_time } from '../keyframes/types';

/**
 * Properties required to create a NodeBasicReveal instance.
 * 
 * NodeBasicReveal creates a fade-in and position animation for revealing a model.
 */
export interface NodeBasicRevealProps {
	/** 
	 * Unique identifier for this node. Used as the keyframe ID and for relative timing references.
	 */
	name: string;
	
	/** 
	 * Chapter identifier for organizing animations into logical groups.
	 */
	chapter: string;
	
	/** 
	 * The SceneModel instance to reveal.
	 */
	sceneModel: SceneModel;
	
	/** 
	 * Duration of the reveal animation in seconds.
	 */
	duration: number;
	
	/** 
	 * Timing specification for when this reveal animation starts.
	 */
	time: type_time;
	
	/** 
	 * The starting position of the model before it's revealed.
	 */
	startingPosition: Vector3;
	
	/** 
	 * The starting rotation of the model before it's revealed.
	 */
	startingRotation: Euler;
}

/**
 * Represents a basic reveal animation node for 3D models.
 * 
 * NodeBasicReveal creates a fade-in effect combined with a position animation.
 * The model starts invisible at the starting position/rotation, then fades in
 * and animates to its current state over the specified duration.
 * 
 * @remarks
 * This node generates two keyframes:
 * 1. An initial keyframe with opacity 0 at the starting position
 * 2. A reveal keyframe with opacity 1 that inherits the current position/rotation
 * 
 * @example
 * ```typescript
 * const revealNode = new NodeBasicReveal({
 *   name: 'reveal-model1',
 *   chapter: 'intro',
 *   sceneModel: myModel,
 *   time: { type: 'absolute', value: 0 },
 *   duration: 1.5,
 *   startingPosition: new Vector3(-10, 0, 0),
 *   startingRotation: new Euler(0, 0, 0)
 * });
 * ```
 */
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
	 * Gets the relative ID used for timing references.
	 * 
	 * @returns The reveal keyframe ID, which can be referenced by other nodes for relative timing.
	 */
	getRelativeID(): string {
		return `${this.name}-reveal`;
	}

	/**
	 * Reconciles this node into keyframes for the animation system.
	 * 
	 * @returns An array containing two keyframes: initial state and reveal animation.
	 * 
	 * @internal
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

