import type { ClusterFormData } from '@/components/Wizards/types';
import { getAutoscalingMaxNodes } from './getAutoscalingMaxNodes';
import { constructSelectedSubnets, getWorkerNodeVolumeSizeMaxGiB } from './helpers';
import type { RosaHcpWizardValidatorStrings } from './stringsProvider/rosaHcpWizardStrings';
import type { ValidationSchemaContext } from './yupSchemas/types';

export function buildClusterValidationSchemaContext(
  formValues: Partial<ClusterFormData>,
  msgs: RosaHcpWizardValidatorStrings,
  options: {
    checkClusterNameUniqueness?: ValidationSchemaContext['checkClusterNameUniqueness'];
  } = {}
): ValidationSchemaContext {
  const version = formValues.cluster_version?.trim() ?? '';
  return {
    msgs,
    maxRootDiskSize: getWorkerNodeVolumeSizeMaxGiB(version || '4.15.0'),
    maxAutoscalingNodes: getAutoscalingMaxNodes(version || undefined),
    machinePoolsNumber: formValues.machine_pools_subnets?.length ?? 0,
    selectedSubnets: constructSelectedSubnets(formValues as ClusterFormData),
    checkClusterNameUniqueness: options.checkClusterNameUniqueness,
  };
}
