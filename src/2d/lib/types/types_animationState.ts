import type { Vector2 } from '../math/Vector2';

/**
 * Represents the animation state of a single 2D model at a specific point in time.
 * 
 * @remarks
 * This state is calculated by interpolating between keyframes based on the current time.
 * All values are interpolated smoothly using linear interpolation for positions/opacity/scale
 * and shortest-arc interpolation for angles.
 */
export interface ModelAnimationState2D {
	/** 
	 * The opacity of the model, ranging from 0 (fully transparent) to 1 (fully opaque).
	 * Defaults to 1 if not specified in any keyframe.
	 */
	opacity: number;
	
	/** 
	 * The 2D position of the model in world space.
	 * This is the interpolated position based on position keyframes.
	 */
	position: Vector2;
	
	/** 
	 * The rotation angle of the model in degrees.
	 * Interpolated using shortest-arc interpolation for smooth rotation transitions.
	 */
	rotation: number;
	
	/** 
	 * The scale factor of the model.
	 * Values greater than 1 enlarge the model, values less than 1 shrink it.
	 * Defaults to 1 if not specified.
	 */
	scale: number;
}

/**
 * Represents the animation state of the camera at a specific point in time.
 * 
 * @remarks
 * The camera state controls the viewport transformation in 2D space.
 * All values are interpolated linearly between keyframes.
 */
export interface CameraAnimationState2D {
	/** 
	 * The pan offset of the camera in 2D space.
	 * This shifts the viewport's center point.
	 * 
	 * @defaultValue Vector2(0, 0)
	 */
	pan: Vector2;
	
	/** 
	 * The zoom level of the camera.
	 * Values greater than 1 zoom in, values less than 1 zoom out.
	 * 
	 * @defaultValue 1.0
	 */
	zoom: number;
	
	/** 
	 * The rotation angle of the camera in degrees.
	 * Rotates the entire viewport around the pan point.
	 * 
	 * @defaultValue 0
	 */
	rotation: number;
}

/**
 * Complete animation state snapshot at a specific point in time.
 * 
 * Contains the interpolated state of all models and the camera for a given time.
 * This is the primary output of the animation system and is used to update
 * the visual representation of the scene.
 * 
 * @example
 * ```typescript
 * const snapshot = sequencer.getAnimationState();
 * if (snapshot) {
 *   // Update all models
 *   snapshot.models.forEach((modelState, modelID) => {
 *     updateModel(modelID, {
 *       position: modelState.position,
 *       angle: modelState.rotation,
 *       opacity: modelState.opacity,
 *       scale: modelState.scale
 *     });
 *   });
 *   
 *   // Update camera
 *   updateCamera({
 *     pan: snapshot.camera.pan,
 *     zoom: snapshot.camera.zoom,
 *     rotation: snapshot.camera.rotation
 *   });
 * }
 * ```
 */
export interface AnimationSnapshot2D {
	/** 
	 * Map of all model states, keyed by sceneObjectID.
	 * Only objects that have been referenced in the scene definition are included.
	 */
	models: Map<string, ModelAnimationState2D>;
	
	/** 
	 * The current camera state.
	 * Always present, defaults to initial values if no camera keyframes exist.
	 */
	camera: CameraAnimationState2D;
}

