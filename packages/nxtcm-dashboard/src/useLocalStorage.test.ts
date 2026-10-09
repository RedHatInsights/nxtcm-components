import { hasMatchingStructure, safeJsonParse } from './useLocalStorage';

describe('safeJsonParse', () => {
  it('parses valid JSON and returns the value as unknown', () => {
    const result: unknown = safeJsonParse('{"a":1}');
    expect(result).toEqual({ a: 1 });
  });

  it('parses primitive JSON values', () => {
    expect(safeJsonParse('"hello"')).toBe('hello');
    expect(safeJsonParse('42')).toBe(42);
    expect(safeJsonParse('true')).toBe(true);
    expect(safeJsonParse('null')).toBeNull();
  });

  it('throws on invalid JSON', () => {
    expect(() => safeJsonParse('not json')).toThrow();
  });
});

describe('hasMatchingStructure', () => {
  describe('primitives', () => {
    it('accepts matching primitive types', () => {
      expect(hasMatchingStructure('hello', 'default')).toBe(true);
      expect(hasMatchingStructure(42, 0)).toBe(true);
      expect(hasMatchingStructure(true, false)).toBe(true);
    });

    it('rejects mismatched primitive types', () => {
      expect(hasMatchingStructure('hello', 0)).toBe(false);
      expect(hasMatchingStructure(42, 'default')).toBe(false);
      expect(hasMatchingStructure(true, 0)).toBe(false);
    });
  });

  describe('null and undefined', () => {
    it('accepts null when reference is null', () => {
      expect(hasMatchingStructure(null, null)).toBe(true);
    });

    it('accepts undefined when reference is undefined', () => {
      expect(hasMatchingStructure(undefined, undefined)).toBe(true);
    });

    it('rejects null when reference is an object', () => {
      expect(hasMatchingStructure(null, { a: 1 })).toBe(false);
    });

    it('rejects undefined when reference is a string', () => {
      expect(hasMatchingStructure(undefined, 'default')).toBe(false);
    });

    it('accepts any value when reference is null', () => {
      expect(hasMatchingStructure({ a: 1 }, null)).toBe(true);
    });

    it('accepts any value when reference is undefined', () => {
      expect(hasMatchingStructure('hello', undefined)).toBe(true);
    });
  });

  describe('arrays', () => {
    it('accepts arrays when reference is an array', () => {
      expect(hasMatchingStructure([1, 2, 3], [0])).toBe(true);
    });

    it('accepts empty arrays when reference is an array', () => {
      expect(hasMatchingStructure([], [1, 2])).toBe(true);
    });

    it('rejects arrays when reference is a plain object', () => {
      expect(hasMatchingStructure([1, 2], { a: 1 })).toBe(false);
    });

    it('rejects plain objects when reference is an array', () => {
      expect(hasMatchingStructure({ a: 1 }, [1, 2])).toBe(false);
    });
  });

  describe('objects', () => {
    it('accepts objects with all reference keys', () => {
      const reference = { name: '', age: 0, active: false };
      const parsed = { name: 'Alice', age: 30, active: true };
      expect(hasMatchingStructure(parsed, reference)).toBe(true);
    });

    it('accepts objects with extra keys beyond the reference', () => {
      const reference = { name: '' };
      const parsed = { name: 'Alice', extra: 'ignored' };
      expect(hasMatchingStructure(parsed, reference)).toBe(true);
    });

    it('rejects objects missing required keys from the reference', () => {
      const reference = { name: '', age: 0, active: false };
      const parsed = { name: 'Alice' };
      expect(hasMatchingStructure(parsed, reference)).toBe(false);
    });

    it('accepts empty objects when reference is also empty', () => {
      expect(hasMatchingStructure({}, {})).toBe(true);
    });

    it('rejects string when reference is an object', () => {
      expect(hasMatchingStructure('hello', { a: 1 })).toBe(false);
    });
  });

  describe('type narrowing', () => {
    interface Config {
      sm: number[];
      md: number[];
    }

    it('narrows the type after a successful check', () => {
      const parsed: unknown = { sm: [1], md: [2] };
      const reference: Config = { sm: [], md: [] };
      if (hasMatchingStructure(parsed, reference)) {
        // TypeScript narrows `parsed` to Config after the guard
        const config: Config = parsed;
        expect(config.sm).toEqual([1]);
      } else {
        throw new Error('Expected hasMatchingStructure to return true');
      }
    });
  });
});
