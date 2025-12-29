import type { Euler, Vector3 } from '../../math';
import type { SceneObject, type_sceneObject_marker_withParent } from '../../types/types_sceneModel';

export type type_keyframe_position =
	| {
		type: 'absolute';
		value: Vector3;
	}
	| {
		type: 'relative';
		value: Vector3;
	}
	| {
		type: 'marker';
		value: type_sceneObject_marker_withParent;
	};

export type type_keyframe_rotation =
	| {
		type: 'absolute';
		value: Euler;
	}
	| {
		type: 'relative';
		value: Euler;
	}
	| {
		type: 'worldSpace';
		value: Euler;
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
 * Allows animating arbitrary numeric properties beyond the built-in properties (opacity, position, rotation).
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

export type type_keyframe_model = {
	chapter?: string;
	duration: number;
	id: string;
	opacity?: number;
	position?: type_keyframe_position;
	rotation?: type_keyframe_rotation;
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
	sceneObject: SceneObject;
	time: type_time;
};

export type type_keyframe_camera = {
	chapter: string;
	duration: number;
	id: string;
	rotationX: number;
	rotationY: number;
	target: Vector3;
	time: type_time;
	zoom: number;
};

export type type_keyframes = type_keyframe_model | type_keyframe_camera;

// Separated keyframe arrays for pipeline processing
export interface type_separatedKeyframes {
	modelKeyframes: type_keyframe_model[];
	cameraKeyframes: type_keyframe_camera[];
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
export interface type_separatedKeyframes_reconciled {
	modelKeyframes: Array<{
		keyframe: type_keyframe_model;
		reconciled: type_time_reconciled;
	}>;
	cameraKeyframes: Array<{
		keyframe: type_keyframe_camera;
		reconciled: type_time_reconciled;
	}>;
}

// Separated extended keyframes
export interface type_separatedKeyframes_extended {
	modelKeyframes: Array<{
		keyframe: type_keyframe_model;
		reconciled: type_time_reconciled;
		extended: type_time_extended;
	}>;
	cameraKeyframes: Array<{
		keyframe: type_keyframe_camera;
		reconciled: type_time_reconciled;
		extended: type_time_extended;
	}>;
}

