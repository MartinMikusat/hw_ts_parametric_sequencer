import { reconcileKeyframes } from './reconciliation/keyframes/reconcileKeyframes';
import { reconcile_animationState, type AnimationSnapshot } from './reconciliation/animationState/reconcile_animationState';
import { keyframes_getSceneDuration } from './reconciliation/keyframes/keyframes_getSceneDuration';
import type { type_reconciliation_node } from './reconciliation/nodes/nodes_reconcile';
import type { type_separatedKeyframes_extended } from './reconciliation/keyframes/types';

export type SceneDefinition = type_reconciliation_node[];

export type SequencerOptions = {
    onUpdate?: (state: AnimationSnapshot) => void;
    onComplete?: () => void;
    loop?: boolean;
};

export class Sequencer {
	private _time = 0;
	private _duration = 0;
	private _isPlaying = false;
	private _animationFrameId: number | NodeJS.Timeout | null = null;
	private _previousFrameTime: number | undefined;
	
	private _keyframes: type_separatedKeyframes_extended | null = null;
    private _currentSceneModels: Set<any> | null = null;
    
    private _options: SequencerOptions;

	constructor(options: SequencerOptions = {}) {
        this._options = options;
    }

	loadScene(scene: SceneDefinition) {
		this.stop();
		const reconciled = reconcileKeyframes(scene);
		this._keyframes = reconciled;
        this._currentSceneModels = reconciled.sceneModels;
		this._duration = keyframes_getSceneDuration(reconciled);
		this._time = 0;
        
        // Emit initial state
        this._emitUpdate();
	}

	get duration() {
		return this._duration;
	}

	get time() {
		return this._time;
	}

	get isPlaying() {
		return this._isPlaying;
	}
    
    get sceneModels() {
        return this._currentSceneModels;
    }

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

	stop() {
		this.pause();
		this._time = 0;
        this._emitUpdate();
	}

	setTime(time: number) {
		this._time = Math.max(0, Math.min(time, this._duration));
        this._emitUpdate();
	}

	getAnimationState(): AnimationSnapshot | null {
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
