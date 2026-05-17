import { ClusterFormData, MachinePoolSubnetEntry, VPC } from '@/components/Wizards/types';
import type { LabelValueOption } from '../../helpers';
import { getNestedValue } from '../../helpers';
import { RosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings.types';
import { wizardFieldMetaByPath } from '../../yupSchemas';

export type ReviewSelectOption = LabelValueOption;

export type ReviewSelectOptions = {
  vpc?: ReviewSelectOption[];
  subnet?: ReviewSelectOption[];
  securityGroup?: ReviewSelectOption[];
};

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

export function formatReviewFieldValue(
  path: string,
  formValues: Partial<ClusterFormData>,
  strings: RosaHcpWizardStrings,
  reviewOptions?: ReviewSelectOptions
): string {
  const raw = normalizeEmptyFormValue(getNestedValue(formValues, path));

  if (path === 'imds' && typeof raw === 'string' && raw !== '') {
    const mp = strings.machinePools;
    if (raw === 'imdsv1andimdsv2') {
      return mp.imdsBothLabel;
    }
    if (raw === 'imdsv2only') {
      return mp.imdsV2Label;
    }
    return raw;
  }

  if (path === 'security_groups_worker' && Array.isArray(raw)) {
    const ids = raw.filter((id): id is string => typeof id === 'string' && id !== '');
    return formatIdsAsOptionLabels(ids, reviewOptions?.securityGroup);
  }

  if (path === 'selected_vpc') {
    return formatSelectedVpcForReview(raw, reviewOptions?.vpc);
  }

  if (path === 'machine_pools_subnets' && Array.isArray(raw)) {
    const subnetIds = (raw as MachinePoolSubnetEntry[])
      .map((entry) => entry?.machine_pool_subnet?.trim() ?? '')
      .filter((id) => id !== '');
    return formatIdsAsOptionLabels(subnetIds, reviewOptions?.subnet);
  }

  const meta = wizardFieldMetaByPath(path);
  const scalar = formatScalarForReview(raw);
  if (scalar !== '' && meta?.unit) {
    return `${scalar} ${meta.unit}`;
  }
  return scalar;
}
