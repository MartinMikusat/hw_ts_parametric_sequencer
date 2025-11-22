/**
 * Represents a 2D vector with x and y components.
 * 
 * Vector2 is used throughout the library for representing positions, offsets, and directions in 2D space.
 * All methods support method chaining for fluent API usage.
 * 
 * @example
 * ```typescript
 * // Create a vector
 * const position = new Vector2(100, 50);
 * 
 * // Chain operations
 * const result = new Vector2(0, 0)
 *   .add(new Vector2(10, 10))
 *   .multiplyScalar(2)
 *   .lerp(new Vector2(100, 100), 0.5);
 * 
 * // Clone to avoid mutation
 * const copy = position.clone();
 * ```
 */
export class Vector2 {
  /**
   * Creates a new Vector2 instance.
   * 
   * @param x - The x component. Defaults to 0.
   * @param y - The y component. Defaults to 0.
   */
  constructor(public x = 0, public y = 0) {}

  /**
   * Sets the x and y components of this vector.
   * 
   * @param x - The x component.
   * @param y - The y component.
   * @returns This vector for method chaining.
   */
  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Copies the x and y components from another vector to this vector.
   * 
   * @param v - The vector to copy from.
   * @returns This vector for method chaining.
   */
  copy(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  /**
   * Creates a new Vector2 with the same x and y values as this vector.
   * 
   * @returns A new Vector2 instance.
   */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * Adds another vector to this vector (component-wise addition).
   * 
   * @param v - The vector to add.
   * @returns This vector for method chaining.
   */
  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtracts another vector from this vector (component-wise subtraction).
   * 
   * @param v - The vector to subtract.
   * @returns This vector for method chaining.
   */
  sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
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
    return this;
  }

  /**
   * Linearly interpolates this vector towards another vector.
   * 
   * @param v - The target vector.
   * @param alpha - The interpolation factor, typically between 0 and 1.
   *                0 keeps this vector unchanged, 1 sets it to the target vector.
   * @returns This vector for method chaining.
   */
  lerp(v: Vector2, alpha: number): this {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }

  /**
   * Writes the x, y components of this vector to an array.
   * 
   * @param array - The array to write to. If not provided, a new array is created.
   * @param offset - The offset in the array to start writing at. Defaults to 0.
   * @returns The array that was written to.
   */
  toArray(array: number[] = [], offset = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  }

  /**
   * Sets the x, y components of this vector from an array.
   * 
   * @param array - The array to read from.
   * @param offset - The offset in the array to start reading from. Defaults to 0.
   * @returns This vector for method chaining.
   */
  fromArray(array: number[], offset = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    return this;
  }

  /**
   * Checks if this vector is equal to another vector.
   * 
   * @param v - The vector to compare with.
   * @returns `true` if all components are equal, `false` otherwise.
   */
  equals(v: Vector2): boolean {
    return v.x === this.x && v.y === this.y;
  }
}

