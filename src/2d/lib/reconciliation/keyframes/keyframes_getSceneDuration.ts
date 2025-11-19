import type { type_separatedKeyframes_extended2D } from './types';

export const keyframes_getSceneDuration2D = (keyframes: type_separatedKeyframes_extended2D) => {
	let duration = 0;
	keyframes.cameraKeyframes.forEach((keyframe: { reconciled: { endTime: number } }) => {
		if (keyframe.reconciled.endTime > duration) {
			duration = keyframe.reconciled.endTime;
		}
	});

	keyframes.modelKeyframes.forEach((keyframe: { reconciled: { endTime: number } }) => {
		if (keyframe.reconciled.endTime > duration) {
			duration = keyframe.reconciled.endTime;
		}
	});

	return duration;
};

