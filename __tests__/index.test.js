import 'jest-dom/extend-expect';
import { useState } from 'react';

import { createPersistedState, usePersistedState } from '../src';

describe('createPersistedState', () => {
  test('import createPersistedState from "use-persisted-state"', () => {
    expect(typeof createPersistedState).toBe('function');
  });
  test('import usePersistedState from "use-persisted-state"', () => {
    expect(typeof usePersistedState).toBe('function');
  });
  test('returns useState if provider is null or running SSR', () => {
    // global.localStorage is undefined in Node.js (but Jest mocks)
    // expect(createPersistedState('key')).toBe(useState);
    expect(createPersistedState('key', null)).toBe(useState);
  });
  test('returns a function if provider provided', () => {
    const fn = createPersistedState('key', 'provider');
    expect(typeof fn).toBe('function');
    expect(fn).not.toBe(useState);
  });
  test('returns a function if provider defaulted', () => {
    const fn = createPersistedState('key');
    expect(typeof fn).toBe('function');
    expect(fn).not.toBe(useState);
  });
});
