import { getValidated, helperTextId } from './helperTextUtils';

describe('getValidated', () => {
  test('returns error when isError is true', () => {
    expect(getValidated(true, false)).toBe('error');
  });

  test('returns success when isSuccess is true and not error', () => {
    expect(getValidated(false, true)).toBe('success');
  });

  test('returns undefined when neither error nor success', () => {
    expect(getValidated(false, false)).toBeUndefined();
    expect(getValidated(undefined, undefined)).toBeUndefined();
  });
});

describe('helperTextId', () => {
  test('returns id fragment when isError and errorMessage, helper text, or isSuccess and successMessage', () => {
    expect(helperTextId({ id: 'x', isError: true, errorMessage: 'err' })).toBe('x-helper-text');
    expect(helperTextId({ id: 'x', helperText: 'hint' })).toBe('x-helper-text');
    expect(helperTextId({ id: 'x', isSuccess: true, successMessage: 'ok' })).toBe('x-helper-text');
  });

  test('returns empty string when no helper content to show', () => {
    expect(helperTextId({ id: 'x' })).toBe('');
    expect(helperTextId({ id: 'x', errorMessage: 'err' })).toBe('');
    expect(helperTextId({ id: 'x', isError: true })).toBe('');
    expect(helperTextId({ id: 'x', successMessage: 'ok' })).toBe('');
    expect(helperTextId({ id: 'x', isSuccess: true })).toBe('');
  });
});
