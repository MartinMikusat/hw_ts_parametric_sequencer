/**
 * Normalizes an angle in degrees to the range [0, 360)
 */
export function normalizeAngleDegrees(angle: number): number {
	let normalized = angle % 360;
	if (normalized < 0) {
		normalized += 360;
	}
	return normalized;
}

/**
 * Normalizes an angle in radians to the range [0, 2π)
 */
export function normalizeAngleRadians(angle: number): number {
	const TWO_PI = 2 * Math.PI;
	let normalized = angle % TWO_PI;
	if (normalized < 0) {
		normalized += TWO_PI;
	}
	return normalized;
}

/**
 * Converts degrees to radians
 */
export function deg2rad(degrees: number): number {
	return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 */
export function rad2deg(radians: number): number {
	return radians * (180 / Math.PI);
}

/**
 * Calculates the shortest arc interpolation between two angles (in degrees).
 * Returns the interpolated angle in degrees.
 * 
 * @param startAngle Start angle in degrees
 * @param endAngle End angle in degrees
 * @param t Interpolation factor [0, 1]
 * @returns Interpolated angle in degrees
 */
export function shortestArcInterpolation(startAngle: number, endAngle: number, t: number): number {
	// Normalize angles to [0, 360)
	const startNorm = normalizeAngleDegrees(startAngle);
	const endNorm = normalizeAngleDegrees(endAngle);
	
	// Calculate the difference
	let diff = endNorm - startNorm;
	
	// Find the shortest path
	if (diff > 180) {
		diff -= 360;
	} else if (diff < -180) {
		diff += 360;
	}
	
	// Interpolate
	const result = startNorm + diff * t;
	return normalizeAngleDegrees(result);
}

/**
 * Calculates the shortest arc interpolation between two angles (in radians).
 * Returns the interpolated angle in radians.
 * 
 * @param startAngle Start angle in radians
 * @param endAngle End angle in radians
 * @param t Interpolation factor [0, 1]
 * @returns Interpolated angle in radians
 */
export function shortestArcInterpolationRadians(startAngle: number, endAngle: number, t: number): number {
	const TWO_PI = 2 * Math.PI;
	
	// Normalize angles to [0, 2π)
	const startNorm = normalizeAngleRadians(startAngle);
	const endNorm = normalizeAngleRadians(endAngle);
	
	// Calculate the difference
	let diff = endNorm - startNorm;
	
	// Find the shortest path
	if (diff > Math.PI) {
		diff -= TWO_PI;
	} else if (diff < -Math.PI) {
		diff += TWO_PI;
	}
	
	// Interpolate
	const result = startNorm + diff * t;
	return normalizeAngleRadians(result);
}

