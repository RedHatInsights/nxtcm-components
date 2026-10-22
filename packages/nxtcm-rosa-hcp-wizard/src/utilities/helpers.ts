import type { Path, PathValue } from 'react-hook-form';

import {
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
  MAX_ROOT_DISK_SIZE_NEW_OPENSHIFT,
  MAX_ROOT_DISK_SIZE_OLD_OPENSHIFT,
  MAX_SECURITY_GROUP_DISPLAY_LENGTH,
  OPERATOR_ROLES_HASH_LENGTH,
} from '../constants';
import { securityGroupsSort } from '../Steps/BasicSetup/MachinePools/SecurityGroupSection/helpers';
import {
  ClusterUpgrade,
  MachinePoolSubnetEntry,
  ROSAHCPCluster,
  SecurityGroup,
  Subnet,
  VPC,
} from '../types';
import { hasObjectProperty, isObjectRecord } from './typeGuards';

export type LabelValueOption = { label: string; value: string };

export type MachinePoolsReviewSelectOptions = {
  vpc: LabelValueOption[];
  subnet: LabelValueOption[];
  publicSubnet: LabelValueOption[];
  securityGroup: LabelValueOption[];
};

/** Dot-separated path lookup on plain objects (e.g. `metadata.name`). */
export function getNestedValue<T, P extends Path<T>>(
  source: T,
  path: P
): PathValue<T, P> | undefined;
/** Dynamic paths and untyped inputs require the caller to narrow the result. */
export function getNestedValue(source: unknown, path: string): unknown;
export function getNestedValue(source: unknown, path: string): unknown {
  if (source == null || path === '') return undefined;
  let current: unknown = source;
  for (const key of path.split('.')) {
    if (!hasObjectProperty(current, key)) return undefined;
    current = current[key];
  }
  return current;
}

export function getSelectedVpcId(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  return isObjectRecord(value) && typeof value.id === 'string' ? value.id : undefined;
}

/** Resolves retained selections against fresh data before validating their shape. */
export function resolveSelectedVpc(
  selectedVpcRaw: unknown,
  vpcListData: readonly VPC[]
): VPC | undefined {
  const id = getSelectedVpcId(selectedVpcRaw);
  const listedVpc = id ? vpcListData.find((vpc) => vpc.id === id) : undefined;
  const vpc = listedVpc ?? selectedVpcRaw;

  return isSelectedVpcValue(vpc) && typeof vpc !== 'string' ? vpc : undefined;
}

/** Subnet ids selected for machine pools, omitting empty rows. */
export function getMachinePoolSubnetIds(
  machinePoolSubnets: readonly MachinePoolSubnetEntry[] | undefined
): string[] {
  return (machinePoolSubnets ?? [])
    .map((entry) => entry.machine_pool_subnet?.trim() ?? '')
    .filter((id) => id !== '');
}

/** Availability zones of the given subnet ids on the selected VPC. */
export function getAvailabilityZonesForSubnetIds(
  selectedVPC: VPC | undefined,
  subnetIds: readonly string[]
): string[] {
  if (!selectedVPC?.aws_subnets?.length || subnetIds.length === 0) {
    return [];
  }
  const idSet = new Set(subnetIds);
  const zones = new Set<string>();
  for (const subnet of selectedVPC.aws_subnets) {
    if (idSet.has(subnet.subnet_id) && subnet.availability_zone !== '') {
      zones.add(subnet.availability_zone);
    }
  }
  return [...zones];
}

/**
 * Builds VPC / subnet / SG select options.
 * When `machinePoolSubnetIds` is provided, public subnets are limited to the
 * availability zones of those machine-pool (private) subnets so Networking
 * cannot offer a public subnet in a different AZ.
 */
