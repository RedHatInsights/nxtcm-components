import {
  isWizardSelectReconcileEnabled,
  listWizardFieldSelectReconcileEntries,
} from './wizardFieldSelectReconcileRegistry';

describe('wizardFieldSelectReconcileRegistry', () => {
  it('lists every Yup select field with reconcile metadata', () => {
    const entries = listWizardFieldSelectReconcileEntries();
    const paths = entries.map((entry) => entry.fieldPath);

    expect(paths).toEqual(
      expect.arrayContaining([
        'cluster_version',
        'associated_aws_id',
        'billing_account_id',
        'region',
        'installer_role_arn',
        'support_role_arn',
        'worker_role_arn',
        'byo_oidc_config_id',
        'selected_vpc',
        'machine_pools_subnets.0.machine_pool_subnet',
        'machine_type',
        'security_groups_worker',
        'cluster_privacy_public_subnet_id',
      ])
    );
  });

  it('enables reconcile for dynamic WizSelect fields', () => {
    expect(isWizardSelectReconcileEnabled('region')).toBe(true);
    expect(isWizardSelectReconcileEnabled('machine_type')).toBe(true);
    expect(isWizardSelectReconcileEnabled('selected_vpc')).toBe(true);
    expect(isWizardSelectReconcileEnabled('machine_pools_subnets.0.machine_pool_subnet')).toBe(
      true
    );
  });

  it('disables reconcile for security groups handled by derived sync', () => {
    expect(isWizardSelectReconcileEnabled('security_groups_worker')).toBe(false);
  });

  it('requires optionsWizardDataResource when reconcile is enabled', () => {
    const entries = listWizardFieldSelectReconcileEntries().filter(
      (entry) => entry.reconcileEnabled
    );

    expect(entries.every((entry) => entry.meta.optionsWizardDataResource != null)).toBe(true);
  });
});
