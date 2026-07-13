import { STEP_IDS } from './constants';
import { resolveWizardFieldPathStepId } from './rosaHcpWizardValidationContext';

describe('resolveWizardFieldPathStepId', () => {
  const fieldPathToStepId: Readonly<Record<string, string>> = {
    selected_vpc: STEP_IDS.MACHINE_POOLS,
    machine_pools_subnets: STEP_IDS.MACHINE_POOLS,
    region: STEP_IDS.DETAILS,
  };

  it('returns the step for a top-level field path', () => {
    expect(resolveWizardFieldPathStepId('region', fieldPathToStepId)).toBe(STEP_IDS.DETAILS);
  });

  it('returns the step for a nested field via its registered parent path', () => {
    expect(
      resolveWizardFieldPathStepId('machine_pools_subnets.0.machine_pool_subnet', fieldPathToStepId)
    ).toBe(STEP_IDS.MACHINE_POOLS);
  });

  it('returns undefined when no ancestor path is registered', () => {
    expect(resolveWizardFieldPathStepId('unknown.nested.path', fieldPathToStepId)).toBeUndefined();
  });
});
