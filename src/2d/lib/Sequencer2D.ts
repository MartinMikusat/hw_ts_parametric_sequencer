import { reconcileKeyframes2D } from './reconciliation/keyframes/reconcileKeyframes2D';
import { reconcile_animationState2D, type AnimationSnapshot2D } from './reconciliation/animationState/reconcile_animationState2D';
import { keyframes_getSceneDuration2D } from './reconciliation/keyframes/keyframes_getSceneDuration';
import type { type_reconciliation_node2D } from './reconciliation/nodes/nodes_reconcile2D';
import type { type_separatedKeyframes_extended2D } from './reconciliation/keyframes/types';

/**
 * Definition of a 2D animation scene as an array of 2D nodes.
 * 
 * Each node in the array defines an animation instruction, such as moving a model,
 * animating the camera, or revealing/hiding models. Nodes can have relative timing
 * dependencies, allowing complex animation sequences to be defined declaratively.
 * 
 * @example
 * ```typescript
 * const scene: SceneDefinition2D = [
 *   new NodeMain2D({
 *     name: 'model1-move',
 *     sceneModel: model1,
 *     time: { type: 'absolute', value: 0 },
 *     duration: 2,
 *     position2D: { type: 'absolute', value: new Vector2(100, 50) }
 *   }),
 *   new NodeCamera2D({
 *     name: 'camera-pan',
 *     time: { type: 'relative', value: { offset: 0.5, side: 'Start', parentID: 'model1-move' } },
 *     duration: 1.5,
 *     pan: new Vector2(50, 0),
 *     zoom: 1.2
 *   })
 * ];
 * ```
 */
export type SceneDefinition2D = type_reconciliation_node2D[];

/**
 * Options for configuring a Sequencer2D instance.
 * 
 * @example
 * ```typescript
 * const sequencer = new Sequencer2D({
 *   onUpdate: (state) => {
 *     // Update your 2D scene with the animation state
 *     updateModels(state.models);
 *     updateCamera(state.camera);
 *   },
 *   onComplete: () => {
 *     console.log('Animation finished!');
 *   },
 *   loop: false
 * });
 * ```
 */
export type SequencerOptions2D = {
    /** 
     * Callback invoked on each animation frame with the current animation state.
     * 
     * This is called whenever the animation state changes, including:
     * - During playback (every frame)
     * - When seeking with setTime()
     * - When loading a new scene
     * - When stopping the animation
     * 
     * @param state - The current animation snapshot containing all model and camera states
     */
    onUpdate?: (state: AnimationSnapshot2D) => void;
    
    /** 
     * Callback invoked when animation completes.
     * 
     * This is called when the animation reaches the end (time >= duration).
     * If loop is enabled, this will be called each time the animation completes a cycle.
     */
    onComplete?: () => void;
    
    /** 
     * Whether to loop the animation when it reaches the end.
     * 
     * When true, the animation will automatically restart from time 0 after completing.
     * When false, the animation will pause at the end.
     * 
     * @defaultValue false
     */
    loop?: boolean;
};

/**
 * Main sequencer class for 2D parametric animations.
 * 
 * The Sequencer2D class manages animation playback, timing, and state updates for 2D scenes.
 * It processes scene definitions containing animation nodes, resolves timing dependencies,
 * and provides methods to control playback and query the current animation state.
 * 
 * @remarks
 * This class handles the complete animation pipeline:
 * 1. Loading scene definitions (via loadScene)
 * 2. Reconciling timing dependencies
 * 3. Interpolating animation states at any point in time
 * 4. Managing playback (play, pause, stop, seek)
 * 
 * The sequencer is framework-agnostic and only provides animation state data.
 * You must implement the rendering logic in your chosen 2D framework.
 * 
 * @example
 * ```typescript
 * import { Sequencer2D, NodeMain2D, Vector2 } from 'hw-ts-parametric-sequencer/2d';
 * 
 * const sequencer = new Sequencer2D({
 *   onUpdate: (state) => {
 *     // Update your 2D scene
 *     state.models.forEach((modelState, modelID) => {
 *       updateModelPosition(modelID, modelState.position2D);
 *       updateModelAngle(modelID, modelState.angle);
 *       updateModelOpacity(modelID, modelState.opacity);
 *       updateModelScale(modelID, modelState.scale);
 *     });
 *     updateCamera(state.camera);
 *   }
 * });
 * 
 * sequencer.loadScene(scene);
 * sequencer.play();
 * ```
 */
