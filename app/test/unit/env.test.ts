import { describe, expect, it } from 'vitest';

import {
  getAppProfileFrom,
  isRealApiEnabledFrom,
  type AppProfile,
} from '../../src/api/env';

describe('api/env', () => {
  it('defaults to complete when nothing set', () => {
    const profile = getAppProfileFrom({}, undefined);
    expect(profile).toBe<AppProfile>('complete');
  });

  it('uses VITE_APP_PROFILE if present (offline)', () => {
    const profile = getAppProfileFrom({ VITE_APP_PROFILE: 'offline' }, 'production');
    expect(profile).toBe('offline');
  });

  it('falls back to mode when VITE_APP_PROFILE absent (performance)', () => {
    const profile = getAppProfileFrom({}, 'performance');
    expect(profile).toBe('performance');
  });

  it('forces real API disabled in offline profile', () => {
    const enabled = isRealApiEnabledFrom(
      { VITE_APP_PROFILE: 'offline', VITE_USE_REAL_API: 'true' },
      'offline',
    );
    expect(enabled).toBe(false);
  });

  it('defaults to real API enabled outside offline when VITE_USE_REAL_API is unset', () => {
    const enabled = isRealApiEnabledFrom({ VITE_APP_PROFILE: 'complete' }, 'development');
    expect(enabled).toBe(true);
  });

  it('parses VITE_USE_REAL_API outside offline', () => {
    expect(
      isRealApiEnabledFrom({ VITE_APP_PROFILE: 'complete', VITE_USE_REAL_API: '0' }, 'dev'),
    ).toBe(false);
    expect(
      isRealApiEnabledFrom({ VITE_APP_PROFILE: 'complete', VITE_USE_REAL_API: 'yes' }, 'dev'),
    ).toBe(true);
  });
});
