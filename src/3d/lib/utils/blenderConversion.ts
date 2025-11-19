import { Quaternion, Euler } from '../math';

export const generatePositionFromBlender = (x: number, y: number, z: number) => {
	return {
		x,
		y: z,
		z: -y
	};
};

export const generatePositionFromBlenderArray = (
	x: number,
	y: number,
	z: number
): [number, number, number] => {
	return [x, z, -y];
};

export const generateRotationFromBlender = (x: number, y: number, z: number): {
    x: number,
    y: number,
    z: number
} => {
    // Return DEGREES to align with the library-wide contract
    return {
        x,
        y: z,
        z: -y
    };
}

export const generateRotationFromBlenderArray = (x: number, y: number, z: number): [number, number, number] => {
    return [x, z, -y];
}

export const generateRotationFromBlenderArrayDegrees = (
	x: number,
	y: number,
	z: number
): [number, number, number] => {
	return [x, z, -y];
};

export const generateQuaternionFromBlenderArray = (w: number, x: number, y: number, z: number): [number, number, number, number] => {
    return [x, y, z, w]
}

export const quaternionFromBlenderEulerAngles = (rotation: [number, number, number]): Quaternion => {
	// Input rotation is in DEGREES; convert to radians for quaternion math
	const [rx, ry, rz] = generateRotationFromBlenderArrayDegrees(...rotation);
	return new Quaternion().setFromEuler(new Euler(
		(rx * Math.PI) / 180,
		(ry * Math.PI) / 180,
		(rz * Math.PI) / 180
	));
};
