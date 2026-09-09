export type OfflinePackKind = 'core-world' | 'region' | 'astronomy' | 'research';

export type OfflinePackManifest = {
  schemaVersion: 1;
  id: string;
  kind: OfflinePackKind;
  version: string;
  title: string;
  generatedAt: string;
  sourceIds: string[];
  files: Array<{ path: string; sha256: string; bytes: number }>;
};

export function validatePackManifest(value: unknown): value is OfflinePackManifest {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<OfflinePackManifest>;
  if (candidate.schemaVersion !== 1) return false;
  if (!candidate.id || !candidate.kind || !candidate.version || !candidate.title) return false;
  if (!candidate.generatedAt || !Array.isArray(candidate.sourceIds) || !Array.isArray(candidate.files)) return false;
  const kinds: OfflinePackKind[] = ['core-world', 'region', 'astronomy', 'research'];
  if (!kinds.includes(candidate.kind)) return false;
  return candidate.files.every((file) =>
    Boolean(file) &&
    typeof file.path === 'string' &&
    typeof file.sha256 === 'string' &&
    /^[a-f0-9]{64}$/i.test(file.sha256) &&
    Number.isInteger(file.bytes) && file.bytes >= 0,
  );
}
