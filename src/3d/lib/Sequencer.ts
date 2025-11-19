import { reconcileKeyframes } from './reconciliation/keyframes/reconcileKeyframes';
import { reconcile_animationState, type AnimationSnapshot3D } from './reconciliation/animationState/reconcile_animationState';
import { keyframes_getSceneDuration } from './reconciliation/keyframes/keyframes_getSceneDuration';
import type { type_reconciliation_node } from './reconciliation/nodes/nodes_reconcile';
import type { type_separatedKeyframes_extended } from './reconciliation/keyframes/types';

/**
 * Definition of a 3D animation scene as an array of 3D nodes.
 */
export type SceneDefinition3D = type_reconciliation_node[];

/**
 * Options for configuring a Sequencer3D instance.
 */
export type SequencerOptions3D = {
    /** Callback invoked on each animation frame with the current animation state */
    onUpdate?: (state: AnimationSnapshot3D) => void;
    /** Callback invoked when animation completes */
    onComplete?: () => void;
    /** Whether to loop the animation when it reaches the end */
    loop?: boolean;
};

/**
 * Main sequencer class for 3D parametric animations.
 * Manages animation playback, timing, and state updates for 3D scenes.
 */
export class Sequencer3D {
	private _time = 0;
	private _duration = 0;
	private _isPlaying = false;
	private _animationFrameId: number | NodeJS.Timeout | null = null;
	private _previousFrameTime: number | undefined;
	
	private _keyframes: type_separatedKeyframes_extended | null = null;
    private _currentSceneModels: Set<any> | null = null;
    
    private _options: SequencerOptions3D;

	/**
	 * Creates a new Sequencer3D instance.
	 * @param options Configuration options for the sequencer
	 */
	constructor(options: SequencerOptions3D = {}) {
        this._options = options;
    }

	/**
	 * Loads and reconciles a 3D scene definition.
	 * This processes all nodes, resolves timing dependencies, and prepares the scene for playback.
	 * @param scene Array of 3D animation nodes defining the scene
	 */
	loadScene(scene: SceneDefinition3D) {
		this.stop();
		const reconciled = reconcileKeyframes(scene);
		this._keyframes = reconciled;
        this._currentSceneModels = reconciled.sceneModels;
		this._duration = keyframes_getSceneDuration(reconciled);
		this._time = 0;
        
        // Emit initial state
        this._emitUpdate();
	}

	/**
	 * Gets the total duration of the loaded scene in seconds.
	 */
	get duration() {
		return this._duration;
	}

	/**
	 * Gets the current playback time in seconds.
	 */
	get time() {
		return this._time;
	}

	/**
	 * Gets whether the animation is currently playing.
	 */
	get isPlaying() {
		return this._isPlaying;
	}
    
    /**
     * Gets the set of SceneModel instances in the current scene.
     */
    get sceneModels() {
        return this._currentSceneModels;
    }

	/**
	 * Starts playing the animation from the current time position.
	 * If no scene is loaded, logs a warning and does nothing.
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
	 * The animation can be resumed by calling play() again.
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
	 * This is equivalent to calling pause() followed by setTime(0).
	 */
	stop() {
		this.pause();
		this._time = 0;
        this._emitUpdate();
	}

	/**
	 * Seeks to a specific time in the animation.
	 * The time will be clamped to the valid range [0, duration].
	 * @param time The target time in seconds
	 */
	setTime(time: number) {
		this._time = Math.max(0, Math.min(time, this._duration));
        this._emitUpdate();
	}

	/**
	 * Gets the current animation state snapshot.
	 * Returns null if no scene is loaded.
	 * @returns AnimationSnapshot3D containing the state of all models and camera, or null if no scene loaded
	 */
	getAnimationState(): AnimationSnapshot3D | null {
		if (!this._keyframes) return null;
		return reconcile_animationState(this._keyframes, this._time);
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
