import type { Vector2 } from '../math/Vector2';

/**
 * State of a 2D model at a point in time
 */
export interface ModelAnimationState2D {
	opacity: number;
	position: Vector2;
	rotation: number; // Angle in degrees
	scale: number;
}

/**
 * State of the 2D camera at a point in time
 */
export interface CameraAnimationState2D {
	pan: Vector2;
	zoom: number;
	rotation: number; // Angle in degrees
}

/**
 * Complete animation snapshot for 2D scene
 */
export interface AnimationSnapshot2D {
	models: Map<string, ModelAnimationState2D>;
	camera: CameraAnimationState2D;
}

