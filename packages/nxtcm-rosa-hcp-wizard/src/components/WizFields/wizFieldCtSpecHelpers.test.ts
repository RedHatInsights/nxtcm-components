import { formatWatchValue } from './wizFieldCtSpecHelpers';

describe('formatWatchValue', () => {
  it('returns "(empty)" for null', () => {
    expect(formatWatchValue(null)).toBe('(empty)');
  });

  it('returns "(empty)" for undefined', () => {
    expect(formatWatchValue(undefined)).toBe('(empty)');
  });

  it('returns "(empty)" for empty string', () => {
    expect(formatWatchValue('')).toBe('(empty)');
  });

  it('returns the string as-is for non-empty strings', () => {
    expect(formatWatchValue('hello')).toBe('hello');
  });

  it('converts a number to string', () => {
    expect(formatWatchValue(42)).toBe('42');
  });

  it('converts zero to string', () => {
    expect(formatWatchValue(0)).toBe('0');
  });

  it('converts true to string', () => {
    expect(formatWatchValue(true)).toBe('true');
  });

  it('converts false to string', () => {
    expect(formatWatchValue(false)).toBe('false');
  });

  it('JSON-stringifies a plain object', () => {
    expect(formatWatchValue({ key: 'val' })).toBe('{"key":"val"}');
  });

  it('JSON-stringifies an array', () => {
    expect(formatWatchValue([1, 2])).toBe('[1,2]');
  });
});
