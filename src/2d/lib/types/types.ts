import type { Vector2 } from '../math/Vector2';
import type { SceneModel2D, type_sceneModel_marker2D_withParent } from './types_sceneModel';

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
		value: type_sceneModel_marker2D_withParent;
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

export type type_keyframe_model2D = {
	chapter?: string;
	duration: number;
	id: string;
	opacity?: number;
	position?: type_keyframe_position2D;
	rotation?: type_keyframe_rotation2D;
	scale?: number;
	sceneModel: SceneModel2D;
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

