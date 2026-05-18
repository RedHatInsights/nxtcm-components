import type { DropdownType } from '../components/Wizards/ROSAHCPWizard/types';

import {
  getFieldOptionIdentity,
  reconcileFieldValueWithNewOptions,
} from './reconcileFieldValueWithNewOptions';

const regionOptions: DropdownType[] = [
  { label: 'East', value: 'us-east-1' },
  { label: 'West', value: 'us-west-2' },
];

const optionsWithPatternFlyExtras: DropdownType[] = [
  { label: 'East', value: 'us-east-1', description: 'US East' },
  { label: 'West', value: 'us-west-2', disabled: true },
];

describe('getFieldOptionIdentity', () => {
  it('returns the option value', () => {
    expect(getFieldOptionIdentity({ value: 'x' })).toBe('x');
  });
});

describe('reconcileFieldValueWithNewOptions', () => {
  it('returns current value when value matches an option', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-west-2',
        newOptions: regionOptions,
        defaultValue: '',
      })
    ).toBe('us-west-2');
  });

  it('returns current value when option includes optional PatternFly fields', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-east-1',
        currentLabel: 'East',
        newOptions: optionsWithPatternFlyExtras,
        defaultValue: '',
      })
    ).toBe('us-east-1');
  });

  it('returns default when value is absent from new options', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'eu-central-1',
        newOptions: regionOptions,
        defaultValue: '',
      })
    ).toBe('');
  });

  it('returns default for empty current value', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: '',
        newOptions: regionOptions,
        defaultValue: '',
      })
    ).toBe('');
  });

  it('returns default for null or undefined current value', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: null,
        newOptions: regionOptions,
        defaultValue: 'fallback',
      })
    ).toBe('fallback');

    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: undefined,
        newOptions: regionOptions,
        defaultValue: 'fallback',
      })
    ).toBe('fallback');
  });

  it('returns default when currentLabel is provided and no option has matching value and label', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-east-1',
        currentLabel: 'Wrong label',
        newOptions: regionOptions,
        defaultValue: '',
      })
    ).toBe('');
  });

  it('returns current value when value and label match an option', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-east-1',
        currentLabel: 'East',
        newOptions: regionOptions,
        defaultValue: '',
      })
    ).toBe('us-east-1');
  });

  it('returns current value when label is omitted and value matches', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-east-1',
        newOptions: regionOptions,
        defaultValue: '',
      })
    ).toBe('us-east-1');
  });
});
