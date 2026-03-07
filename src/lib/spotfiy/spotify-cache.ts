const cache = new Map<string, { data: unknown; expiresAt: number }>();

export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data as T;
  }

  const data = await fetchFn();
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

export function invalidateCache(keyPrefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key);
  }
}
