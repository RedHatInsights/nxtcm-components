import {
  ClusterNetwork,
  ClusterUpgrade,
  MachinePoolSubnetEntry,
  ROSAHCPCluster,
  VPC,
} from '../../types';
import type { LabelValueOption } from '../../utilities/helpers';
import {
  formatUpgradePolicyForReview,
  formatUpgradeScheduleForReview,
  getNestedValue,
} from '../../utilities/helpers';
import { RosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.types';
import { wizardFieldMetaByPath } from '../../yupSchemas';

export type ReviewSelectOption = LabelValueOption;

export type ReviewSelectOptions = {
  vpc?: ReviewSelectOption[];
  subnet?: ReviewSelectOption[];
  securityGroup?: ReviewSelectOption[];
};

function isClusterUpgradePolicy(value: string): value is ClusterUpgrade {
  return value === 'manual' || value === 'automatic';
}

function labelForOptionValue(value: string, options?: ReviewSelectOption[]): string {
  if (!value) {
    return '';
  }
  return options?.find((option) => option.value === value)?.label ?? value;
}

function formatIdsAsOptionLabels(ids: string[], options?: ReviewSelectOption[]): string {
  return ids
    .filter((id) => id !== '')
    .map((id) => labelForOptionValue(id, options))
    .join(', ');
}

function selectedVpcId(raw: unknown): string {
  if (typeof raw === 'string' && raw !== '') {
    return raw;
  }
  if (raw && typeof raw === 'object' && 'id' in raw) {
    return (raw as VPC).id ?? '';
  }
  return '';
}

function formatSelectedVpcForReview(raw: unknown, vpcOptions?: ReviewSelectOption[]): string {
  const id = selectedVpcId(raw);
  if (!id) {
    return '';
  }

  const match = vpcOptions?.find((option) => option.value === id);
  if (match) {
    return match.label;
  }

  if (raw && typeof raw === 'object' && 'name' in raw) {
    const vpc = raw as VPC;
    return vpc.name ?? id;
  }

  return id;
}

/** Scalar-only display helper; objects (except arrays handled elsewhere) become empty. */
function formatScalarForReview(value: unknown): string {
  if (value === '' || value === null || value === undefined) return '';
  if (typeof value === 'object') return '';
  return String(value);
}

export function normalizeEmptyFormValue(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return '';
  return value;
}

function formatImdsReviewValue(raw: unknown, strings: RosaHcpWizardStrings): string | null {
  if (typeof raw !== 'string' || raw === '') {
    return null;
  }
  const mp = strings.machinePools;
  if (raw === 'imdsv1andimdsv2') {
    return mp.imdsBothLabel;
  }
  if (raw === 'imdsv2only') {
    return mp.imdsV2Label;
  }
  return raw;
}

function formatSecurityGroupsWorkerReviewValue(
  raw: unknown,
  securityGroupOptions?: ReviewSelectOption[]
): string | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const ids = raw.filter((id): id is string => typeof id === 'string' && id !== '');
  return formatIdsAsOptionLabels(ids, securityGroupOptions);
}

function formatMachinePoolsSubnetsReviewValue(
  raw: unknown,
  subnetOptions?: ReviewSelectOption[]
): string | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const subnetIds = (raw as MachinePoolSubnetEntry[])
    .map((entry) => entry?.machine_pool_subnet?.trim() ?? '')
    .filter((id) => id !== '');
  return formatIdsAsOptionLabels(subnetIds, subnetOptions);
}

function formatClusterPrivacyReviewValue(raw: unknown, strings: RosaHcpWizardStrings): string {
  const privacy = raw as ROSAHCPCluster['cluster_privacy'];
  if (privacy === ClusterNetwork.external) {
    return strings.networking.publicLabel;
  }
  if (privacy === ClusterNetwork.internal) {
    return strings.networking.privateLabel;
  }
  return formatScalarForReview(raw);
}

function formatUpgradePolicyReviewValue(
  raw: unknown,
  strings: RosaHcpWizardStrings
): string | null {
  if (typeof raw !== 'string' || !isClusterUpgradePolicy(raw)) {
    return null;
  }
  const { review } = strings;
  return formatUpgradePolicyForReview(raw, {
    individualLabel: review.strategyIndividual,
    recurringLabel: review.strategyAutomatic,
  });
}

function formatUpgradeScheduleReviewValue(
  raw: unknown,
  strings: RosaHcpWizardStrings
): string | null {
  if (typeof raw !== 'string' || raw === '') {
    return null;
  }
  return formatUpgradeScheduleForReview(raw, strings.clusterUpdates.daysOfWeek);
}

function formatDefaultFieldReviewValue(path: string, raw: unknown): string {
  const meta = wizardFieldMetaByPath(path);
  const scalar = formatScalarForReview(raw);
  if (scalar !== '' && meta?.unit) {
    return `${scalar} ${meta.unit}`;
  }
  return scalar;
}

export function formatReviewFieldValue(
  path: string,
  formValues: Partial<ROSAHCPCluster>,
  strings: RosaHcpWizardStrings,
  reviewOptions?: ReviewSelectOptions
): string {
  const raw = normalizeEmptyFormValue(getNestedValue(formValues, path));

  switch (path) {
    case 'imds':
      return formatImdsReviewValue(raw, strings) ?? formatDefaultFieldReviewValue(path, raw);
    case 'security_groups_worker':
      return (
        formatSecurityGroupsWorkerReviewValue(raw, reviewOptions?.securityGroup) ??
        formatDefaultFieldReviewValue(path, raw)
      );
    case 'selected_vpc':
      return formatSelectedVpcForReview(raw, reviewOptions?.vpc);
    case 'machine_pools_subnets':
      return (
        formatMachinePoolsSubnetsReviewValue(raw, reviewOptions?.subnet) ??
        formatDefaultFieldReviewValue(path, raw)
      );
    case 'cluster_privacy':
      return formatClusterPrivacyReviewValue(raw, strings);
    case 'upgrade_policy':
      return (
        formatUpgradePolicyReviewValue(raw, strings) ?? formatDefaultFieldReviewValue(path, raw)
      );
    case 'upgrade_schedule':
      return (
        formatUpgradeScheduleReviewValue(raw, strings) ?? formatDefaultFieldReviewValue(path, raw)
      );
    default:
      return formatDefaultFieldReviewValue(path, raw);
  }
}
