// 2D Math utilities
export * from './lib/math';

// 2D Types
export * from './lib/types/types';
export * from './lib/types/types_sceneModel';
export * from './lib/types/types_animationState';

// 2D Reconciliation (nodes, keyframes, animation state)
export * from './lib/reconciliation';

// 2D Scene reconciliation convenience function
export { reconcileScene2D, type SceneDefinition2D, type ReconciledScene2D } from './lib/reconcileScene2D';

// Re-export animation state types for convenience
export type {
	AnimationSnapshot2D,
	ModelAnimationState2D,
	CameraAnimationState2D,
} from './lib/types/types_animationState';

