import { gleasonForward, gleasonInverse, gleasonMetadata } from '../../models/gleason.js';
import { AdapterInputError, planarNotes, result, validateCoordinate, validatePosition, type AdapterMetadata, type ModelAdapter, type PlaneCoordinate } from './contract.js';

const metadata: AdapterMetadata = Object.freeze({
  modelId: gleasonMetadata.modelId, modelVersion: gleasonMetadata.modelVersion,
  units: 'normalized-radius', semanticType: 'COMPUTED_RESULT', evidenceLevel: 'DERIVED',
  heightPolicy: 'not-represented', domain: 'Geographic degrees [-90,90]/[-180,180]; inverse closed unit disk.',
  evidence: Object.freeze(gleasonMetadata.evidence.map(e => Object.freeze({ ...e }))),
  limitations: Object.freeze([...gleasonMetadata.limitations,
    'At the north-pole origin, longitude is undefined; inverse returns display convention 0 degrees.',
    'South-pole longitude locates a point on the display circumference, not distinct physical positions.',
    'Inverse circumference tolerance is 1e-12 normalized-radius; numerical overshoot is reported.']),
});
export const gleasonAdapter = Object.freeze<ModelAdapter<PlaneCoordinate>>({
  metadata,
  forward(point) {
    validatePosition(point);
    const p = gleasonForward(point);
    return result({ kind: 'plane' as const, modelId: metadata.modelId, modelVersion: metadata.modelVersion,
      units: metadata.units, x: p.x, y: p.y }, metadata, planarNotes(point));
  },
  inverse(p) {
    validateCoordinate(p, metadata, 'plane');
    const radius = Math.hypot(p.x, p.y);
    if (radius > 1 + 1e-12) throw new AdapterInputError('outside-domain', 'Outside historical unit disk');
    const point = gleasonInverse(p);
    const notes = radius < 1e-15 ? ['Pole longitude is a display convention: 0 degrees.'] : [];
    if (point.latitude < -90 && radius <= 1 + 1e-12) {
      point.latitude = -90; notes.push('Numerical circumference overshoot snapped to south-pole boundary within 1e-12 radius.');
    }
    validatePosition(point); return result(point, metadata, notes);
  },
});
