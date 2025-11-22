import { describe, it, expect } from 'vitest';
import { reconcile_animationState } from './reconcile_animationState';
import { Vector3, Quaternion, Euler } from '../../math';
import type { type_separatedKeyframes_extended } from '../keyframes/types';

describe('reconcile_animationState', () => {
    it('should interpolate position linearly', () => {
        const mockKeyframes: type_separatedKeyframes_extended = {
            modelKeyframes: [
                {
                    keyframe: {
                        id: 'kf1',
                        duration: 2,
                        time: { type: 'absolute', value: 0 },
                        sceneModel: { sceneModelID: 'model1' } as any,
                        position: { type: 'absolute', value: new Vector3(0, 0, 0) }
                    },
                    reconciled: { startTime: 0, endTime: 2 },
                    extended: { startTime: 0, endTime: 2 }
                },
                {
                    keyframe: {
                        id: 'kf2',
                        duration: 2,
                        time: { type: 'absolute', value: 2 },
                        sceneModel: { sceneModelID: 'model1' } as any,
                        position: { type: 'absolute', value: new Vector3(10, 0, 0) }
                    },
                    reconciled: { startTime: 2, endTime: 4 },
                    extended: { startTime: 2, endTime: 4 }
                }
            ],
            cameraKeyframes: []
        };

        // At time 1 (midpoint of first keyframe), position should be halfway to next keyframe?
        // Wait, the logic is: keyframe defines target state at end of duration?
        // Or keyframe defines state during its duration?
        // Let's check the logic in reconcile_animationState.ts
        // "processPosition... lerp(targetPosition, progression)"
        // It seems it interpolates FROM previous state TO current keyframe target state over duration.

        // Initial state is 0,0,0.
        // First keyframe: duration 2, target 0,0,0. So it stays at 0,0,0.

        const state1 = reconcile_animationState(mockKeyframes, 1);
        const model1 = state1.models.get('model1');
        expect(model1).toBeDefined();
        expect(model1?.position.x).toBeCloseTo(0);

        // Second keyframe: starts at 2, ends at 4. Target 10,0,0.
        // At time 3 (midpoint), it should be at 5,0,0 (lerp from 0 to 10).
        const state2 = reconcile_animationState(mockKeyframes, 3);
        const model2 = state2.models.get('model1');
        expect(model2?.position.x).toBeCloseTo(5);
    });

    it('should handle marker positioning', () => {
        const parentModel = { sceneModelID: 'parent' };
        const childModel = { sceneModelID: 'child' };

        const mockKeyframes: type_separatedKeyframes_extended = {
            modelKeyframes: [
                // Parent moves to (10, 0, 0) from t=0 to t=2
                {
                    keyframe: {
                        id: 'parent-move',
                        duration: 2,
                        time: { type: 'absolute', value: 0 },
                        sceneModel: parentModel as any,
                        position: { type: 'absolute', value: new Vector3(10, 0, 0) }
                    },
                    reconciled: { startTime: 0, endTime: 2 },
                    extended: { startTime: 0, endTime: 2 }
                },
                // Child attached to marker on parent from t=0 to t=2
                {
                    keyframe: {
                        id: 'child-attach',
                        duration: 2,
                        time: { type: 'absolute', value: 0 },
                        sceneModel: childModel as any,
                        position: {
                            type: 'marker',
                            value: {
                                position: new Vector3(0, 5, 0), // Offset (0, 5, 0) relative to parent
                                rotation: new Euler(0, 0, 0),
                                parent: parentModel as any
                            }
                        }
                    },
                    reconciled: { startTime: 0, endTime: 2 },
                    extended: { startTime: 0, endTime: 2 }
                }
            ],
            cameraKeyframes: []
        };

        // At t=2, parent is at (10, 0, 0).
        // Child should be at parent position + offset = (10, 5, 0).
        const state = reconcile_animationState(mockKeyframes, 2);

        const parentState = state.models.get('parent');
        expect(parentState?.position.x).toBeCloseTo(10);
        expect(parentState?.position.y).toBeCloseTo(0);

        const childState = state.models.get('child');
        expect(childState?.position.x).toBeCloseTo(10);
        expect(childState?.position.y).toBeCloseTo(5);
    });
});
