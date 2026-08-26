import type { UseFormSetValue } from 'react-hook-form';

import {
  DEFAULT_FORM_SET_VALUE_OPTS,
  DEFAULT_FORM_SET_VALUE_OPTS_WITH_VALIDATE,
} from '../utilities/formSetValueOptions';
import { resolveSelectedVpc } from '../utilities/helpers';
import type { ROSAHCPCluster, ROSAHCPWizardData, Role, VPC } from '../types';
import type { WizardFieldDerivedSyncKey } from '../yupSchemas/types';
import type { WizardFieldDerivedSyncEntry } from '../yupSchemas/wizardFieldMetaChangeRegistry';

import { hasRefetchableStringValue } from '../utilities/hasRefetchableStringValue';

export { hasRefetchableStringValue };

export type ApplyWizardFieldDerivedSyncArgs = {
  syncKey: WizardFieldDerivedSyncKey;
  currentValue: unknown;
  formValues: Partial<ROSAHCPCluster>;
  wizardData: ROSAHCPWizardData;
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>;
};

function hasSelectedVpcValue(value: unknown): value is string | VPC {
  if (hasRefetchableStringValue(value)) {
    return true;
  }
  if (value != null && typeof value === 'object' && 'id' in value) {
    const id = (value as VPC).id;
    return typeof id === 'string' && id !== '';
  }
  return false;
}

/** Whether a derived sync should run/re-run for the current source-field value. */
export function hasDerivedSyncSourceValue(
  syncKey: WizardFieldDerivedSyncKey,
  value: unknown
): boolean {
  switch (syncKey) {
    case 'installerRoleDependentRoles':
      return hasRefetchableStringValue(value);
    case 'vpcSecurityGroupsWorkerSelection':
      return hasSelectedVpcValue(value);
    default:
      return false;
  }
}

function securityGroupSelectionsEqual(
  current: readonly string[],
  next: readonly string[]
): boolean {
  return current.length === next.length && current.every((id, index) => id === next[index]);
}

/** Drops worker security group IDs that are no longer available on the resolved selected VPC. */
export function syncSecurityGroupsWorkerWithVpc(
  selectedVpcRaw: unknown,
  currentSelection: string[] | undefined,
  vpcListData: readonly VPC[],
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>
): void {
  const vpc = resolveSelectedVpc(selectedVpcRaw as ROSAHCPCluster['selected_vpc'], [
    ...vpcListData,
  ]);
  if (!vpc?.id) {
    return;
  }

  const availableIds = new Set(
    (vpc.aws_security_groups ?? [])
      .map((group) => group.id)
      .filter((id): id is string => typeof id === 'string' && id !== '')
  );
  const current = Array.isArray(currentSelection) ? currentSelection : [];
  const pruned = current.filter((id) => availableIds.has(id));

  if (!securityGroupSelectionsEqual(current, pruned)) {
    setValue('security_groups_worker', pruned, DEFAULT_FORM_SET_VALUE_OPTS_WITH_VALIDATE);
  }
}

/** Sets support/worker role ARNs from the first options on the matching installer role entry. */
export function syncInstallerRoleDependentRoles(
  installerRoleArn: string | undefined,
  roles: readonly Role[],
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>
): void {
  const selectedRole = roles.find((role) => role.installerRole.value === installerRoleArn);
  setValue(
    'support_role_arn',
    selectedRole?.supportRole[0]?.value ?? '',
    DEFAULT_FORM_SET_VALUE_OPTS
  );
  setValue(
    'worker_role_arn',
    selectedRole?.workerRole[0]?.value ?? '',
    DEFAULT_FORM_SET_VALUE_OPTS
  );
}

const wizardFieldDerivedSyncHandlers: Record<
  WizardFieldDerivedSyncKey,
  (args: ApplyWizardFieldDerivedSyncArgs) => void
> = {
  installerRoleDependentRoles: ({ currentValue, wizardData, setValue }) => {
    syncInstallerRoleDependentRoles(
      typeof currentValue === 'string' ? currentValue : undefined,
      wizardData.roles.data,
      setValue
    );
  },
  vpcSecurityGroupsWorkerSelection: ({ currentValue, formValues, wizardData, setValue }) => {
    syncSecurityGroupsWorkerWithVpc(
      currentValue,
      formValues.security_groups_worker,
      wizardData.vpcList.data,
      setValue
    );
  },
};

/** Runs the derived sync handler registered for `syncKey`. */
export function applyWizardFieldDerivedSync(args: ApplyWizardFieldDerivedSyncArgs): void {
  wizardFieldDerivedSyncHandlers[args.syncKey](args);
}

/** Re-applies derived syncs when wizard data changes but source field values are unchanged. */
export function reapplyWizardFieldDerivedSyncs(params: {
  entries: readonly WizardFieldDerivedSyncEntry[];
  formValues: Partial<ROSAHCPCluster>;
  wizardData: ROSAHCPWizardData;
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>;
}): void {
  const { entries, formValues, wizardData, setValue } = params;

  for (const { sourceField, syncKey } of entries) {
    const currentValue = formValues[sourceField];
    if (!hasDerivedSyncSourceValue(syncKey, currentValue)) {
      continue;
    }

    applyWizardFieldDerivedSync({
      syncKey,
      currentValue,
      formValues,
      wizardData,
      setValue,
    });
  }
}
