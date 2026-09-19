import { latLonToEllipsoid } from './referenceMath.js';

/** Closed WGS84 visualization shell; no terrain, imagery or physical illumination claim. */
export function buildEllipsoidSurface(): Float32Array {
  const positions: number[] = [];
  const push = (latitude: number, longitude: number) => positions.push(...latLonToEllipsoid({ latitude, longitude }));
  for (let latitude = -90; latitude < 90; latitude += 3) {
    for (let longitude = -180; longitude < 180; longitude += 3) {
      push(latitude, longitude); push(latitude + 3, longitude); push(latitude + 3, longitude + 3);
      push(latitude, longitude); push(latitude + 3, longitude + 3); push(latitude, longitude + 3);
    }
  }
  return new Float32Array(positions);
}
