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
import links from '../../../constants/links';
import { ClusterNetwork, ROSAHCPCluster, ROSAHCPWizardData } from '../../../types';
import { WizRadioGroup } from '../../../components/WizFields/WizRadioGroup';
import { Radio } from '../../../components/Fields/RadioGroup';
import { clusterValidationSchema } from '../../../yupSchemas';
import { FieldWrapper } from '../../../components/FieldWrapper';
import { useFormContext, useWatch } from 'react-hook-form';
import { WizSelect } from '../../../components/WizFields/WizSelect';
import { WizCheckbox } from '../../../components/WizFields/WizCheckbox';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';

import { useEffect, useMemo, useRef } from 'react';
import { useClearFieldWhenHidden } from '../../OptionalSetup/Encryption/useClearFieldWhenHidden';
import { buildMachinePoolsReviewSelectOptions, resolveSelectedVpc } from '../../../helpers';

type NetworkingStepProps = Pick<ROSAHCPWizardData, 'vpcList' | 'subnets'>;

export const Networking = (props: NetworkingStepProps) => {
  const { networking: n } = useRosaHcpWizardStrings();

  const cidrDefaultChecked = useWatch({ name: 'cidr_default' });
  const selectedVPCRaw = useWatch({ name: 'selected_vpc' });

  const selectedVPC = resolveSelectedVpc(selectedVPCRaw, props.vpcList.data);

  const { publicSubnet } = useMemo(
    () => buildMachinePoolsReviewSelectOptions(selectedVPC, props.vpcList.data),
    [selectedVPC, props.vpcList.data]
  );

  const clusterPrivacy = useWatch({ name: 'cluster_privacy' });
  useClearFieldWhenHidden<ROSAHCPCluster>(
    'cluster_privacy_public_subnet_id',
    clusterPrivacy === ClusterNetwork.internal
  );

  const { setValue } = useFormContext<ROSAHCPCluster>();
  const previousVpcRef = useRef<string | undefined>(selectedVPC?.id);
  useEffect(() => {
    const currentVpcId = selectedVPC?.id;
    if (previousVpcRef.current === null || previousVpcRef.current === undefined) {
      previousVpcRef.current = currentVpcId;
      return;
    }
    if (currentVpcId !== previousVpcRef.current) {
      setValue('cluster_privacy_public_subnet_id', undefined as never, { shouldValidate: true });
    }
    previousVpcRef.current = currentVpcId;
  }, [selectedVPC?.id, setValue]);

  return (
    <Section label={n.sectionLabel} description={n.privacyHelper}>
      <FieldWrapper>
        <WizRadioGroup name="cluster_privacy" schema={clusterValidationSchema}>
          <Radio
            labelHelp={n.publicPopover}
            id="external"
            value={ClusterNetwork.external}
            label={n.publicLabel}
          >
            <WizSelect
              name="cluster_privacy_public_subnet_id"
              schema={clusterValidationSchema}
              options={publicSubnet}
            />
          </Radio>

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
