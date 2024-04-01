import useEventListener from '@use-it/event-listener';
import { useCallback, useEffect, useRef, useState } from 'react';
import createStorage from './createStorage';

import createGlobalState from './createGlobalState';

const getProvider = () => {
  if (typeof global !== 'undefined' && global.localStorage) {
    return global.localStorage;
  }
  // eslint-disable-next-line no-undef
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    // eslint-disable-next-line no-undef
    return globalThis.localStorage;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
};

export const usePersistedState = (initialState, key, { get, set }) => {
  const globalState = useRef(null);
  const [state, setState] = useState(() => get(key, initialState));

  // subscribe to `storage` change events
  useEventListener('storage', ({ key: k, newValue }) => {
    if (k === key) {
      const newState = JSON.parse(newValue);
      if (state !== newState) {
        setState(newState);
      }
    }
  });

  // only called on mount
  useEffect(() => {
    // register a listener that calls `setState` when another instance emits
    globalState.current = createGlobalState(key, setState, initialState);

    return () => {
      globalState.current.deregister();
    };
  }, [initialState, key]);

  const persistentSetState = useCallback(
    (newState) => {
      const newStateValue =
        typeof newState === 'function' ? newState(state) : newState;

      // persist to localStorage
      set(key, newStateValue);

      setState(newStateValue);

      // inform all of the other instances in this tab
      globalState.current.emit(newState);
    },
    [state, set, key]
  );

  return [state, persistentSetState];
};

export const createPersistedState = (key, provider = getProvider()) => {
  if (provider) {
    const storage = createStorage(provider);
    return (initialState) => usePersistedState(initialState, key, storage);
  }
  return useState;
};

export default { createPersistedState, usePersistedState };
