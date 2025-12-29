import type { Vector2 } from '../math/Vector2';
import type { SceneObject2D, type_sceneObject_marker2D_withParent } from './types_sceneModel';

export type type_keyframe_position2D =
	| {
		type: 'absolute';
		value: Vector2;
	}
	| {
		type: 'relative';
		value: Vector2;
	}
	| {
		type: 'marker';
		value: type_sceneObject_marker2D_withParent;
	};

export type type_keyframe_rotation2D =
	| {
		type: 'absolute';
		value: number; // Angle in degrees
	}
	| {
		type: 'relative';
		value: number; // Angle in degrees
	};

type type_time_relative = {
	offset: number;
	side: 'Start' | 'End';
	parentID: string;
};

export type type_time =
	| {
		type: 'absolute';
		value: number;
	}
	| {
		type: 'relative';
		value: type_time_relative;
	}
	| {
		type: 'multiple';
		values: type_time_relative[];
	};

/**
 * Interpolation method for custom properties.
 * 
 * - `'linear'`: Smooth linear interpolation between values (default)
 * - `'step'`: Instant change at the end of the keyframe duration
 */
export type type_customProperty_interpolation = 'linear' | 'step';

/**
 * Definition for a single custom property value.
 * 
 * Custom properties allow animating arbitrary numeric values (e.g., brightness, intensity, temperature).
 * Each property can specify its own interpolation method.
 * 
 * @example
 * ```typescript
 * {
 *   value: 1.5,
 *   interpolation: 'linear'
 * }
 * ```
 */
export type type_customProperty_definition = {
	/** 
	 * The target value for this custom property.
	 * The animation system will interpolate from the previous value to this target.
	 */
	value: number;
	
	/** 
	 * The interpolation method to use for this property.
	 * Defaults to 'linear' if not specified.
	 */
	interpolation?: type_customProperty_interpolation;
};

/**
 * Map of custom property names to their definitions.
 * 
 * Allows animating arbitrary numeric properties beyond the built-in properties (opacity, position, rotation, scale).
 * Each property name is a string identifier (e.g., "brightness", "intensity", "temperature").
 * 
 * @example
 * ```typescript
 * {
 *   brightness: { value: 1.5, interpolation: 'linear' },
 *   intensity: { value: 0.8 },
 *   temperature: { value: 100, interpolation: 'step' }
 * }
 * ```
 */
export type type_custom = Record<string, type_customProperty_definition>;

export type type_keyframe_model2D = {
	chapter?: string;
	duration: number;
	id: string;
	opacity?: number;
	position?: type_keyframe_position2D;
	rotation?: type_keyframe_rotation2D;
	scale?: number;
	/** 
	 * Optional custom properties to animate.
	 * Allows animating arbitrary numeric values beyond built-in properties.
	 * Each property can specify its own interpolation method (linear or step).
	 * Properties persist across keyframes until explicitly changed.
	 * 
	 * @example
	 * ```typescript
	 * custom: {
	 *   brightness: { value: 1.5, interpolation: 'linear' },
	 *   intensity: { value: 0.8 }
	 * }
	 * ```
	 */
	custom?: type_custom;
	sceneObject: SceneObject2D;
	time: type_time;
};

export type type_keyframe_camera2D = {
	chapter: string;
	duration: number;
	id: string;
	pan: Vector2;
	zoom: number;
	rotation: number; // Angle in degrees
	time: type_time;
};

export type type_keyframes2D = type_keyframe_model2D | type_keyframe_camera2D;

// Separated keyframe arrays for pipeline processing
export interface type_separatedKeyframes2D {
	modelKeyframes: type_keyframe_model2D[];
	cameraKeyframes: type_keyframe_camera2D[];
}

// Reconciled time structure (matching what's in reconcileKeyframesTime)
export interface type_time_reconciled {
	startTime: number;
	endTime: number;
}

// Extended time structure (matching what's in extendTimeOfKeyframes)
export interface type_time_extended {
	startTime: number;
	endTime: number;
}

// Separated reconciled keyframes
export interface type_separatedKeyframes_reconciled2D {
	modelKeyframes: Array<{
		keyframe: type_keyframe_model2D;
		reconciled: type_time_reconciled;
	}>;
	cameraKeyframes: Array<{
		keyframe: type_keyframe_camera2D;
		reconciled: type_time_reconciled;
	}>;
}

// Separated extended keyframes
export interface type_separatedKeyframes_extended2D {
	modelKeyframes: Array<{
		keyframe: type_keyframe_model2D;
		reconciled: type_time_reconciled;
		extended: type_time_extended;
	}>;
	cameraKeyframes: Array<{
		keyframe: type_keyframe_camera2D;
		reconciled: type_time_reconciled;
		extended: type_time_extended;
	}>;
}

