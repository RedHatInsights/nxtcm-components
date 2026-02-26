import { CIDRSubnet, Subnet, VPC } from '../types';
import { MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH } from './constants';

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

const constructSelectedSubnets = (formValues?: Record<string, any>) => {
  type MachinePoolSubnet = {
    availability_zone: string;
    machine_pool_subnet: string;
    publicSubnetId: string;
  };
  const usePrivateLink = formValues?.use_privatelink;

  let privateSubnets: CIDRSubnet[] = [];
  let publicSubnets: CIDRSubnet[] = [];
  let selectedSubnets: CIDRSubnet[] = [];

  if (formValues?.selected_vpc) {
    const privateSubnetIds = formValues?.machine_pools_subnets
      .map((obj: MachinePoolSubnet) => obj.machine_pool_subnet)
      .filter((id: string) => id !== undefined && id !== '');

    const publicSubnetIds = formValues?.cluster_privacy_public_subnet_id;

    if (formValues?.selected_vpc?.aws_subnets) {
      privateSubnets = formValues?.selected_vpc?.aws_subnets.filter((obj: Subnet) =>
        privateSubnetIds.includes(obj.subnet_id)
      );

      publicSubnets = formValues?.selected_vpc?.aws_subnets.filter((obj: Subnet) =>
        publicSubnetIds.includes(obj.subnet_id)
      );
    }

    if (usePrivateLink) {
      selectedSubnets = privateSubnets;
    } else {
      selectedSubnets = privateSubnets.concat(publicSubnets);
    }
  }

  return selectedSubnets;
};

const subnetsFilter = (selectedVPC: VPC) => {
  const privateSubnets = selectedVPC?.aws_subnets.filter((privateSubnet: Subnet) =>
    privateSubnet.name.includes('private')
  );

  const publicSubnets = selectedVPC?.aws_subnets.filter((publicSubnet: Subnet) =>
    publicSubnet.name.includes('public')
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

export {
  createOperatorRolesPrefix,
  stringToArray,
  arrayToString,
  parseCIDRSubnetLength,
  constructSelectedSubnets,
  subnetsFilter,
  truncateTextWithEllipsis,
};
