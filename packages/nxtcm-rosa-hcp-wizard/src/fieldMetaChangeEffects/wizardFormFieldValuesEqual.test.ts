import { wizardFormFieldValuesEqual } from './wizardFormFieldValuesEqual';

describe('wizardFormFieldValuesEqual', () => {
  it('treats identical primitives as equal', () => {
    expect(wizardFormFieldValuesEqual('us-east-1', 'us-east-1')).toBe(true);
    expect(wizardFormFieldValuesEqual(false, false)).toBe(true);
  });

  it('treats string and object ids as equal for select-backed values', () => {
    expect(
      wizardFormFieldValuesEqual('vpc-abc', { id: 'vpc-abc', name: 'my-vpc', aws_subnets: [] })
    ).toBe(true);
  });

  it('compares string arrays by element value', () => {
    expect(wizardFormFieldValuesEqual(['sg-1', 'sg-2'], ['sg-1', 'sg-2'])).toBe(true);
    expect(wizardFormFieldValuesEqual(['sg-1'], ['sg-1', 'sg-2'])).toBe(false);
    expect(wizardFormFieldValuesEqual(['sg-1'], ['sg-2'])).toBe(false);
  });

  it('compares machine pool subnet rows by content', () => {
    const left = [{ machine_pool_subnet: 'subnet-a' }];
    const right = [{ machine_pool_subnet: 'subnet-a' }];
    expect(wizardFormFieldValuesEqual(left, right)).toBe(true);
    expect(wizardFormFieldValuesEqual(left, [{ machine_pool_subnet: 'subnet-b' }])).toBe(false);
  });

  it('returns false when only one side is an array', () => {
    expect(wizardFormFieldValuesEqual(['sg-1'], 'sg-1')).toBe(false);
  });
});