export class Sequencer2D {
	private _time = 0;
	private _duration = 0;
	private _isPlaying = false;
	private _animationFrameId: number | NodeJS.Timeout | null = null;
	private _previousFrameTime: number | undefined;
	
	private _keyframes: type_separatedKeyframes_extended2D | null = null;
    private _currentSceneObjects: Set<any> | null = null;
    
    private _options: SequencerOptions2D;

	/**
	 * Creates a new Sequencer2D instance.
	 * 
	 * @param options - Configuration options for the sequencer. All options are optional.
	 * 
	 * @example
	 * ```typescript
	 * // Basic usage with default options
	 * const sequencer = new Sequencer2D();
	 * 
	 * // With callbacks
	 * const sequencer = new Sequencer2D({
	 *   onUpdate: (state) => console.log('Frame updated'),
	 *   onComplete: () => console.log('Animation complete'),
	 *   loop: true
	 * });
	 * ```
	 */
	constructor(options: SequencerOptions2D = {}) {
        this._options = options;
    }

	/**
	 * Loads and reconciles a 2D scene definition.
	 * 
	 * This method processes all nodes in the scene, resolves timing dependencies,
	 * and prepares the scene for playback. If an animation is currently playing,
	 * it will be stopped before loading the new scene.
	 * 
	 * @param scene - Array of 2D animation nodes defining the scene
	 * 
	 * @remarks
	 * The reconciliation process:
	 * 1. Converts nodes into keyframes
	 * 2. Resolves relative timing dependencies
	 * 3. Extends keyframe durations to fill gaps
	 * 4. Sorts keyframes for marker-based positioning
	 * 5. Calculates the total scene duration
	 * 
	 * After loading, the animation time is reset to 0 and an initial state update
	 * is emitted via the onUpdate callback (if provided).
	 * 
	 * @example
	 * ```typescript
	 * const scene: SceneDefinition2D = [
	 *   new NodeMain2D({
	 *     name: 'move-model',
	 *     sceneModel: myModel,
	 *     time: { type: 'absolute', value: 0 },
	 *     duration: 2,
	 *     position2D: { type: 'absolute', value: new Vector2(100, 50) }
	 *   })
	 * ];
	 * 
	 * sequencer.loadScene(scene);
	 * console.log(`Scene duration: ${sequencer.duration}s`);
	 * ```
	 */
	loadScene(scene: SceneDefinition2D) {
		this.stop();
		const reconciled = reconcileKeyframes2D(scene);
		this._keyframes = reconciled;
        this._currentSceneObjects = reconciled.sceneObjects;
		this._duration = keyframes_getSceneDuration2D(reconciled);
		this._time = 0;
        
        // Emit initial state
        this._emitUpdate();
	}

	/**
	 * Gets the total duration of the loaded scene in seconds.
	 * 
	 * @returns The duration in seconds, or 0 if no scene is loaded.
	 * 
	 * @remarks
	 * The duration is calculated as the end time of the latest keyframe in the scene.
	 * This includes both the keyframe start time and its duration.
	 * 
	 * @example
	 * ```typescript
	 * sequencer.loadScene(scene);
	 * console.log(`Animation will run for ${sequencer.duration} seconds`);
	 * ```
	 */
	get duration() {
		return this._duration;
	}

