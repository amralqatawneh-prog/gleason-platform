const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export async function fetchCapabilities(): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${API_BASE}/capabilities`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return null;
    return await response.json() as Record<string, unknown>;
  } catch {
    return null;
  }
}
