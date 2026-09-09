export type EvidenceLevel = 'DOCUMENTED' | 'DERIVED' | 'DISPLAY_CONVENTION' | 'REFERENCE';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  units: string;
}

export interface SourceReference {
  sourceId: string;
  locator: string;
  evidenceLevel: EvidenceLevel;
  note: string;
}

export interface ProjectionMetadata {
  modelId: string;
  modelVersion: string;
  name: string;
  units: string;
  evidence: SourceReference[];
  limitations: string[];
}
