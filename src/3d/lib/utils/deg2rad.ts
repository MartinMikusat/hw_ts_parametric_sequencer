/**
 * Converts degrees to radians.
 * 
 * @param x - Angle in degrees.
 * @returns Angle in radians.
 * 
 * @example
 * ```typescript
 * const radians = deg2rad(90); // Returns Math.PI / 2
 * ```
 */
export const deg2rad = (x: number) => x * (Math.PI / 180)

/**
 * Converts radians to degrees.
 * 
 * @param radians - Angle in radians.
 * @returns Angle in degrees.
 * 
 * @example
 * ```typescript
 * const degrees = rad2deg(Math.PI / 2); // Returns 90
 * ```
 */
export const rad2deg = (radians: number) => radians * (180 / Math.PI)

