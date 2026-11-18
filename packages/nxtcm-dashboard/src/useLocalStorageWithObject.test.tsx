import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { useLocalStorageWithObject } from './useLocalStorage';

// Enable React concurrent-mode act() warnings in test environment
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

/* ------------------------------------------------------------------ */
/*  Minimal renderHook helper (no @testing-library/react dependency)  */
/* ------------------------------------------------------------------ */

interface RenderHookResult<T> {
  result: { current: T };
  rerender: (args?: unknown) => void;
  unmount: () => void;
}

function renderHook<T>(hookFn: () => T): RenderHookResult<T> {
  const result: { current: T } = { current: undefined as unknown as T };
  let container: HTMLDivElement;
  let root: Root;

  function TestComponent(): null {
    result.current = hookFn();
    return null;
  }

  act(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    root.render(<TestComponent />);
  });

  return {
    result,
    rerender: () => {
      act(() => {
        root.render(<TestComponent />);
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorageWithObject', () => {
  describe('initialization', () => {
    it('returns the initial value when localStorage is empty', () => {
      const initial = { name: 'default', count: 0 };
      const { result, unmount } = renderHook(() => useLocalStorageWithObject('test-key', initial));

      expect(result.current[0]).toEqual(initial);
      unmount();
    });

    it('persists the initial value to localStorage on first render', () => {
      const initial = { enabled: true };
      const { unmount } = renderHook(() => useLocalStorageWithObject('persist-key', initial));

      expect(localStorage.getItem('persist-key')).toBe(JSON.stringify(initial));
      unmount();
    });

    it('reads an existing valid value from localStorage', () => {
      const stored = { name: 'stored', count: 42 };
      localStorage.setItem('pre-set', JSON.stringify(stored));

      const { result, unmount } = renderHook(() =>
        useLocalStorageWithObject('pre-set', { name: '', count: 0 })
      );

      expect(result.current[0]).toEqual(stored);
      unmount();
    });

    it('falls back to initialValue when localStorage contains invalid JSON', () => {
      localStorage.setItem('bad-json', '{not valid json!!!');
      const initial = { fallback: true };

      const { result, unmount } = renderHook(() => useLocalStorageWithObject('bad-json', initial));

      expect(result.current[0]).toEqual(initial);
      unmount();
    });

    it('falls back to initialValue when localStorage value has wrong structure', () => {
      localStorage.setItem('wrong-shape', JSON.stringify({ unrelated: 'data' }));
      const initial = { name: '', count: 0 };

      const { result, unmount } = renderHook(() =>
        useLocalStorageWithObject('wrong-shape', initial)
      );

      expect(result.current[0]).toEqual(initial);
      unmount();
    });

    it('falls back to initialValue when stored type differs from reference', () => {
      localStorage.setItem('type-mismatch', JSON.stringify('a string'));
      const initial = { key: 'value' };

      const { result, unmount } = renderHook(() =>
        useLocalStorageWithObject('type-mismatch', initial)
      );

      expect(result.current[0]).toEqual(initial);
      unmount();
    });
  });

  describe('setter (direct value)', () => {
    it('updates state and localStorage when called with a new value', () => {
      const initial = { count: 0 };
      const { result, rerender, unmount } = renderHook(() =>
        useLocalStorageWithObject('setter-key', initial)
      );

      const newValue = { count: 5 };
      act(() => {
        result.current[1](newValue);
      });
      rerender();

      expect(result.current[0]).toEqual(newValue);
      expect(localStorage.getItem('setter-key')).toBe(JSON.stringify(newValue));
      unmount();
    });
  });

  describe('setter (updater function)', () => {
    it('applies an updater function based on the previous state', () => {
      const initial = { count: 10 };
      const { result, rerender, unmount } = renderHook(() =>
        useLocalStorageWithObject('updater-key', initial)
      );

      act(() => {
        result.current[1]((prev) => ({ count: prev.count + 1 }));
      });
      rerender();

      expect(result.current[0]).toEqual({ count: 11 });
      unmount();
    });

    it('falls back to initialValue in updater when stored JSON is invalid', () => {
      const initial = { count: 0 };
      // Seed corrupt data BEFORE mounting so the hook initializes from invalid storage
      localStorage.setItem('corrupt-updater', 'not-json');

      const { result, rerender, unmount } = renderHook(() =>
        useLocalStorageWithObject('corrupt-updater', initial)
      );

      act(() => {
        result.current[1]((prev) => ({ count: prev.count + 100 }));
      });
      rerender();

      // The updater parses prevState from storage — invalid JSON → initialValue fallback
      expect(result.current[0]).toEqual({ count: 100 });
      unmount();
    });

    it('falls back to initialValue in updater when stored value has wrong structure', () => {
      const initial = { name: 'default', active: true };
      // Seed structurally incompatible data BEFORE mounting so the hook initializes from it
      localStorage.setItem('wrong-struct-updater', JSON.stringify({ unrelated: 123 }));

      const { result, rerender, unmount } = renderHook(() =>
        useLocalStorageWithObject('wrong-struct-updater', initial)
      );

      act(() => {
        result.current[1]((prev) => ({ ...prev, active: false }));
      });
      rerender();

      expect(result.current[0]).toEqual({ name: 'default', active: false });
      unmount();
    });
  });

  describe('clear', () => {
    it('removes the key from localStorage', () => {
      const initial = { data: 'test' };
      const { result, unmount } = renderHook(() => useLocalStorageWithObject('clear-key', initial));

      expect(localStorage.getItem('clear-key')).not.toBeNull();

      act(() => {
        result.current[2]();
      });

      expect(localStorage.getItem('clear-key')).toBeNull();
      unmount();
    });
  });

  describe('complex types', () => {
    it('handles arrays as top-level values', () => {
      const initial = [1, 2, 3];
      const { result, rerender, unmount } = renderHook(() =>
        useLocalStorageWithObject('array-key', initial)
      );

      expect(result.current[0]).toEqual([1, 2, 3]);

      act(() => {
        result.current[1]([4, 5, 6]);
      });
      rerender();

      expect(result.current[0]).toEqual([4, 5, 6]);
      expect(localStorage.getItem('array-key')).toBe(JSON.stringify([4, 5, 6]));
      unmount();
    });

    it('handles nested objects', () => {
      const initial = { settings: { theme: 'light', fontSize: 14 }, user: { name: '' } };
      const stored = { settings: { theme: 'dark', fontSize: 16 }, user: { name: 'Alice' } };
      localStorage.setItem('nested-key', JSON.stringify(stored));

      const { result, unmount } = renderHook(() =>
        useLocalStorageWithObject('nested-key', initial)
      );

      expect(result.current[0]).toEqual(stored);
      unmount();
    });

    it('handles primitive values (string)', () => {
      const { result, rerender, unmount } = renderHook(() =>
        useLocalStorageWithObject('prim-key', 'hello')
      );

      expect(result.current[0]).toBe('hello');

      act(() => {
        result.current[1]('world');
      });
      rerender();

      expect(result.current[0]).toBe('world');
      unmount();
    });

    it('handles boolean values', () => {
      const { result, rerender, unmount } = renderHook(() =>
        useLocalStorageWithObject('bool-key', false)
      );

      expect(result.current[0]).toBe(false);

      act(() => {
        result.current[1](true);
      });
      rerender();

      expect(result.current[0]).toBe(true);
      unmount();
    });

    it('handles numeric values', () => {
      const { result, rerender, unmount } = renderHook(() =>
        useLocalStorageWithObject('num-key', 0)
      );

      expect(result.current[0]).toBe(0);

      act(() => {
        result.current[1](42);
      });
      rerender();

      expect(result.current[0]).toBe(42);
      unmount();
    });
  });
});
