import type { Matrix, Vector } from '@/types';

export function createMatrix(rows: number, cols: number, fill = 0): Matrix {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

export function cloneMatrix(m: Matrix): Matrix {
  return m.map((row) => [...row]);
}

export function cloneVector(v: Vector): Vector {
  return [...v];
}

export function transpose(m: Matrix): Matrix {
  if (m.length === 0) return [];
  const rows = m.length;
  const cols = m[0].length;
  const result = createMatrix(cols, rows);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = m[i][j];
    }
  }
  return result;
}

export function identity(n: number): Matrix {
  const result = createMatrix(n, n, 0);
  for (let i = 0; i < n; i++) result[i][i] = 1;
  return result;
}

export function vectorMatrixMultiply(v: Vector, m: Matrix): Vector {
  if (v.length === 0 || m.length === 0) return [];
  const cols = m[0].length;
  const result = new Array(cols).fill(0);
  for (let j = 0; j < cols; j++) {
    let sum = 0;
    for (let i = 0; i < v.length; i++) {
      sum += v[i] * m[i][j];
    }
    result[j] = sum;
  }
  return result;
}

export function matrixVectorMultiply(m: Matrix, v: Vector): Vector {
  if (m.length === 0) return [];
  const rows = m.length;
  const cols = m[0].length;
  if (v.length !== cols) {
    throw new Error(`Dimension mismatch: matrix has ${cols} columns but vector has length ${v.length}`);
  }
  const result = new Array(rows).fill(0);
  for (let i = 0; i < rows; i++) {
    let sum = 0;
    for (let j = 0; j < cols; j++) {
      sum += m[i][j] * v[j];
    }
    result[i] = sum;
  }
  return result;
}

export function norm2(v: Vector): number {
  let sum = 0;
  for (const x of v) sum += x * x;
  return Math.sqrt(sum);
}

export function vectorSubtract(a: Vector, b: Vector): Vector {
  return a.map((x, i) => x - b[i]);
}

export function vectorAdd(a: Vector, b: Vector): Vector {
  return a.map((x, i) => x + b[i]);
}

export function scaleVector(v: Vector, s: number): Vector {
  return v.map((x) => x * s);
}

export function dotProduct(a: Vector, b: Vector): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export function isFiniteNumber(x: number): boolean {
  return Number.isFinite(x);
}

export function allFinite(v: Vector): boolean {
  return v.every((x) => Number.isFinite(x));
}

export function matrixAllFinite(m: Matrix): boolean {
  return m.every((row) => row.every((x) => Number.isFinite(x)));
}
