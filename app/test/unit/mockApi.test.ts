import { beforeEach, describe, expect, it } from 'vitest';

import { mockApiRequest, OfflineApiError } from '../../src/api/mockApi';

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var localStorage: MemoryStorage;
}

describe('api/mockApi', () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
  });

  it('returns a user for /api/admin/me', async () => {
    const res = await mockApiRequest<any>('GET', '/api/admin/me');
    expect(res).toMatchObject({ email: 'admin@offline.local' });
  });

  it('echoes email on /api/admin/login', async () => {
    const res = await mockApiRequest<any>('POST', '/api/admin/login', {
      email: 'x@y.z',
      password: 'pw',
    });
    expect(res.email).toBe('x@y.z');
  });

  it('persists settings across GET/PUT', async () => {
    const initial = await mockApiRequest<any>('GET', '/api/settings');

    const updated = { ...initial, language: 'fr' };
    await mockApiRequest<any>('PUT', '/api/settings', updated);

    const after = await mockApiRequest<any>('GET', '/api/settings');
    expect(after.language).toBe('fr');
  });

  it('filters recommendations using config.params', async () => {
    const all = await mockApiRequest<any[]>('GET', '/api/recommendations', undefined, {
      params: {},
    });
    expect(all.length).toBeGreaterThan(0);

    const filtered = await mockApiRequest<any[]>('GET', '/api/recommendations', undefined, {
      params: { q: String(all[0].details).slice(0, 4) },
    });
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('throws OfflineApiError on unknown route', async () => {
    await expect(mockApiRequest('GET', '/api/does-not-exist')).rejects.toBeInstanceOf(
      OfflineApiError,
    );
  });
});
