import type { UseFormSetValue } from 'react-hook-form';

import fixtures from '../ROSAHCPWizard.fixtures';
import { createMockRosaHcpWizardData } from '../ROSAHCPWizard.stories.helpers';
import type { ROSAHCPCluster, ROSAHCPWizardData } from '../types';
import {
  hasDerivedSyncSourceValue,
  reapplyWizardFieldDerivedSyncs,
  syncInstallerRoleDependentRoles,
  syncSecurityGroupsWorkerWithVpc,
} from './wizardFieldDerivedSyncs';

const invalidVpcValues = [
  { description: 'null', value: null },
  { description: 'an array', value: [fixtures.mockVPCs[0]] },
  { description: 'a numeric ID', value: { ...fixtures.mockVPCs[0], id: 123 } },
];

const retainedVpcValues = [
  { description: 'an ID-only object', value: { id: fixtures.mockVPCs[0].id } },
  {
    description: 'a malformed security group list',
    value: { ...fixtures.mockVPCs[0], aws_security_groups: {} },
  },
  {
    description: 'a malformed subnet list',
    value: { ...fixtures.mockVPCs[0], aws_subnets: [null] },
  },
];

describe('hasDerivedSyncSourceValue for VPC security groups', () => {
  it.each([
    { description: 'a VPC ID', value: fixtures.mockVPCs[0].id },
    { description: 'a complete VPC object', value: fixtures.mockVPCs[0] },
    ...retainedVpcValues,
  ])('accepts $description', ({ value }) => {
    expect(hasDerivedSyncSourceValue('vpcSecurityGroupsWorkerSelection', value)).toBe(true);
  });

  it.each([
    { description: 'undefined', value: undefined },
    { description: 'an empty selection string', value: '' },
    { description: 'an empty VPC ID', value: { ...fixtures.mockVPCs[0], id: '' } },
    ...invalidVpcValues,
  ])('does not run derived synchronization for $description', ({ value }) => {
    expect(hasDerivedSyncSourceValue('vpcSecurityGroupsWorkerSelection', value)).toBe(false);
  });
});

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

  it.each(invalidVpcValues)('preserves the current selection for $description', ({ value }) => {
    const setValue = jest.fn();

    syncSecurityGroupsWorkerWithVpc(value, [sg1, sg2], fixtures.mockVPCs, setValue);

    expect(setValue).not.toHaveBeenCalled();
  });

  it.each(retainedVpcValues)(
    'prunes stale security groups for $description using fresh list data',
    ({ value }) => {
      const setValue = jest.fn();
      const vpcList = [
        {
          ...fixtures.mockVPCs[0],
          aws_security_groups: fixtures.mockSecurityGroups.filter((group) => group.id === sg1),
        },
      ];

      syncSecurityGroupsWorkerWithVpc(value, [sg1, staleSg], vpcList, setValue);

      expect(setValue).toHaveBeenCalledTimes(1);
      expect(setValue).toHaveBeenCalledWith(
        'security_groups_worker',
        [sg1],
        expect.objectContaining({ shouldValidate: true })
      );
    }
  );

  it.each(retainedVpcValues)(
    'preserves the current selection when $description cannot be resolved',
    ({ value }) => {
      const setValue = jest.fn();

      syncSecurityGroupsWorkerWithVpc(value, [sg1, staleSg], [], setValue);

      expect(setValue).not.toHaveBeenCalled();
    }
  );

  it('prunes stale security groups from a complete VPC object without a list lookup', () => {
    const setValue = jest.fn();
    const selectedVpc = {
      ...fixtures.mockVPCs[0],
      aws_security_groups: fixtures.mockSecurityGroups.filter((group) => group.id === sg1),
    };

    syncSecurityGroupsWorkerWithVpc(selectedVpc, [sg1, staleSg], [], setValue);

    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenCalledWith(
      'security_groups_worker',
      [sg1],
      expect.objectContaining({ shouldValidate: true })
    );
  });
});

describe('reapplyWizardFieldDerivedSyncs', () => {
  it('prunes retained VPC selections when fresh list data arrives', () => {
    const setValue = jest.fn();
    const sg1 = fixtures.mockSecurityGroups[0].id;
    const formValues: Partial<ROSAHCPCluster> = {
      security_groups_worker: [sg1, 'sg-stale'],
    };
    // Restored form values can contain only the VPC identity at runtime.
    Object.assign(formValues, { selected_vpc: { id: fixtures.mockVPCs[0].id } });
    const wizardData = createMockRosaHcpWizardData({
      vpcList: { data: [], error: null, isFetching: false, fetch: jest.fn() },
    });
    const reapply = (): void =>
      reapplyWizardFieldDerivedSyncs({
        entries: [{ sourceField: 'selected_vpc', syncKey: 'vpcSecurityGroupsWorkerSelection' }],
        formValues,
        wizardData,
        setValue,
      });

    reapply();
    expect(setValue).not.toHaveBeenCalled();

    wizardData.vpcList.data = [
      {
        ...fixtures.mockVPCs[0],
        aws_security_groups: fixtures.mockSecurityGroups.filter((group) => group.id === sg1),
      },
    ];
    reapply();

    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenCalledWith(
      'security_groups_worker',
      [sg1],
      expect.objectContaining({ shouldValidate: true })
    );
  });

  it('re-syncs support and worker ARNs when installer role is set', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const installerArn = fixtures.mockRoles[0].installerRole.value;
    const wizardData = createMockRosaHcpWizardData({
      roles: {
        data: fixtures.mockRoles,
        error: null,
        isFetching: false,
        fetch: jest.fn(),
        ocmRoleError: null,
        userRoleError: null,
        ocmRoleARN: null,
      },
    });

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

    const wizardData = createMockRosaHcpWizardData({
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
    });

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
