import { Euler } from './Euler';

/**
 * Represents a quaternion rotation in 3D space.
 * 
 * Quaternions are used to represent rotations without gimbal lock issues.
 * They provide smooth interpolation via SLERP (spherical linear interpolation).
 * 
 * @remarks
 * Quaternions are stored as (x, y, z, w) where w is the scalar component.
 * The library uses quaternions internally for all 3D rotations to ensure smooth interpolation.
 * 
 * @example
 * ```typescript
 * // Create from Euler angles
 * const euler = new Euler(0, 90, 0);
 * const quat = new Quaternion().setFromEuler(euler);
 * 
 * // Interpolate between rotations
 * const start = new Quaternion().setFromEuler(new Euler(0, 0, 0));
 * const end = new Quaternion().setFromEuler(new Euler(0, 180, 0));
 * start.slerp(end, 0.5); // Halfway between start and end
 * ```
 */
export class Quaternion {
  /**
   * Creates a new Quaternion instance.
   * 
   * @param x - The x component. Defaults to 0.
   * @param y - The y component. Defaults to 0.
   * @param z - The z component. Defaults to 0.
   * @param w - The w (scalar) component. Defaults to 1 (identity quaternion).
   */
  constructor(public x = 0, public y = 0, public z = 0, public w = 1) {}

  /**
   * Sets the x, y, z, and w components of this quaternion.
   * 
   * @param x - The x component.
   * @param y - The y component.
   * @param z - The z component.
   * @param w - The w (scalar) component.
   * @returns This quaternion for method chaining.
   */
  set(x: number, y: number, z: number, w: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  /**
   * Copies the x, y, z, and w components from another quaternion to this quaternion.
   * 
   * @param q - The quaternion to copy from.
   * @returns This quaternion for method chaining.
   */
  copy(q: Quaternion): this {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  }

  /**
   * Creates a new Quaternion with the same x, y, z, and w values as this quaternion.
   * 
   * @returns A new Quaternion instance.
   */
  clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * Sets this quaternion from Euler angles.
   * 
   * Converts Euler angles (in radians) to a quaternion representation.
   * The conversion respects the Euler order specified in the Euler object.
   * 
   * @param euler - The Euler angles to convert from.
   * @returns This quaternion for method chaining.
   */
  setFromEuler(euler: Euler): this {
    const x = euler.x, y = euler.y, z = euler.z, order = euler.order;
    const c1 = Math.cos(x / 2);
    const c2 = Math.cos(y / 2);
    const c3 = Math.cos(z / 2);
    const s1 = Math.sin(x / 2);
    const s2 = Math.sin(y / 2);
    const s3 = Math.sin(z / 2);

    switch (order) {
      case 'XYZ':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case 'YXZ':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case 'ZXY':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case 'ZYX':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case 'YZX':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case 'XZY':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
    }
    return this;
  }

  /**
   * Performs spherical linear interpolation (SLERP) between this quaternion and another.
   * 
   * SLERP provides smooth rotation interpolation along the shortest arc between two rotations.
   * This is the preferred method for interpolating rotations as it avoids gimbal lock.
   * 
   * @param qb - The target quaternion to interpolate towards.
   * @param t - The interpolation factor, typically between 0 and 1.
   *            0 keeps this quaternion unchanged, 1 sets it to the target quaternion.
   * @returns This quaternion for method chaining.
   * 
   * @example
   * ```typescript
   * const start = new Quaternion().setFromEuler(new Euler(0, 0, 0));
   * const end = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0));
   * start.slerp(end, 0.5); // Halfway rotation
   * ```
   */
  slerp(qb: Quaternion, t: number): this {
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);

    const x = this.x, y = this.y, z = this.z, w = this.w;
    let cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

    if (cosHalfTheta < 0) {
      this.w = -qb.w;
      this.x = -qb.x;
      this.y = -qb.y;
      this.z = -qb.z;
      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }

    if (cosHalfTheta >= 1.0) {
      this.w = w;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
      this.w = 0.5 * (w + this.w);
      this.x = 0.5 * (x + this.x);
      this.y = 0.5 * (y + this.y);
      this.z = 0.5 * (z + this.z);
      return this;
    }

    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this.w = (w * ratioA + this.w * ratioB);
    this.x = (x * ratioA + this.x * ratioB);
    this.y = (y * ratioA + this.y * ratioB);
    this.z = (z * ratioA + this.z * ratioB);

    return this;
  }

  /**
   * Multiplies this quaternion by another quaternion.
   * 
   * Quaternion multiplication composes rotations. The result represents
   * applying rotation `q` after this quaternion's rotation.
   * 
   * @param q - The quaternion to multiply by.
   * @returns This quaternion for method chaining.
   */
  multiply(q: Quaternion): this {
    return this.multiplyQuaternions(this, q);
  }

  /**
   * Multiplies two quaternions and stores the result in this quaternion.
   * 
   * @param a - The first quaternion.
   * @param b - The second quaternion.
   * @returns This quaternion for method chaining.
   * 
   * @internal
   */
  multiplyQuaternions(a: Quaternion, b: Quaternion): this {
    const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
    const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  }

  /**
   * Writes the x, y, z, w components of this quaternion to an array.
   * 
   * @param array - The array to write to. If not provided, a new array is created.
   * @param offset - The offset in the array to start writing at. Defaults to 0.
   * @returns The array that was written to.
   */
  toArray(array: number[] = [], offset = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    array[offset + 3] = this.w;
    return array;
  }

  /**
   * Sets the x, y, z, w components of this quaternion from an array.
   * 
   * @param array - The array to read from.
   * @param offset - The offset in the array to start reading from. Defaults to 0.
   * @returns This quaternion for method chaining.
   */
  fromArray(array: number[], offset = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    this.w = array[offset + 3];
    return this;
  }
}
