import { hasMatchingStructure } from './useLocalStorage';

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

    it('rejects non-null value when reference is null', () => {
      expect(hasMatchingStructure({ a: 1 }, null)).toBe(false);
    });

    it('rejects non-undefined value when reference is undefined', () => {
      expect(hasMatchingStructure('hello', undefined)).toBe(false);
    });

    it('distinguishes null from undefined', () => {
      expect(hasMatchingStructure(null, undefined)).toBe(false);
      expect(hasMatchingStructure(undefined, null)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('accepts arrays when reference is an array', () => {
      expect(hasMatchingStructure([1, 2, 3], [0])).toBe(true);
    });

    it('accepts empty arrays when reference is an array', () => {
      expect(hasMatchingStructure([], [1, 2])).toBe(true);
    });

    it('accepts arrays with empty reference (no element validation)', () => {
      expect(hasMatchingStructure(['hello', 42], [])).toBe(true);
    });

    it('rejects arrays with mismatched element types', () => {
      expect(hasMatchingStructure(['hello', 'world'], [0])).toBe(false);
    });

    it('rejects arrays with mixed element types when reference has numbers', () => {
      expect(hasMatchingStructure([1, 'oops', 3], [0])).toBe(false);
    });

    it('accepts arrays with matching object elements', () => {
      const reference = [{ id: 0, name: '' }];
      const value = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      expect(hasMatchingStructure(value, reference)).toBe(true);
    });

    it('rejects arrays when reference is a plain object', () => {
      expect(hasMatchingStructure([1, 2], { a: 1 })).toBe(false);
    });

    it('rejects plain objects when reference is an array', () => {
      expect(hasMatchingStructure({ a: 1 }, [1, 2])).toBe(false);
    });
  });

  describe('objects', () => {
    it('accepts objects with all reference keys and matching value types', () => {
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

    it('rejects objects with mismatched value types', () => {
      const reference = { sm: [1, 2], md: [3, 4] };
      const parsed = { sm: null, md: [5, 6] };
      expect(hasMatchingStructure(parsed, reference)).toBe(false);
    });

    it('rejects objects with wrong primitive types for values', () => {
      const reference = { name: '', count: 0 };
      const parsed = { name: 42, count: 'hello' };
      expect(hasMatchingStructure(parsed, reference)).toBe(false);
    });

    it('validates nested object shapes recursively', () => {
      const reference = { settings: { theme: 'light', fontSize: 14 } };
      const validParsed = { settings: { theme: 'dark', fontSize: 16 } };
      const invalidParsed = { settings: { theme: 'dark' } };
      expect(hasMatchingStructure(validParsed, reference)).toBe(true);
      expect(hasMatchingStructure(invalidParsed, reference)).toBe(false);
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
