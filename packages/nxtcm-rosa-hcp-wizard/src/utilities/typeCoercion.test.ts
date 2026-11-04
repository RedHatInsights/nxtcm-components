import { coerceToArray } from './typeCoercion';

describe('coerceToArray', () => {
  it('returns the array when value is already an array', () => {
    const input = ['a', 'b'];
    expect(coerceToArray<string>(input)).toBe(input);
  });

  it('returns an empty array when value is undefined', () => {
    expect(coerceToArray<string>(undefined)).toEqual([]);
  });

  it('returns an empty array when value is null', () => {
    expect(coerceToArray<string>(null)).toEqual([]);
  });

  it('returns an empty array when value is a string (non-array)', () => {
    expect(coerceToArray<string>('not-an-array')).toEqual([]);
  });

  it('returns an empty array when value is a number', () => {
    expect(coerceToArray<number>(42)).toEqual([]);
  });

  it('returns an empty array when value is a plain object', () => {
    expect(coerceToArray<string>({ key: 'val' })).toEqual([]);
  });

  it('preserves empty arrays', () => {
    const input: string[] = [];
    expect(coerceToArray<string>(input)).toBe(input);
  });

  it('preserves object arrays (referential identity)', () => {
    const input = [{ id: 'a' }, { id: 'b' }];
    expect(coerceToArray<{ id: string }>(input)).toBe(input);
  });
});
