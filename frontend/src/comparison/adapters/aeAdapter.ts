import { aeForward, aeInverse, aeMetadata } from '../../models/ae.js';
import { AdapterInputError, planarNotes, result, validateCoordinate, validatePosition, type AdapterMetadata, type ModelAdapter, type PlaneCoordinate } from './contract.js';

// Derived from this independent provider, never from historical normalized radius.
const southPole = aeForward({ latitude: -90, longitude: 0 });
export const AE_MAX_RADIUS_M = Math.hypot(southPole.x, southPole.y);
const metadata: AdapterMetadata = Object.freeze({
  modelId: aeMetadata.modelId, modelVersion: aeMetadata.modelVersion,
  units: 'metre', semanticType: 'REFERENCE_RESULT', evidenceLevel: 'REFERENCE',
  heightPolicy: 'not-represented', domain: `Geographic degrees [-90,90]/[-180,180]; inverse disk radius ${AE_MAX_RADIUS_M} metres.`,
  evidence: Object.freeze(aeMetadata.evidence.map(e => Object.freeze({ ...e }))),
  limitations: Object.freeze([...aeMetadata.limitations,
    'Projected metres are not arbitrary pairwise geodesic distances.',
    'North-pole longitude is undefined; inverse origin uses display convention 0 degrees.',
    'Antipodal south-pole longitude is a display convention on the boundary.',
    'Inverse circumference tolerance is 1e-7 metre; numerical overshoot is reported.']),
});
export const aeAdapter = Object.freeze<ModelAdapter<PlaneCoordinate>>({
  metadata,
  forward(point) {
    validatePosition(point); const p = aeForward(point);
    if (![p.x, p.y].every(Number.isFinite)) throw new AdapterInputError('outside-domain', 'AE provider returned nonfinite output');
    return result({ kind: 'plane' as const, modelId: metadata.modelId, modelVersion: metadata.modelVersion,
      units: metadata.units, x: p.x, y: p.y }, metadata, planarNotes(point));
  },
  inverse(p) {
    validateCoordinate(p, metadata, 'plane');
    const radius = Math.hypot(p.x, p.y);
    if (radius > AE_MAX_RADIUS_M + 1e-7) throw new AdapterInputError('outside-domain', 'Outside AE geographic disk');
    if (p.x === 0 && p.y === 0) return result({ latitude: 90, longitude: 0 }, metadata, ['Pole longitude is a display convention: 0 degrees.']);
    const point = aeInverse(p);
    const notes: string[] = [];
    if (Math.abs(radius - AE_MAX_RADIUS_M) <= 1e-7 && point.latitude < -90 && point.latitude >= -90 - 1e-9) {
      point.latitude = -90; notes.push('Numerical circumference overshoot snapped to south-pole boundary within 1e-7 metre.');
    }
    validatePosition(point); return result(point, metadata, notes);
  },
});
