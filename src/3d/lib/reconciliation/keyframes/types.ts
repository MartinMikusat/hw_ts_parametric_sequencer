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

export type type_keyframe_model = {
	chapter?: string;
	duration: number;
	id: string;
	opacity?: number;
	position?: type_keyframe_position;
	rotation?: type_keyframe_rotation;
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

