import { Alert, Content, ContentVariants, ExpandableSection } from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../constants/links';
import { ClusterNetwork, ROSAHCPCluster, ROSAHCPWizardData } from '../../../types';
import { WizRadioGroup } from '../../../components/WizFields/WizRadioGroup';
import { Radio } from '../../../components/Fields/RadioGroup';
import { clusterValidationSchema } from '../../../yupSchemas';
import { FieldWrapper, NestedFields } from '../../../components/FieldWrapper';
import { useFormContext, useWatch } from 'react-hook-form';
import { WizSelect } from '../../../components/WizFields/WizSelect';
import { WizCheckbox } from '../../../components/WizFields/WizCheckbox';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';
import { useEffect, useMemo, useRef } from 'react';
import { useClearFieldWhenHidden } from '../../OptionalSetup/Encryption/useClearFieldWhenHidden';
import {
  buildMachinePoolsReviewSelectOptions,
  resolveSelectedVpc,
} from '../../../utilities/helpers';
import { STEP_IDS } from '../../../constants';
import { useIsStepHidden } from '../../../WizardConfigContext';

type NetworkingStepProps = Pick<ROSAHCPWizardData, 'vpcList' | 'subnets'>;

type CidrFieldLabelHelpProps = {
  helpLead: string;
  href: string;
  learnMoreLink: string;
};

function CidrFieldLabelHelp({ helpLead, href, learnMoreLink }: CidrFieldLabelHelpProps) {
  return (
    <>
      {helpLead} <ExternalLink href={href}>{learnMoreLink}</ExternalLink>
    </>
  );
}

export const Networking = (props: NetworkingStepProps) => {
  const { networking: n } = useRosaHcpWizardStrings();
  const isProxyStepHidden = useIsStepHidden(STEP_IDS.CLUSTER_WIDE_PROXY);

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
        <NestedFields>
          {!isProxyStepHidden && (
            <FieldWrapper size="full">
              <WizCheckbox name="configure_proxy" schema={clusterValidationSchema} />
            </FieldWrapper>
          )}

          <Alert isExpandable variant="info" title={n.cidrAlertTitle} ouiaId="networkingCidrAlert">
            <Content component={ContentVariants.p}>{n.cidrAlertBody}</Content>

            <Content component={ContentVariants.p}>
              <ExternalLink href={links.CIDR_RANGE_DEFINITIONS_ROSA}>
                {n.cidrLearnMoreLink}
              </ExternalLink>
            </Content>
          </Alert>

          <FieldWrapper size="full">
            <WizCheckbox name="cidr_default" schema={clusterValidationSchema} />
          </FieldWrapper>

          <FieldWrapper size="lg">
            <WizTextInput<ROSAHCPCluster>
              name="network_machine_cidr"
              schema={clusterValidationSchema}
              isDisabled={cidrDefaultChecked}
              labelHelp={
                <CidrFieldLabelHelp
                  helpLead={n.machineCidrHelpLead}
                  href={links.CIDR_MACHINE}
                  learnMoreLink={n.cidrFieldLearnMoreLink}
                />
              }
            />
          </FieldWrapper>
          <FieldWrapper size="lg">
            <WizTextInput<ROSAHCPCluster>
              name="network_service_cidr"
              schema={clusterValidationSchema}
              isDisabled={cidrDefaultChecked}
              labelHelp={
                <CidrFieldLabelHelp
                  helpLead={n.serviceCidrHelpLead}
                  href={links.CIDR_SERVICE}
                  learnMoreLink={n.cidrFieldLearnMoreLink}
                />
              }
            />
          </FieldWrapper>
          <FieldWrapper size="lg">
            <WizTextInput<ROSAHCPCluster>
              name="network_pod_cidr"
              schema={clusterValidationSchema}
              isDisabled={cidrDefaultChecked}
              labelHelp={
                <CidrFieldLabelHelp
                  helpLead={n.podCidrHelpLead}
                  href={links.CIDR_POD}
                  learnMoreLink={n.cidrFieldLearnMoreLink}
                />
              }
            />
          </FieldWrapper>
          <FieldWrapper size="lg">
            <WizTextInput<ROSAHCPCluster>
              name="network_host_prefix"
              schema={clusterValidationSchema}
              isDisabled={cidrDefaultChecked}
              labelHelp={
                <CidrFieldLabelHelp
                  helpLead={n.hostPrefixHelpLead}
                  href={links.CIDR_HOST_PREFIX}
                  learnMoreLink={n.cidrFieldLearnMoreLink}
                />
              }
            />
          </FieldWrapper>
        </NestedFields>
      </ExpandableSection>
    </Section>
  );
};
