import { Quaternion } from './Quaternion';

export type EulerOrder = 'XYZ' | 'YZX' | 'ZXY' | 'XZY' | 'YXZ' | 'ZYX';

export class Euler {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
    public order: EulerOrder = 'XYZ'
  ) {}

  set(x: number, y: number, z: number, order?: EulerOrder): this {
    this.x = x;
    this.y = y;
    this.z = z;
    if (order) this.order = order;
    return this;
  }

  copy(e: Euler): this {
    this.x = e.x;
    this.y = e.y;
    this.z = e.z;
    this.order = e.order;
    return this;
  }

  clone(): Euler {
    return new Euler(this.x, this.y, this.z, this.order);
  }

  setFromQuaternion(q: Quaternion, order?: EulerOrder, _update?: boolean): this {
    const matrix = this.matrixFromQuaternion(q);
    return this.setFromRotationMatrix(matrix, order);
  }

  private matrixFromQuaternion(q: Quaternion) {
     const x = q.x, y = q.y, z = q.z, w = q.w;
     const x2 = x + x, y2 = y + y, z2 = z + z;
     const xx = x * x2, xy = x * y2, xz = x * z2;
     const yy = y * y2, yz = y * z2, zz = z * z2;
     const wx = w * x2, wy = w * y2, wz = w * z2;

     return [
       1 - (yy + zz), xy - wz, xz + wy,
       xy + wz, 1 - (xx + zz), yz - wx,
       xz - wy, yz + wx, 1 - (xx + yy)
     ];
  }

  private setFromRotationMatrix(m: number[], order: EulerOrder = this.order): this {
    // m is a 3x3 matrix flattened
    const m11 = m[0], m12 = m[1], m13 = m[2];
    const m21 = m[3], m22 = m[4], m23 = m[5];
    const m31 = m[6], m32 = m[7], m33 = m[8];

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    switch (order) {
      case 'XYZ':
        this.y = Math.asin(clamp(m13));
        if (Math.abs(m13) < 0.9999999) {
          this.x = Math.atan2(-m23, m33);
          this.z = Math.atan2(-m12, m11);
        } else {
          this.x = Math.atan2(m32, m22);
          this.z = 0;
        }
        break;

      case 'YXZ':
        this.x = Math.asin(-clamp(m23));
        if (Math.abs(m23) < 0.9999999) {
          this.y = Math.atan2(m13, m33);
          this.z = Math.atan2(m21, m22);
        } else {
          this.y = Math.atan2(-m31, m11);
          this.z = 0;
        }
        break;

      case 'ZXY':
        this.x = Math.asin(clamp(m32));
        if (Math.abs(m32) < 0.9999999) {
          this.y = Math.atan2(-m31, m33);
          this.z = Math.atan2(-m12, m22);
        } else {
          this.y = 0;
          this.z = Math.atan2(m21, m11);
        }
        break;

      case 'ZYX':
        this.y = Math.asin(-clamp(m31));
        if (Math.abs(m31) < 0.9999999) {
          this.x = Math.atan2(m32, m33);
          this.z = Math.atan2(m21, m11);
        } else {
          this.x = 0;
          this.z = Math.atan2(-m12, m22);
        }
        break;

      case 'YZX':
        this.z = Math.asin(clamp(m21));
        if (Math.abs(m21) < 0.9999999) {
          this.x = Math.atan2(-m23, m22);
          this.y = Math.atan2(-m31, m11);
        } else {
          this.x = 0;
          this.y = Math.atan2(m13, m33);
        }
        break;

      case 'XZY':
        this.z = Math.asin(-clamp(m12));
        if (Math.abs(m12) < 0.9999999) {
          this.x = Math.atan2(m32, m22);
          this.y = Math.atan2(m13, m11);
        } else {
          this.x = Math.atan2(-m23, m33);
          this.y = 0;
        }
        break;
    }
    return this;
  }

  toArray(array: number[] = [], offset = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }
}
