import {
  Alert,
  Content,
  ContentVariants,
  ExpandableSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';
import { ClusterNetwork, ROSAHCPCluster, ROSAHCPWizardData } from '../../../types';
import { WizRadioGroup } from '../../../components/WizFields/WizRadioGroup';
import { Radio } from '../../../components/Fields/RadioGroup';
import { clusterValidationSchema } from '../../../yupSchemas';
import { FieldWrapper } from '../../../components/FieldWrapper';
import { useWatch } from 'react-hook-form';
import { WizSelect } from '../../../components/WizFields/WizSelect';
import { WizCheckbox } from '../../../components/WizFields/WizCheckbox';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';

type NetworkingStepProps = Pick<ROSAHCPWizardData, 'vpcList' | 'subnets'>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Networking = (props: NetworkingStepProps) => {
  const { networking: n } = useRosaHcpWizardStrings();

  const publicSelected = useWatch({ name: 'cluster_privacy' });
  const cidrDefaultChecked = useWatch({ name: 'cidr_default' });

  return (
    <Section label={n.sectionLabel} description={n.privacyHelper}>
      <FieldWrapper>
        <WizRadioGroup name="cluster_privacy" schema={clusterValidationSchema}>
          <Radio
            labelHelp={n.publicPopover}
            id="external"
            value={ClusterNetwork.external}
            label={n.publicLabel}
          />

          {publicSelected === ClusterNetwork.external ? (
            <WizSelect name="cluster_privacy_public_subnet_id" schema={clusterValidationSchema} />
          ) : null}

          <Radio
            labelHelp={n.privatePopover}
            id="internal"
            value={ClusterNetwork.internal}
            label={n.privateLabel}
          />
        </WizRadioGroup>
      </FieldWrapper>

      <ExpandableSection isIndented toggleText={n.advancedToggle}>
        <Stack hasGutter>
          <StackItem>
            <WizCheckbox name="configure_proxy" schema={clusterValidationSchema} />
          </StackItem>

          <StackItem>
            <Alert
              isExpandable
              variant="warning"
              title={n.cidrAlertTitle}
              ouiaId="networkingCidrAlert"
            >
              <Content component={ContentVariants.p}>{n.cidrAlertBody}</Content>

              <Content component={ContentVariants.p}>
                <ExternalLink href={links.CIDR_RANGE_DEFINITIONS_ROSA}>
                  {n.cidrLearnMoreLink}
                </ExternalLink>
              </Content>
            </Alert>
          </StackItem>

          <StackItem>
            <WizCheckbox name="cidr_default" schema={clusterValidationSchema} />
          </StackItem>
          <StackItem>
            <Stack hasGutter>
              <StackItem>
                <WizTextInput<ROSAHCPCluster>
                  name="network_machine_cidr"
                  schema={clusterValidationSchema}
                  isDisabled={cidrDefaultChecked}
                />
              </StackItem>
              <StackItem>
                <WizTextInput<ROSAHCPCluster>
                  name="network_service_cidr"
                  schema={clusterValidationSchema}
                  isDisabled={cidrDefaultChecked}
                />
              </StackItem>
              <StackItem>
                <WizTextInput<ROSAHCPCluster>
                  name="network_pod_cidr"
                  schema={clusterValidationSchema}
                  isDisabled={cidrDefaultChecked}
                />
              </StackItem>

              <StackItem>
                <WizTextInput<ROSAHCPCluster>
                  name="network_host_prefix"
                  schema={clusterValidationSchema}
                  isDisabled={cidrDefaultChecked}
                />
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
      </ExpandableSection>
    </Section>
  );
};
