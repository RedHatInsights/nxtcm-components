import type { UseFormSetValue } from 'react-hook-form';

import { resolveSelectedVpc } from './helpers';
import type { ROSAHCPCluster, ROSAHCPWizardData, Role, VPC } from './types';
import type { WizardFieldDerivedSyncKey } from './yupSchemas/types';
import type { WizardFieldDerivedSyncEntry } from './yupSchemas/wizardFieldMetaChangeRegistry';

/** Non-empty string suitable for resource refetch args and string-backed derived sync sources. */
export function hasRefetchableStringValue(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

export type ApplyWizardFieldDerivedSyncArgs = {
  syncKey: WizardFieldDerivedSyncKey;
  currentValue: unknown;
  formValues: Partial<ROSAHCPCluster>;
  wizardData: ROSAHCPWizardData;
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>;
};

const SET_VALUE_OPTS = {
  shouldDirty: true,
  shouldTouch: false,
  shouldValidate: false,
};

const PRUNE_SET_VALUE_OPTS = {
  shouldDirty: true,
  shouldTouch: false,
  shouldValidate: true,
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

/** Wizard-data slices that should re-run a derived sync when they change while the source field is set. */
export const wizardFieldDerivedSyncWizardDataDeps: Record<
  WizardFieldDerivedSyncKey,
  (wizardData: ROSAHCPWizardData) => readonly unknown[]
> = {
  installerRoleDependentRoles: (wizardData) => [wizardData.roles.data],
  vpcSecurityGroupsWorkerSelection: (wizardData) => [wizardData.vpcList.data],
};

/** Collects wizard-data dependency values for all derived sync handlers in `entries`. */
export function collectWizardFieldDerivedSyncWizardDataDeps(
  entries: readonly Pick<WizardFieldDerivedSyncEntry, 'syncKey'>[],
  wizardData: ROSAHCPWizardData
): readonly unknown[] {
  const deps: unknown[] = [];
  const seenSyncKeys = new Set<WizardFieldDerivedSyncKey>();

  for (const { syncKey } of entries) {
    if (seenSyncKeys.has(syncKey)) {
      continue;
    }
    seenSyncKeys.add(syncKey);
    deps.push(...wizardFieldDerivedSyncWizardDataDeps[syncKey](wizardData));
  }

  return deps;
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
    setValue('security_groups_worker', pruned, PRUNE_SET_VALUE_OPTS);
  }
}

/** Sets support/worker role ARNs from the first options on the matching installer role entry. */
export function syncInstallerRoleDependentRoles(
  installerRoleArn: string | undefined,
  roles: readonly Role[],
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>
): void {
  const selectedRole = roles.find((role) => role.installerRole.value === installerRoleArn);
  setValue('support_role_arn', selectedRole?.supportRole[0]?.value ?? '', SET_VALUE_OPTS);
  setValue('worker_role_arn', selectedRole?.workerRole[0]?.value ?? '', SET_VALUE_OPTS);
}

export const wizardFieldDerivedSyncHandlers: Record<
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