	/**
	 * Gets the current playback time in seconds.
	 * 
	 * @returns The current time in seconds, clamped to the range [0, duration].
	 * 
	 * @remarks
	 * The time advances automatically during playback, or can be set manually
	 * using the setTime() method. The time is always clamped to valid bounds.
	 * 
	 * @example
	 * ```typescript
	 * sequencer.play();
	 * // ... later ...
	 * console.log(`Current time: ${sequencer.time}s / ${sequencer.duration}s`);
	 * ```
	 */
	get time() {
		return this._time;
	}

	/**
	 * Gets whether the animation is currently playing.
	 * 
	 * @returns `true` if the animation is currently playing, `false` otherwise.
	 * 
	 * @remarks
	 * This property is `true` when play() has been called and the animation
	 * is actively advancing. It becomes `false` when pause() or stop() is called,
	 * or when the animation reaches the end (unless looping is enabled).
	 * 
	 * @example
	 * ```typescript
	 * sequencer.play();
	 * if (sequencer.isPlaying) {
	 *   console.log('Animation is running');
	 * }
	 * ```
	 */
	get isPlaying() {
		return this._isPlaying;
	}
    
    /**
     * Gets the set of SceneObject2D instances in the current scene.
     * 
     * @returns A Set containing all SceneObject2D instances referenced in the loaded scene,
     *          or `null` if no scene is loaded.
     * 
     * @remarks
     * This set is populated when loadScene() is called. It contains all objects
     * that are referenced by nodes in the scene definition. You can use this to
     * iterate over all objects or check if a specific object is in the scene.
     * 
     * @example
     * ```typescript
     * sequencer.loadScene(scene);
     * const objects = sequencer.sceneObjects;
     * if (objects) {
     *   objects.forEach(object => {
     *     console.log(`Object: ${object.sceneObjectID}`);
     *   });
     * }
     * ```
     */
    get sceneObjects() {
        return this._currentSceneObjects;
    }

	/**
	 * Starts playing the animation from the current time position.
	 * 
	 * @remarks
	 * If no scene is loaded, this method logs a warning and does nothing.
	 * If the animation is already playing, this method does nothing.
	 * 
	 * During playback, the animation time advances automatically based on
	 * the elapsed time since the last frame. The onUpdate callback (if provided)
	 * will be called on each frame with the updated animation state.
	 * 
	 * The animation will automatically pause when it reaches the end, unless
	 * looping is enabled in the options.
	 * 
	 * @example
	 * ```typescript
	 * sequencer.loadScene(scene);
	 * sequencer.setTime(5); // Seek to 5 seconds
	 * sequencer.play(); // Start playing from 5 seconds
	 * ```
	 */
	play() {
		if (this._isPlaying) return;
		if (!this._keyframes) {
			console.warn('No scene loaded');
			return;
		}
		
		this._isPlaying = true;
		this._previousFrameTime = undefined;
		this._loop();
	}

	/**
	 * Pauses the animation at the current time position.
	 * 
	 * @remarks
	 * The animation can be resumed by calling play() again, which will continue
	 * from the current time position. The time position is preserved when pausing.
	 * 
	 * If the animation is not currently playing, this method does nothing.
	 * 
	 * @example
	 * ```typescript
	 * sequencer.play();
	 * // ... later ...
	 * sequencer.pause(); // Pause at current time
	 * sequencer.play(); // Resume from same position
	 * ```
	 */
	pause() {
		this._isPlaying = false;
		if (this._animationFrameId !== null) {
            if (typeof requestAnimationFrame !== 'undefined') {
			    cancelAnimationFrame(this._animationFrameId as number);
            } else {
                clearTimeout(this._animationFrameId as NodeJS.Timeout);
            }
			this._animationFrameId = null;
		}
		this._previousFrameTime = undefined;
	}

