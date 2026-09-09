import Projection from 'ol/proj/Projection.js';
import { addCoordinateTransforms, addProjection, get as getProjection } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';
import proj4 from 'proj4';
import { AE_CODE, AE_DEFINITION } from '../models/ae';
import { GLEASON_UNITS, gleasonForward, gleasonInverse } from '../models/gleason';

export const GLEASON_CODE = 'GLEASON:HISTORICAL';
let registered = false;

export function registerPhase2Projections(): void {
  if (registered) return;
  const gleasonProjection = new Projection({ code: GLEASON_CODE, units: 'pixels', extent: [-1.05, -1.05, 1.05, 1.05] });
  addProjection(gleasonProjection);
  addCoordinateTransforms('EPSG:4326', gleasonProjection,
    ([longitude, latitude]) => { const p = gleasonForward({ latitude, longitude }); return [p.x, p.y]; },
    ([x, y]) => { const p = gleasonInverse({ x, y, units: GLEASON_UNITS }); return [p.longitude, p.latitude]; });
  proj4.defs(AE_CODE, AE_DEFINITION);
  register(proj4);
  const aeProjection = getProjection(AE_CODE);
  if (aeProjection) aeProjection.setExtent([-20_100_000, -20_100_000, 20_100_000, 20_100_000]);
  registered = true;
}
