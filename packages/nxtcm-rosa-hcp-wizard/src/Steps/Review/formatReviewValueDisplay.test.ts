jest.mock('../../yupSchemas', () => ({
  wizardFieldMetaByPath: jest.fn((path: string) => {
    if (path === 'compute_root_volume') {
      return { unit: 'GiB' };
    }
    return undefined;
  }),
}));

import { ClusterNetwork, ClusterUpgrade } from '../../types';

import { defaultRosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.defaults';
import { formatReviewFieldValue } from './formatReviewValueDisplay';

const strings = defaultRosaHcpWizardStrings;
const reviewOptions = {
  vpc: [
    { label: 'production-vpc', value: 'vpc-prod' },
    { label: 'staging-vpc', value: 'vpc-stage' },
  ],
  subnet: [
    { label: 'private-subnet-a', value: 'subnet-a' },
    { label: 'private-subnet-b', value: 'subnet-b' },
  ],
  securityGroup: [
    { label: 'default', value: 'sg-default' },
    { label: 'web-server-sg', value: 'sg-web' },
  ],
};

describe('formatReviewFieldValue selected_vpc', () => {
  it('returns the option label when form value is a vpc id string', () => {
    expect(
      formatReviewFieldValue('selected_vpc', { selected_vpc: 'vpc-prod' }, strings, reviewOptions)
    ).toBe('production-vpc');
  });

  it('returns the option label when form value is a vpc object', () => {
    expect(
      formatReviewFieldValue(
        'selected_vpc',
        { selected_vpc: { id: 'vpc-stage', name: 'ignored-name', aws_subnets: [] } },
        strings,
        reviewOptions
      )
    ).toBe('staging-vpc');
  });

  it('falls back to vpc name when options are missing', () => {
    expect(
      formatReviewFieldValue(
        'selected_vpc',
        { selected_vpc: { id: 'vpc-abc', name: 'my-vpc', aws_subnets: [] } },
        strings
      )
    ).toBe('my-vpc');
  });

  it('returns empty when no vpc is selected', () => {
    expect(formatReviewFieldValue('selected_vpc', {}, strings, reviewOptions)).toBe('');
  });
});

describe('formatReviewFieldValue machine_pools_subnets', () => {
  it('returns subnet labels for selected subnet ids', () => {
    expect(
      formatReviewFieldValue(
        'machine_pools_subnets',
        { machine_pools_subnets: [{ machine_pool_subnet: 'subnet-a' }] },
        strings,
        reviewOptions
      )
    ).toBe('private-subnet-a');
  });

  it('falls back to subnet id when options are missing', () => {
    expect(
      formatReviewFieldValue(
        'machine_pools_subnets',
        { machine_pools_subnets: [{ machine_pool_subnet: 'subnet-unknown' }] },
        strings
      )
    ).toBe('subnet-unknown');
  });
});

describe('formatReviewFieldValue imds', () => {
  it('returns both IMDS label for imdsv1andimdsv2', () => {
    expect(
      formatReviewFieldValue('imds', { imds: 'imdsv1andimdsv2' }, strings, reviewOptions)
    ).toBe(strings.machinePools.imdsBothLabel);
  });

  it('returns IMDSv2 label for imdsv2only', () => {
    expect(formatReviewFieldValue('imds', { imds: 'imdsv2only' }, strings, reviewOptions)).toBe(
      strings.machinePools.imdsV2Label
    );
  });
});

describe('formatReviewFieldValue compute_root_volume', () => {
  it('appends unit from field meta', () => {
    expect(
      formatReviewFieldValue('compute_root_volume', { compute_root_volume: 400 }, strings)
    ).toBe('400 GiB');
  });
});

describe('formatReviewFieldValue cluster_privacy', () => {
  it('maps external to the public networking label', () => {
    expect(
      formatReviewFieldValue(
        'cluster_privacy',
        { cluster_privacy: ClusterNetwork.external },
        strings
      )
    ).toBe(strings.networking.publicLabel);
  });

  it('maps internal to the private networking label', () => {
    expect(
      formatReviewFieldValue(
        'cluster_privacy',
        { cluster_privacy: ClusterNetwork.internal },
        strings
      )
    ).toBe(strings.networking.privateLabel);
  });
});

describe('formatReviewFieldValue cluster updates', () => {
  it('maps upgrade_policy manual to individual updates label', () => {
    expect(
      formatReviewFieldValue('upgrade_policy', { upgrade_policy: ClusterUpgrade.manual }, strings)
    ).toBe(strings.review.strategyIndividual);
  });

  it('maps upgrade_policy automatic to recurring updates label', () => {
    expect(
      formatReviewFieldValue(
        'upgrade_policy',
        { upgrade_policy: ClusterUpgrade.automatic },
        strings
      )
    ).toBe(strings.review.strategyAutomatic);
  });

  it('formats upgrade_schedule cron as day and hour', () => {
    expect(
      formatReviewFieldValue('upgrade_schedule', { upgrade_schedule: '00 14 * * 2' }, strings)
    ).toBe('Tuesday, 14:00 UTC');
  });
});

describe('formatReviewFieldValue security_groups_worker', () => {
  it('returns security group labels in form order', () => {
    expect(
      formatReviewFieldValue(
        'security_groups_worker',
        { security_groups_worker: ['sg-web', 'sg-default'] },
        strings,
        reviewOptions
      )
    ).toBe('web-server-sg, default');
  });

  it('falls back to security group id when options are missing', () => {
    expect(
      formatReviewFieldValue(
        'security_groups_worker',
        { security_groups_worker: ['sg-unknown'] },
        strings
      )
    ).toBe('sg-unknown');
  });
});

describe('formatReviewFieldValue upgrade_schedule', () => {
  it('returns a human-readable day and time from the cron string', () => {
    expect(
      formatReviewFieldValue('upgrade_schedule', { upgrade_schedule: '00 4 * * 0' }, strings)
    ).toBe('Sunday, 04:00 UTC');
  });

  it('returns empty when schedule is missing', () => {
    expect(formatReviewFieldValue('upgrade_schedule', {}, strings)).toBe('');
  });
});