export function buildMachinePoolsReviewSelectOptions(
  selectedVPC: VPC | undefined,
  vpcListData: VPC[],
  machinePoolSubnetIds?: readonly string[]
): MachinePoolsReviewSelectOptions {
  const publicSubnetAvailabilityZones =
    machinePoolSubnetIds === undefined
      ? undefined
      : getAvailabilityZonesForSubnetIds(selectedVPC, machinePoolSubnetIds);
  const { privateSubnets, publicSubnets } = subnetsFilter(
    selectedVPC,
    publicSubnetAvailabilityZones
  );
  const securityGroups = [...(selectedVPC?.aws_security_groups ?? [])];
  securityGroups.sort(securityGroupsSort);

  return {
    vpc: vpcListData.map((vpc) => ({
      label: vpc.name,
      value: vpc.id,
    })),
    subnet: (privateSubnets ?? []).map((subnet) => ({
      label: subnet.name,
      value: subnet.subnet_id,
    })),
    publicSubnet: (publicSubnets ?? []).map((subnet) => ({
      label: subnet.name,
      value: subnet.subnet_id,
    })),
    securityGroup: securityGroups.map(({ id = '', name = '' }) => ({
      label: name ? truncateTextWithEllipsis(name, MAX_SECURITY_GROUP_DISPLAY_LENGTH) : '--',
      value: id,
    })),
  };
}

const secureRandomValueInRange = (min: number, max: number) => {
  const uints = new Uint32Array(1);
  crypto.getRandomValues(uints);
  const randomNumber = uints[0] / (0xffffffff + 1);
  const minNum = Math.ceil(min);
  const maxNum = Math.floor(max);
  return Math.floor(randomNumber * (maxNum - minNum + 1)) + minNum;
};

const createOperatorRolesHash = () => {
  const prefixArray = Array.from(
    crypto.getRandomValues(new Uint8Array(OPERATOR_ROLES_HASH_LENGTH))
  ).map((value) => (value % 36).toString(36));
  // cannot start with a number
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const randomCharacter = alphabet[secureRandomValueInRange(0, 25)];
  prefixArray[0] = randomCharacter;
  return prefixArray.join('');
};

const createOperatorRolesPrefix = (clusterName?: string) => {
  const allowedLength = MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH - (OPERATOR_ROLES_HASH_LENGTH + 1);
  const operatorRolesClusterName = clusterName?.slice(0, allowedLength);

  return `${operatorRolesClusterName}-${createOperatorRolesHash()}`;
};

const stringToArray = (str?: string) => str && str.trim().split(',');

const parseSubnetLength = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  return parseInt(value.split('/').pop() ?? '', 10);
};

const constructSelectedSubnets = (formValues?: ROSAHCPCluster): Subnet[] => {
  if (!formValues?.selected_vpc) {
    return [];
  }

  const privateSubnetIds = (formValues?.machine_pools_subnets ?? [])
    .map((obj: MachinePoolSubnetEntry) => obj.machine_pool_subnet)
    .filter((id: string) => id !== undefined && id !== '');

  // single subnet id from WizSelect — always a string, not an array
  const publicSubnetId = formValues?.cluster_privacy_public_subnet_id;

  const selectedVpc = formValues.selected_vpc;
  if (typeof selectedVpc === 'string' || !selectedVpc?.aws_subnets) {
    return [];
  }

  // aws_subnets contains Subnet data at runtime even though VPC types it as Subnet[]
  const subnets = selectedVpc.aws_subnets;

  const privateSubnets = subnets.filter((obj: Subnet) => privateSubnetIds.includes(obj.subnet_id));

  const publicSubnets = subnets.filter((obj: Subnet) =>
    publicSubnetId ? obj.subnet_id === publicSubnetId : false
  );

  return privateSubnets.concat(publicSubnets);
};

const subnetsFilter = (
  selectedVPC: VPC | undefined,
  publicSubnetAvailabilityZones?: readonly string[]
): { publicSubnets: Subnet[] | undefined; privateSubnets: Subnet[] | undefined } => {
  const privateSubnets = selectedVPC?.aws_subnets.filter(
    (privateSubnet: Subnet) => privateSubnet.public === false
  );

  const zoneSet =
    publicSubnetAvailabilityZones === undefined
      ? undefined
      : new Set(publicSubnetAvailabilityZones);

  const publicSubnets = selectedVPC?.aws_subnets.filter((publicSubnet: Subnet) => {
    if (publicSubnet.public !== true) {
      return false;
    }
    if (zoneSet === undefined) {
      return true;
    }
    return zoneSet.has(publicSubnet.availability_zone);
  });

  return {
    publicSubnets,
    privateSubnets,
  };
};

const truncateTextWithEllipsis = (text: string, maxLength?: number) => {
  if (text && maxLength && text.length > maxLength) {
    return `${text.slice(0, maxLength / 3)}... ${text.slice((-maxLength * 2) / 3)}`;
  }
  return text;
};

