import {
  getFieldOptionIdentity,
  reconcileFieldValueWithNewOptions,
  type FieldOptionLike,
} from './reconcileFieldValueWithNewOptions';

const optsByValue: FieldOptionLike[] = [
  { label: 'East', value: 'us-east-1' },
  { label: 'West', value: 'us-west-2' },
];

const optsByKey: FieldOptionLike[] = [
  { key: 'us-east-1', label: 'East' },
  { key: 'us-west-2', label: 'West' },
];

describe('getFieldOptionIdentity', () => {
  it('reads value when option uses value', () => {
    expect(getFieldOptionIdentity({ value: 'x' })).toBe('x');
  });

  it('reads key when option uses key', () => {
    expect(getFieldOptionIdentity({ key: 'y' })).toBe('y');
  });
});

describe('reconcileFieldValueWithNewOptions', () => {
  it('returns current value when identity matches by value', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-west-2',
        newOptions: optsByValue,
        defaultValue: '',
      })
    ).toBe('us-west-2');
  });

  it('returns current value when identity matches by key', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-east-1',
        newOptions: optsByKey,
        defaultValue: '',
      })
    ).toBe('us-east-1');
  });

  it('returns default when identity is absent from new options', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'eu-central-1',
        newOptions: optsByValue,
        defaultValue: '',
      })
    ).toBe('');
  });

  it('returns default for empty current value', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: '',
        newOptions: optsByValue,
        defaultValue: '',
      })
    ).toBe('');
  });

  it('returns default when currentLabel is provided and no row has matching identity+label', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-east-1',
        currentLabel: 'Wrong label',
        newOptions: optsByValue,
        defaultValue: '',
      })
    ).toBe('');
  });

  it('returns current value when identity and label match a row', () => {
    expect(
      reconcileFieldValueWithNewOptions({
        currentValue: 'us-east-1',
        currentLabel: 'East',
        newOptions: optsByValue,
        defaultValue: '',
      })
    ).toBe('us-east-1');
  });
});