	/**
	 * Stops the animation and resets the time to 0.
	 * 
	 * @remarks
	 * This is equivalent to calling pause() followed by setTime(0).
	 * After stopping, calling play() will start the animation from the beginning.
	 * 
	 * An update is emitted after stopping to reflect the reset state.
	 * 
	 * @example
	 * ```typescript
	 * sequencer.play();
	 * // ... later ...
	 * sequencer.stop(); // Stop and reset to beginning
	 * sequencer.play(); // Start from beginning
	 * ```
	 */
	stop() {
		this.pause();
		this._time = 0;
        this._emitUpdate();
	}

	/**
	 * Seeks to a specific time in the animation.
	 * 
	 * @param time - The target time in seconds. Will be clamped to the valid range [0, duration].
	 * 
	 * @remarks
	 * This method immediately updates the animation state to the specified time,
	 * regardless of whether the animation is playing or paused. The time is always
	 * clamped to valid bounds to prevent out-of-range values.
	 * 
	 * An update is emitted after seeking to reflect the new animation state.
	 * 
	 * @example
	 * ```typescript
	 * sequencer.loadScene(scene);
	 * sequencer.setTime(5.5); // Jump to 5.5 seconds
	 * const state = sequencer.getAnimationState();
	 * // state now reflects the animation at 5.5 seconds
	 * ```
	 */
	setTime(time: number) {
		this._time = Math.max(0, Math.min(time, this._duration));
        this._emitUpdate();
	}

	/**
	 * Gets the current animation state snapshot.
	 * 
	 * @returns AnimationSnapshot2D containing the state of all models and camera at the current time,
	 *          or `null` if no scene is loaded.
	 * 
	 * @remarks
	 * This method calculates the interpolated animation state at the current time position.
	 * The state includes:
	 * - All model states (position2D, angle, opacity, scale) as a Map keyed by sceneModelID
	 * - Camera state (pan, zoom, rotation)
	 * 
	 * The state is calculated by interpolating between keyframes based on the current time.
	 * This method can be called at any time, even when the animation is paused.
	 * 
	 * @example
	 * ```typescript
	 * sequencer.setTime(2.5);
	 * const state = sequencer.getAnimationState();
	 * if (state) {
	 *   // Access model states
	 *   state.models.forEach((modelState, modelID) => {
	 *     console.log(`${modelID}:`, modelState.position2D);
	 *   });
	 *   // Access camera state
	 *   console.log('Camera:', state.camera);
	 * }
	 * ```
	 */
	getAnimationState(): AnimationSnapshot2D | null {
		if (!this._keyframes) return null;
		return reconcile_animationState2D(this._keyframes, this._time);
	}
    
    private _emitUpdate() {
        if (this._options.onUpdate && this._keyframes) {
            const state = this.getAnimationState();
            if (state) {
                this._options.onUpdate(state);
            }
        }
    }

	private _loop = () => {
		if (!this._isPlaying) return;

        const loopCallback = (timestamp: number) => {
            if (!this._isPlaying) return;

			if (this._previousFrameTime === undefined) {
				this._previousFrameTime = timestamp;
			}

			const deltaTime = (timestamp - this._previousFrameTime) / 1000;
			this._previousFrameTime = timestamp;

			const nextTime = this._time + deltaTime;

			if (nextTime >= this._duration) {
				this._time = this._duration;
                this._emitUpdate();
                
                // Pause at the end instead of stopping (which resets time)
				this.pause();
                
                if (this._options.onComplete) {
                    this._options.onComplete();
                }
                // Optional looping if we want to support it later
                if (this._options.loop) {
                    this._time = 0;
                    this.play();
                }
			} else {
				this._time = nextTime;
                this._emitUpdate();
				this._loop();
			}
        };

        if (typeof requestAnimationFrame !== 'undefined') {
		    this._animationFrameId = requestAnimationFrame(loopCallback);
        } else {
            // Fallback for Node.js / non-browser environments
            // Use 60fps (approx 16ms)
            const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
            this._animationFrameId = setTimeout(() => {
                loopCallback(now + 16);
            }, 16);
        }
	};
}

