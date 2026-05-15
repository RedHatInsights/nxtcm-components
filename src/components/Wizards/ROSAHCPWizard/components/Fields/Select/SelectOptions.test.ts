import {
  findOptionByValue,
  normalizeOption,
  optionContainsValue,
  toggleOptionInValues,
  toggleValuesFromPfSelectId,
} from './SelectOptions';
import { isSyntheticOptionId } from './selectFieldUtils';

describe('multiSelect option helpers', () => {
  const flat = ['a', 'b', 'c'].map((s) => normalizeOption(s, 'value'));

  it('adds a value when the option is not selected', () => {
    expect(toggleOptionInValues([], flat[0], 'value')).toEqual(['a']);
  });

  it('removes a value when the option is already selected', () => {
    expect(toggleOptionInValues(['a', 'b'], flat[0], 'value')).toEqual(['b']);
  });

  it('matches object values via keyPath when toggling', () => {
    const optA = normalizeOption({ label: 'Zone A', value: { id: 'zone-a', name: 'A' } }, 'id');
    const optB = normalizeOption({ label: 'Zone B', value: { id: 'zone-b', name: 'B' } }, 'id');
    const lookup = [optA, optB];
    const selected = [{ id: 'zone-a', name: 'A' }];

    expect(optionContainsValue(optA, selected, 'id')).toBe(true);
    expect(toggleOptionInValues(selected, optB, 'id')).toEqual([
      { id: 'zone-a', name: 'A' },
      { id: 'zone-b', name: 'B' },
    ]);
    expect(toggleOptionInValues(selected, optA, 'id')).toEqual([]);
  });

  it('ignores synthetic menu option ids', () => {
    expect(isSyntheticOptionId('loading')).toBe(true);
    expect(isSyntheticOptionId('no-results')).toBe(true);
    expect(isSyntheticOptionId('empty')).toBe(true);
    expect(isSyntheticOptionId('a')).toBe(false);
    expect(toggleValuesFromPfSelectId(['a'], 'loading', flat, 'value')).toBeNull();
    expect(toggleValuesFromPfSelectId(['a'], undefined, flat, 'value')).toBeNull();
  });

  it('toggles via menu option id through flatForLookup', () => {
    expect(toggleValuesFromPfSelectId([], 'b', flat, 'value')).toEqual(['b']);
    expect(toggleValuesFromPfSelectId(['b'], 'b', flat, 'value')).toEqual([]);
    expect(toggleValuesFromPfSelectId(['a'], 'missing', flat, 'value')).toBeNull();
  });

  it('findOptionByValue resolves primitives and keyed objects', () => {
    const opt = normalizeOption({ label: 'Item', value: { id: 'x' } }, 'id');
    expect(findOptionByValue([opt], { id: 'x' }, 'id')).toBe(opt);
  });
});
