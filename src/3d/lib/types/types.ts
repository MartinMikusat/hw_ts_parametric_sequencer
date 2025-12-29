import type { Vector3, Quaternion } from '../math';

// --------------------------------------------
// 3D models ----------------------------------
export type type_markerSceneObjectID = string;

export type type_partType = 'Printed' | 'Hardware' | 'PCB' | 'Product';

export type type_3D_partBase = {
	url: string;
	type: type_partType;
	title: string;
	description: string;
	downloadLink?: string;
};

export type type_3D_part = type_3D_partBase;

// 3D models ----------------------------------
// --------------------------------------------

// --------------------------------------------
// Animations ---------------------------------
export type type_digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type type_componentState = {
	opacity: number;
	position: [number, number, number];
	rotation: [number, number, number];
};

export type type_keyframeCurve = {
	leftHandle: [number, number];
	rightHandle: [number, number];
};
export type type_keyframeCurveHandles = keyof type_keyframeCurve;
export type type_keyframeSide = 'Left' | 'Right';

export type type_sceneAssembly = {
	name: string;
	options?: string[];
	configurationKey?: string;
};
// Animations ---------------------------------
// --------------------------------------------

// --------------------------------------------
// Animation states ---------------------------
export type type_modelAnimationState = {
	opacity: number;
	position: Vector3;
	rotation: Quaternion;
	cumulativeModelRotation: Quaternion;
};
// Animation states ---------------------------
// --------------------------------------------

// --------------------------------------------
// Playback -----------------------------------
export type type_availableScenes = 'Eva' | 'Clockwork 2';
export type type_playbackTimes = { [sceneName: string]: number };
export type type_playbackPlayStates = { [sceneName: string]: boolean };
// Playback -----------------------------------
// --------------------------------------------

// --------------------------------------------
// Chapters -----------------------------------
export type type_chapterParts = [number, type_3D_part];
export type type_getChapterParts = (chapter: string) => type_chapterParts[] | undefined;
export type type_chapterPartsWithHighlight = [number, type_3D_part, boolean];
export type type_getChapterTitle = (chapter: string | undefined) => string;
export type type_getChapterText = (chapter: string | undefined) => [string | string[], string, string];
// Chapters -----------------------------------
// --------------------------------------------

// Chapter assembly
export type type_chapterAssembly = {
	assembly: string;
	description: string;
	chapter: string;
};

