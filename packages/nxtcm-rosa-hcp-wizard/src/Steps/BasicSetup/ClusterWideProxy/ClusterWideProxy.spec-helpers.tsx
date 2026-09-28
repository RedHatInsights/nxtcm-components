/**
 * Playwright CT mount target for ClusterWideProxy.
 * Components from *.story.tsx cannot be mounted (see playwright.dev/test-components#test-stories).
 */
import React, { useMemo } from 'react';

import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';

import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { DocsVersionProvider } from '../../../ROSAHCPWizardDocsVersionProvider';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import {
  makeDefaultRosaHcpCtWizardData,
  WizardFieldMetaChangeEffectsCtHarness,
} from '../../../test/rosaHcpWizardCtSpecHelpers';
import {
  ClusterEncryptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  type ROSAHCPCluster,
} from '../../../types';
import { createClusterValidationResolver } from '../../../utilities/clusterValidationResolver';
import { ClusterWideProxy } from './ClusterWideProxy';

/** Defaults aligned with {@link ROSAHCPWizardBody} so the composed Yup schema resolves consistently in CT. */
const DEFAULT_ROSA_HCP_CT_FORM_VALUES: Partial<ROSAHCPCluster> = {
  associated_aws_id: '',
  byo_oidc_config_id: '',
  custom_operator_roles_prefix: '',
  encryption_keys: ClusterEncryptionKeys.default,
  etcd_encryption: false,
  configure_proxy: true,
  cidr_default: true,
  network_machine_cidr: '10.0.0.0/16',
  network_service_cidr: '172.30.0.0/16',
  network_pod_cidr: '10.128.0.0/14',
  network_host_prefix: '/23',
  autoscaling: false,
  nodes_compute: 2,
  upgrade_policy: ClusterUpgrade.manual,
  cluster_privacy: ClusterNetwork.external,
  compute_root_volume: 300,
  billing_account_id: '',
  region: '',
  name: '',
  cluster_version: '',
  installer_role_arn: '',
  support_role_arn: '',
  worker_role_arn: '',
  http_proxy_url: '',
  https_proxy_url: '',
  no_proxy_domains: '',
  additional_trust_bundle: '',
};

export type ClusterWideProxyMountProps = {
  defaultValues?: Partial<ROSAHCPCluster>;
  /** Published docs majors supplied to DocsVersionProvider (defaults to `[]`). */
  docsVersions?: string[];
};

const CT_WIZARD_DATA = makeDefaultRosaHcpCtWizardData();

export const ClusterWideProxyMount: React.FC<ClusterWideProxyMountProps> = ({
  defaultValues = {},
  docsVersions,
}) => {
  const resolver = useMemo(
    () => createClusterValidationResolver(defaultRosaHcpWizardValidatorStrings),
    []
  );

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: resolver as Resolver<ROSAHCPCluster>,
    mode: 'onTouched',
  });

  return withRosaCt(
    <DocsVersionProvider docsVersions={docsVersions}>
      <FormProvider {...methods}>
        <Form>
          <WizardFieldMetaChangeEffectsCtHarness wizardData={CT_WIZARD_DATA} />
          <ClusterWideProxy />
        </Form>
      </FormProvider>
    </DocsVersionProvider>
  );
};
