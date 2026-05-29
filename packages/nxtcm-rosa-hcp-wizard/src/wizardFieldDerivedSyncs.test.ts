import type { UseFormSetValue } from 'react-hook-form';

import fixtures from './ROSAHCPWizard.fixtures';
import {
  reapplyWizardFieldDerivedSyncs,
  syncInstallerRoleDependentRoles,
  syncSecurityGroupsWorkerWithVpc,
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

describe('syncSecurityGroupsWorkerWithVpc', () => {
  const vpcId = fixtures.mockVPCs[0].id;
  const sg1 = fixtures.mockSecurityGroups[0].id;
  const sg2 = fixtures.mockSecurityGroups[1].id;
  const staleSg = 'sg-stale';

  it('prunes worker security group IDs that are no longer on the selected VPC', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const vpcList = [
      {
        ...fixtures.mockVPCs[0],
        aws_security_groups: fixtures.mockSecurityGroups.filter((group) => group.id === sg1),
      },
    ];

    syncSecurityGroupsWorkerWithVpc(vpcId, [sg1, staleSg], vpcList, setValue);

    expect(setValue).toHaveBeenCalledWith('security_groups_worker', [sg1], expect.any(Object));
  });

  it('does not setValue when all selected IDs remain available', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncSecurityGroupsWorkerWithVpc(vpcId, [sg1, sg2], fixtures.mockVPCs, setValue);

    expect(setValue).not.toHaveBeenCalled();
  });

  it('no-ops when the selected VPC cannot be resolved', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    syncSecurityGroupsWorkerWithVpc('vpc-missing', [sg1], fixtures.mockVPCs, setValue);

    expect(setValue).not.toHaveBeenCalled();
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

  it('prunes worker security groups when vpcList data changes for the selected VPC', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const vpcId = fixtures.mockVPCs[0].id;
    const sg1 = fixtures.mockSecurityGroups[0].id;
    const wizardData = {
      vpcList: {
        data: [
          {
            ...fixtures.mockVPCs[0],
            aws_security_groups: fixtures.mockSecurityGroups.filter((group) => group.id === sg1),
          },
        ],
        error: null,
        isFetching: false,
        fetch: jest.fn(),
      },
    } as unknown as ROSAHCPWizardData;

    reapplyWizardFieldDerivedSyncs({
      entries: [{ sourceField: 'selected_vpc', syncKey: 'vpcSecurityGroupsWorkerSelection' }],
      formValues: {
        selected_vpc: vpcId,
        security_groups_worker: [sg1, 'sg-stale'],
      },
      wizardData,
      setValue,
    });

    expect(setValue).toHaveBeenCalledWith('security_groups_worker', [sg1], expect.any(Object));
  });
});
