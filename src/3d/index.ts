// 3D Math utilities
export * from './lib/math';

// 3D Types
export * from './lib/types/types';
export * from './lib/types/types_sceneModel';

// 3D Reconciliation (nodes, keyframes, animation state)
export * from './lib/reconciliation';

// 3D Scene reconciliation convenience function
export { reconcileScene, type SceneDefinition3D, type ReconciledScene3D } from './lib/reconcileScene';

// Re-export animation state types for convenience
export type {
	AnimationSnapshot3D,
	ModelAnimationState3D,
	CameraAnimationState3D,
} from './lib/reconciliation/animationState/reconcile_animationState';

