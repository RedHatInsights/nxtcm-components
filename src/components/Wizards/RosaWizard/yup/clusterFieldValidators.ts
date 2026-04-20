/**
 * Pure cluster-field validators shared by the Yup schema and (previously) inline `validation` props.
 * Keeps networking CIDR / disjoint logic in one place next to the schema.
 */
import type { ClusterFormData, CIDRSubnet } from '../../types';
import { constructSelectedSubnets } from '../helpers';
import type { RosaWizardValidatorStrings } from '../rosaWizardStrings';
import {
  awsMachineCidr,
  awsSubnetMask,
  cidr,
  disjointSubnets,
  hostPrefix,
  podCidr,
  serviceCidr,
  subnetCidrs,
  validateRange,
} from '../validators';

export function validateClusterNetworkMachineCidr(
  value: string | undefined,
  cluster: ClusterFormData,
  v: RosaWizardValidatorStrings
): string | undefined {
  const selectedSubnets = constructSelectedSubnets(cluster) as CIDRSubnet[];
  const machineDisjointSubnets = disjointSubnets('network_machine_cidr', v.disjointSubnets);
  const cidrValidators = (val: string) =>
    cidr(val, v.cidr) || validateRange(val, v.validateRange, v.cidr) || undefined;
  return (
    cidrValidators(value ?? '') ||
    awsMachineCidr(value ?? '', cluster, v.awsMachineCidr) ||
    validateRange(value ?? '', v.validateRange, v.cidr) ||
    subnetCidrs(value ?? '', cluster, 'network_machine_cidr', selectedSubnets, v.subnetCidrs) ||
    machineDisjointSubnets(value ?? '', cluster) ||
    undefined
  );
}

export function validateClusterNetworkServiceCidr(
  value: string | undefined,
  cluster: ClusterFormData,
  v: RosaWizardValidatorStrings
): string | undefined {
  const selectedSubnets = constructSelectedSubnets(cluster) as CIDRSubnet[];
  const serviceDisjointSubnets = disjointSubnets('network_service_cidr', v.disjointSubnets);
  const awsServiceSubnetMask = awsSubnetMask('network_service_cidr', v.serviceCidr);
  const cidrValidators = (val: string) =>
    cidr(val, v.cidr) || validateRange(val, v.validateRange, v.cidr) || undefined;
  return (
    cidrValidators(value ?? '') ||
    serviceCidr(value ?? '', v.serviceCidr) ||
    serviceDisjointSubnets(value ?? '', cluster) ||
    awsServiceSubnetMask(value ?? '') ||
    subnetCidrs(value ?? '', cluster, 'network_service_cidr', selectedSubnets, v.subnetCidrs) ||
    undefined
  );
}

export function validateClusterNetworkPodCidr(
  value: string | undefined,
  cluster: ClusterFormData,
  v: RosaWizardValidatorStrings
): string | undefined {
  const selectedSubnets = constructSelectedSubnets(cluster) as CIDRSubnet[];
  const podDisjointSubnets = disjointSubnets('network_pod_cidr', v.disjointSubnets);
  const cidrValidators = (val: string) =>
    cidr(val, v.cidr) || validateRange(val, v.validateRange, v.cidr) || undefined;
  return (
    cidrValidators(value ?? '') ||
    podCidr(value ?? '', cluster?.network_host_prefix, v.podCidr) ||
    podDisjointSubnets(value ?? '', cluster) ||
    subnetCidrs(value ?? '', cluster, 'network_pod_cidr', selectedSubnets, v.subnetCidrs) ||
    undefined
  );
}

export function validateClusterNetworkHostPrefix(
  value: string | undefined,
  _cluster: ClusterFormData,
  v: RosaWizardValidatorStrings
): string | undefined {
  return hostPrefix(value ?? '', v.hostPrefix);
}

export function validateProxyAtLeastOne(cluster: ClusterFormData, message: string): string | undefined {
  if (!cluster.http_proxy_url && !cluster.https_proxy_url && !cluster.additional_trust_bundle) {
    return message;
  }
  return undefined;
}
