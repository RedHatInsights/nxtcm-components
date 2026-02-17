import { Section, WizCheckbox, WizTextInput } from '@patternfly-labs/react-form-wizard';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';
import { Alert, Content, ContentVariants } from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from '../../../../../../context/TranslationContext';
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
} from '../../../validators';
import { constructSelectedSubnets } from '../../../helpers';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';

export const NetworkingOptionalSubstep = (props: any) => {
  const { t } = useTranslation();
  const { setIsClusterWideProxySelected } = props;
  const { value } = useInput(props);
  const { cluster } = value;
  const defaultCidrValue = cluster?.cidr_default;
  const clusterWideProxy = cluster?.['configure_proxy'];
  React.useEffect(() => {
    setIsClusterWideProxySelected(!!clusterWideProxy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterWideProxy]);

  const selectedSubnets = constructSelectedSubnets(cluster);

  const machineDisjointSubnets = disjointSubnets('network_machine_cidr');
  const serviceDisjointSubnets = disjointSubnets('network_service_cidr');
  const podDisjointSubnets = disjointSubnets('network_pod_cidr');
  const awsServiceSubnetMask = awsSubnetMask('network_service_cidr');

  const hostPrexiValidators = (value: string) => hostPrefix(value);
  const cidrValidators = (value: string) => cidr(value) || validateRange(value) || undefined;

  const machineCidrValidators = (value: string) =>
    cidrValidators(value) ||
    awsMachineCidr(value, cluster) ||
    validateRange(value) ||
    subnetCidrs(value, cluster, 'network_machine_cidr', selectedSubnets) ||
    machineDisjointSubnets(value, cluster) ||
    undefined;

  const serviceCidrValidators = (value: string) =>
    cidrValidators(value) ||
    serviceCidr(value) ||
    serviceDisjointSubnets(value, cluster) ||
    awsServiceSubnetMask(value) ||
    subnetCidrs(value, cluster, 'network_service_cidr', selectedSubnets) ||
    undefined;

  const podCidrValidators = (value: string) =>
    cidrValidators(value) ||
    podCidr(value, cluster?.network_host_prefix) ||
    podDisjointSubnets(value, cluster) ||
    subnetCidrs(value, cluster, 'network_pod_cidr', selectedSubnets) ||
    undefined;

  return (
    <>
      <Section
        id="optional-networking-substep-section"
        key="optional-networking-substep-section-key"
        label={t('Networking')}
      >
        <WizCheckbox
          id="cluster-wide-proxy"
          path="cluster.configure_proxy"
          label={t('Configure a cluter-wide proxy')}
          helperText={t(
            'Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster.'
          )}
        />
      </Section>

      <Section
        id="optional-networking-cidr-ranges-section"
        key="optional-networking-cidr-ranges-section-key"
        label={t('CIDR ranges')}
      >
        <Alert
          variant="info"
          title={t(
            'Take a not of the keys associated with your cluster. If you delete your keys, the cluster will not be available'
          )}
          ouiaId="encryptionKeysAlert"
        >
          <Content component={ContentVariants.p}>
            {t(`Specify non-overelapping ranges for machine, service, and pod ranges. Make sure that
            your internal organization&apos;s networking ranges do not overlap with ours, which are
            Kubernetes. Each range should correspond to the first IP address in their subnet.`)}
          </Content>

          <Content component={ContentVariants.p}>
            <ExternalLink href={links.CIDR_RANGE_DEFINITIONS_ROSA}>
              Learn more about configuring network settings
            </ExternalLink>
          </Content>
        </Alert>
        <WizCheckbox
          id="use-cidr-default-values"
          path="cluster.cidr_default"
          label={t('Use default values')}
          helperText={t(
            'The values are safe defaults. However, you must ensure that the Machine CIDR matches the selected VPC subnets.'
          )}
        />

        <WizTextInput
          validation={machineCidrValidators}
          validateOnBlur
          id="network_machine_cidr"
          path="cluster.network_machine_cidr"
          label={t('Machine CIDR')}
          helperText={t('Subnet mask must be between /16 and /25')}
          disabled={defaultCidrValue}
        />

        <WizTextInput
          validation={serviceCidrValidators}
          validateOnBlur
          id="network_service_cidr"
          path="cluster.network_service_cidr"
          label={t('Service CIDR')}
          helperText={t('Subnet mask must be at most /24')}
          disabled={defaultCidrValue}
        />

        <WizTextInput
          validation={podCidrValidators}
          validateOnBlur
          id="network_pod_cidr"
          path="cluster.network_pod_cidr"
          label={t('Pod CIDR')}
          helperText={t('Subnet mask must allow for at least 32 nodes')}
          disabled={defaultCidrValue}
        />

        <WizTextInput
          validation={hostPrexiValidators}
          validateOnBlur
          path="cluster.network_host_prefix"
          label={t('Host prefix')}
          helperText={t('Must be between /23 and /26')}
          disabled={defaultCidrValue}
        />
      </Section>
    </>
  );
};
