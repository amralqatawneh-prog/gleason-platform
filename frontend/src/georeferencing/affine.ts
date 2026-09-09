export interface ControlPoint { source: readonly [number, number]; target: readonly [number, number]; }
export interface AffineTransform { a: number; b: number; c: number; d: number; e: number; f: number; }

function solve3(matrix: number[][], values: number[]): [number, number, number] {
  const rows = matrix.map((row, i) => [...row, values[i]]);
  for (let col = 0; col < 3; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < 3; row += 1) if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const divisor = rows[col][col];
    if (Math.abs(divisor) < 1e-12) throw new Error('control points are collinear');
    for (let j = col; j < 4; j += 1) rows[col][j] /= divisor;
    for (let row = 0; row < 3; row += 1) {
      if (row === col) continue;
      const factor = rows[row][col];
      for (let j = col; j < 4; j += 1) rows[row][j] -= factor * rows[col][j];
    }
  }
  return [rows[0][3], rows[1][3], rows[2][3]];
}

export function fitAffineFromThreeControlPoints(points: readonly ControlPoint[]): AffineTransform {
  if (points.length !== 3) throw new Error('exactly three control points are required');
  const matrix = points.map(({ source: [x, y] }) => [x, y, 1]);
  const [a, b, c] = solve3(matrix, points.map(({ target }) => target[0]));
  const [d, e, f] = solve3(matrix, points.map(({ target }) => target[1]));
  return { a, b, c, d, e, f };
}

export function applyAffine(transform: AffineTransform, point: readonly [number, number]): [number, number] {
  const [x, y] = point;
  return [transform.a * x + transform.b * y + transform.c, transform.d * x + transform.e * y + transform.f];
}

export function controlPointResidual(transform: AffineTransform, controlPoint: ControlPoint): number {
  const [x, y] = applyAffine(transform, controlPoint.source);
  return Math.hypot(x - controlPoint.target[0], y - controlPoint.target[1]);
}
