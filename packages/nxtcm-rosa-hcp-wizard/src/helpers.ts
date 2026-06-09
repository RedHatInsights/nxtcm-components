import { MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH } from './constants';
import { securityGroupsSort } from './Steps/BasicSetup/MachinePools/SecurityGroupSection/helpers';
import {
  ClusterUpgrade,
  CIDRSubnet,
  MachinePoolSubnetEntry,
  ROSAHCPCluster,
  Subnet,
  VPC,
} from './types';

export type LabelValueOption = { label: string; value: string };

export type MachinePoolsReviewSelectOptions = {
  vpc: LabelValueOption[];
  subnet: LabelValueOption[];
  publicSubnet: LabelValueOption[];
  securityGroup: LabelValueOption[];
};

/** Dot-separated path lookup on plain objects (e.g. `metadata.name`). */
export function getNestedValue(source: unknown, path: string): unknown {
  if (source == null || path === '') return undefined;
  let current: unknown = source;
  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function resolveSelectedVpc(
  selectedVpcRaw: ROSAHCPCluster['selected_vpc'] | undefined,
  vpcListData: VPC[]
): VPC | undefined {
  if (typeof selectedVpcRaw === 'string') {
    return vpcListData.find((vpc) => vpc.id === selectedVpcRaw);
  }
  return selectedVpcRaw;
}

export function buildMachinePoolsReviewSelectOptions(
  selectedVPC: VPC | undefined,
  vpcListData: VPC[]
): MachinePoolsReviewSelectOptions {
  const { privateSubnets, publicSubnets } = subnetsFilter(selectedVPC);
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
      label: name ? truncateTextWithEllipsis(name, 50) : '--',
      value: id,
    })),
  };
}

const OPERATOR_ROLES_HASH_LENGTH = 4;

/**
 * Generates cryptographically secure number within small range
 * there's a slight bias towards the lower end of the range.
 * @param min minimum range including min
 * @param max maximum range including max
 * @returns returns a cryptographically secure number within provided small range
 */
const secureRandomValueInRange = (min: number, max: number) => {
  const uints = new Uint32Array(1);
  crypto.getRandomValues(uints);
  const randomNumber = uints[0] / (0xffffffff + 1);
  const minNum = Math.ceil(min);
  const maxNum = Math.floor(max);
  return Math.floor(randomNumber * (maxNum - minNum + 1)) + minNum;
};

export const createOperatorRolesHash = () => {
  // random 4 alphanumeric hash
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
  // increment allowedLength by 1 due to '-' character prepended to hash
  const allowedLength = MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH - (OPERATOR_ROLES_HASH_LENGTH + 1);
  const operatorRolesClusterName = clusterName?.slice(0, allowedLength);

  return `${operatorRolesClusterName}-${createOperatorRolesHash()}`;
};

const stringToArray = (str?: string) => str && str.trim().split(',');
const arrayToString = (arr?: string[]) => arr && arr.join(',');

const parseCIDRSubnetLength = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  return parseInt(value.split('/').pop() ?? '', 10);
};

const constructSelectedSubnets = (formValues?: ROSAHCPCluster): CIDRSubnet[] => {
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

  // aws_subnets contains CIDRSubnet data at runtime even though VPC types it as Subnet[]
  const subnets = selectedVpc.aws_subnets as CIDRSubnet[];

  const privateSubnets = subnets.filter((obj: CIDRSubnet) =>
    privateSubnetIds.includes(obj.subnet_id)
  );

  const publicSubnets = subnets.filter((obj: CIDRSubnet) =>
    publicSubnetId ? obj.subnet_id === publicSubnetId : false
  );

  return privateSubnets.concat(publicSubnets);
};

const subnetsFilter = (selectedVPC: VPC | undefined) => {
  const privateSubnets = selectedVPC?.aws_subnets.filter(
    (privateSubnet: Subnet) => privateSubnet.public === false
  );

  const publicSubnets = selectedVPC?.aws_subnets.filter(
    (publicSubnet: Subnet) => publicSubnet.public === true
  );

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
  } catch (error) {
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
  return (major > 4 || (major === 4 && minor >= 14) ? 16 : 1) * 1024;
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

export {
  createOperatorRolesPrefix,
  stringToArray,
  arrayToString,
  parseCIDRSubnetLength,
  constructSelectedSubnets,
  subnetsFilter,
  truncateTextWithEllipsis,
  splitVersion,
  canSelectImds,
  getWorkerNodeVolumeSizeMaxGiB,
  showSecurityGroupsSection,
  parseUpdateSchedule,
  formatUpgradeScheduleForReview,
  formatUpgradePolicyForReview,
};
