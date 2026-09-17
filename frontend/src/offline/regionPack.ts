import type { OfflineGeographicEntity } from './geographicSearch';

export interface GeographicRegionPackManifest {
  id: string;
  version: string;
  region: string;
  generatedAt: string;
  entityCount: number;
  sha256: string;
  sourceIds: string[];
}

export interface GeographicRegionPack {
  manifest: GeographicRegionPackManifest;
  entities: OfflineGeographicEntity[];
}

function stableEntityPayload(entities: readonly OfflineGeographicEntity[]): string {
  const normalized = [...entities]
    .map((item) => ({
      id: item.id,
      entityType: item.entityType,
      name: item.name,
      nameAr: item.nameAr ?? null,
      aliases: [...item.aliases].sort(),
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      countryCode: item.countryCode ?? null,
      provenance: item.provenance,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify(normalized);
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function computeRegionPackChecksum(
  entities: readonly OfflineGeographicEntity[],
): Promise<string> {
  return sha256Hex(stableEntityPayload(entities));
}

export async function validateRegionPack(pack: GeographicRegionPack): Promise<void> {
  if (!pack.manifest.id || !pack.manifest.version || !pack.manifest.region) {
    throw new Error('region pack identity/version/region are required');
  }
  if (pack.manifest.entityCount !== pack.entities.length) {
    throw new Error('region pack entityCount mismatch');
  }
  if (!/^[a-f0-9]{64}$/.test(pack.manifest.sha256)) {
    throw new Error('region pack sha256 must be a lowercase SHA-256 hex digest');
  }
  for (const entity of pack.entities) {
    if (!entity.id || !entity.name || !entity.provenance.sourceId
      || !entity.provenance.sourceVersion || !entity.provenance.sourceLicense) {
      throw new Error('region pack entity is missing canonical identity/provenance');
    }
  }
  const digest = await computeRegionPackChecksum(pack.entities);
  if (digest !== pack.manifest.sha256) throw new Error('region pack checksum mismatch');
}