/**
 * Split version string to an array.
 *
 * @param version cluster version raw ID (i.e. "4.13.5")
 * @returns An array with destructuralized version [major, minor, patch, ...]
 */
const splitVersion = (version: string): number[] => {
  let versionArray = [];
  try {
    versionArray = version.split('.').map((num) => parseInt(num, 10));
    versionArray[1] = versionArray[1] ?? 0;
    versionArray[2] = versionArray[2] ?? 0;
  } catch {
    return [];
  }
  return versionArray;
};

const canSelectImds = (clusterVersionRawId: string): boolean => {
  const [major, minor] = splitVersion(clusterVersionRawId);
  return major > 4 || (major === 4 && minor >= 11);
};

/**
 * Returns ROSA/AWS max worker node volume size, varies per cluster version.
 * In GiB.
 */
const getWorkerNodeVolumeSizeMaxGiB = (clusterVersionRawId: string): number => {
  const [major, minor] = splitVersion(clusterVersionRawId);
  return major > 4 || (major === 4 && minor >= 14)
    ? MAX_ROOT_DISK_SIZE_NEW_OPENSHIFT
    : MAX_ROOT_DISK_SIZE_OLD_OPENSHIFT;
};

const showSecurityGroupsSection = (clusterVersionRawId: string): boolean => {
  const [major, minor] = splitVersion(clusterVersionRawId);
  return major > 4 || (major === 4 && minor >= 14);
};

const parseUpdateSchedule = (cronString: string): [string, string] => {
  if (!cronString) {
    return ['', ''];
  }

  const parts = cronString.split(' ');
  if (parts.length < 5) {
    return ['', ''];
  }

  const hour = parts[1];
  const day = parts[4];

  return [hour, day];
};

const formatUpgradeScheduleForReview = (
  cronString: string,
  daysOfWeek: readonly string[]
): string => {
  const [hour, day] = parseUpdateSchedule(cronString);
  if (hour === '' && day === '') {
    return '';
  }

  const dayIndex = Number(day);
  const dayName =
    day !== '' && !Number.isNaN(dayIndex) && daysOfWeek[dayIndex] ? daysOfWeek[dayIndex] : '';
  const hourNum = Number(hour);
  const hourLabel =
    hour !== '' && !Number.isNaN(hourNum) ? `${hourNum.toString().padStart(2, '0')}:00 UTC` : '';

  if (dayName && hourLabel) {
    return `${dayName}, ${hourLabel}`;
  }
  return dayName || hourLabel || cronString;
};

const formatUpgradePolicyForReview = (
  policy: ClusterUpgrade,
  labels: { individualLabel: string; recurringLabel: string }
): string => {
  if (policy === ClusterUpgrade.manual) {
    return labels.individualLabel;
  }
  return labels.recurringLabel;
};

const isSubnet = (value: unknown): value is Subnet => {
  return (
    isObjectRecord(value) &&
    typeof value.subnet_id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.availability_zone === 'string' &&
    typeof value.public === 'boolean' &&
    typeof value.cidr_block === 'string'
  );
};

const isSecurityGroup = (value: unknown): value is SecurityGroup => {
  return (
    isObjectRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    (value.red_hat_managed === undefined || typeof value.red_hat_managed === 'boolean')
  );
};

const isSelectedVpcValue = (value: unknown): value is ROSAHCPCluster['selected_vpc'] => {
  if (value === undefined || typeof value === 'string') {
    return true;
  }

  return (
    isObjectRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.aws_subnets) &&
    value.aws_subnets.every(isSubnet) &&
    (value.aws_security_groups === undefined ||
      (Array.isArray(value.aws_security_groups) &&
        value.aws_security_groups.every(isSecurityGroup)))
  );
};

export {
  createOperatorRolesPrefix,
  stringToArray,
  parseSubnetLength,
  constructSelectedSubnets,
  truncateTextWithEllipsis,
  canSelectImds,
  getWorkerNodeVolumeSizeMaxGiB,
  showSecurityGroupsSection,
  parseUpdateSchedule,
  formatUpgradeScheduleForReview,
  formatUpgradePolicyForReview,
  isSelectedVpcValue,
};
