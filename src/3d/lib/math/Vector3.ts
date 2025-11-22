import { Quaternion } from './Quaternion';

/**
 * Represents a 3D vector with x, y, and z components.
 * 
 * Vector3 is used throughout the library for representing positions, offsets, and directions in 3D space.
 * All methods support method chaining for fluent API usage.
 * 
 * @example
 * ```typescript
 * // Create a vector
 * const position = new Vector3(1, 2, 3);
 * 
 * // Chain operations
 * const result = new Vector3(0, 0, 0)
 *   .add(new Vector3(1, 1, 1))
 *   .multiplyScalar(2)
 *   .lerp(new Vector3(10, 10, 10), 0.5);
 * 
 * // Clone to avoid mutation
 * const copy = position.clone();
 * ```
 */
export class Vector3 {
  /**
   * Creates a new Vector3 instance.
   * 
   * @param x - The x component. Defaults to 0.
   * @param y - The y component. Defaults to 0.
   * @param z - The z component. Defaults to 0.
   */
  constructor(public x = 0, public y = 0, public z = 0) {}

  /**
   * Sets the x, y, and z components of this vector.
   * 
   * @param x - The x component.
   * @param y - The y component.
   * @param z - The z component.
   * @returns This vector for method chaining.
   */
  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Copies the x, y, and z components from another vector to this vector.
   * 
   * @param v - The vector to copy from.
   * @returns This vector for method chaining.
   */
  copy(v: Vector3): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  /**
   * Creates a new Vector3 with the same x, y, and z values as this vector.
   * 
   * @returns A new Vector3 instance.
   */
  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Adds another vector to this vector (component-wise addition).
   * 
   * @param v - The vector to add.
   * @returns This vector for method chaining.
   */
  add(v: Vector3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  /**
   * Subtracts another vector from this vector (component-wise subtraction).
   * 
   * @param v - The vector to subtract.
   * @returns This vector for method chaining.
   */
  sub(v: Vector3): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /**
   * Multiplies this vector by a scalar value.
   * 
   * @param s - The scalar value to multiply by.
   * @returns This vector for method chaining.
   */
  multiplyScalar(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  /**
   * Linearly interpolates this vector towards another vector.
   * 
   * @param v - The target vector.
   * @param alpha - The interpolation factor, typically between 0 and 1.
   *                0 keeps this vector unchanged, 1 sets it to the target vector.
   * @returns This vector for method chaining.
   * 
   * @example
   * ```typescript
   * const start = new Vector3(0, 0, 0);
   * const end = new Vector3(10, 10, 10);
   * start.lerp(end, 0.5); // start is now (5, 5, 5)
   * ```
   */
  lerp(v: Vector3, alpha: number): this {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  }

  /**
   * Applies a quaternion rotation to this vector.
   * 
   * Rotates this vector by the rotation represented by the quaternion.
   * 
   * @param q - The quaternion representing the rotation to apply.
   * @returns This vector for method chaining.
   */
  applyQuaternion(q: Quaternion): this {
    const x = this.x, y = this.y, z = this.z;
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    // calculate quat * vector
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return this;
  }

  /**
   * Writes the x, y, z components of this vector to an array.
   * 
   * @param array - The array to write to. If not provided, a new array is created.
   * @param offset - The offset in the array to start writing at. Defaults to 0.
   * @returns The array that was written to.
   */
  toArray(array: number[] = [], offset = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }

  /**
   * Sets the x, y, z components of this vector from an array.
   * 
   * @param array - The array to read from.
   * @param offset - The offset in the array to start reading from. Defaults to 0.
   * @returns This vector for method chaining.
   */
  fromArray(array: number[], offset = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }

  /**
   * Checks if this vector is equal to another vector.
   * 
   * @param v - The vector to compare with.
   * @returns `true` if all components are equal, `false` otherwise.
   */
  equals(v: Vector3): boolean {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  }
}
