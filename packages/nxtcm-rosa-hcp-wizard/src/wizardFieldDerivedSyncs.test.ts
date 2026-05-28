import type { UseFormSetValue } from 'react-hook-form';

import fixtures from './ROSAHCPWizard.fixtures';
import {
  reapplyWizardFieldDerivedSyncs,
  syncInstallerRoleDependentRoles,
} from './wizardFieldDerivedSyncs';
import type { ROSAHCPCluster, ROSAHCPWizardData } from './types';

describe('syncInstallerRoleDependentRoles', () => {
  it('sets support and worker ARNs from the matching installer role entry', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const installerArn = fixtures.mockRoles[0].installerRole.value;

    syncInstallerRoleDependentRoles(installerArn, fixtures.mockRoles, setValue);

    expect(setValue).toHaveBeenCalledWith(
      'support_role_arn',
      fixtures.mockRoles[0].supportRole[0].value,
      expect.any(Object)
    );
    expect(setValue).toHaveBeenCalledWith(
      'worker_role_arn',
      fixtures.mockRoles[0].workerRole[0].value,
      expect.any(Object)
    );
  });

  it('clears support and worker ARNs when installer role is empty', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncInstallerRoleDependentRoles('', fixtures.mockRoles, setValue);

    expect(setValue).toHaveBeenCalledWith('support_role_arn', '', expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('worker_role_arn', '', expect.any(Object));
  });
});

describe('reapplyWizardFieldDerivedSyncs', () => {
  it('re-syncs support and worker ARNs when installer role is set', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const installerArn = fixtures.mockRoles[0].installerRole.value;
    const wizardData = {
      roles: { data: fixtures.mockRoles, error: null, isFetching: false, fetch: jest.fn() },
    } as unknown as ROSAHCPWizardData;

    reapplyWizardFieldDerivedSyncs({
      entries: [{ sourceField: 'installer_role_arn', syncKey: 'installerRoleDependentRoles' }],
      formValues: { installer_role_arn: installerArn },
      wizardData,
      setValue,
    });

    expect(setValue).toHaveBeenCalledWith(
      'support_role_arn',
      fixtures.mockRoles[0].supportRole[0].value,
      expect.any(Object)
    );
  });
});
