import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Content, ContentVariants } from '@patternfly/react-core/dist/dynamic/components/Content';
import { ExpandableSection } from '@patternfly/react-core/dist/dynamic/components/ExpandableSection';

import ExternalLink from '../../../components/ExternalLink';
import { Radio } from '../../../components/Fields/RadioGroup';
import { FieldWrapper, NestedFields } from '../../../components/FieldWrapper';
import { Section } from '../../../components/Section';
import { WizCheckbox } from '../../../components/WizFields/WizCheckbox';
import { WizRadioGroup } from '../../../components/WizFields/WizRadioGroup';
import { WizSelect } from '../../../components/WizFields/WizSelect';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';
import { FIELD_NAME, STEP_IDS } from '../../../constants';
import { useGetDocsVersion } from '../../../constants/links';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { ClusterNetwork, ROSAHCPCluster, ROSAHCPWizardData } from '../../../types';
import {
  buildMachinePoolsReviewSelectOptions,
  getMachinePoolSubnetIds,
  resolveSelectedVpc,
} from '../../../utilities/helpers';
import { useIsStepHidden } from '../../../WizardConfigContext';
import { clusterValidationSchema } from '../../../yupSchemas';
import { useClearFieldWhenHidden } from '../../OptionalSetup/Encryption/useClearFieldWhenHidden';

type NetworkingStepProps = Pick<ROSAHCPWizardData, 'vpcList'>;

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

export const Networking = (props: NetworkingStepProps): ReactElement => {
  const { networking: n } = useRosaHcpWizardStrings();
  const isProxyStepHidden = useIsStepHidden(STEP_IDS.CLUSTER_WIDE_PROXY);
  const { setValue } = useFormContext<ROSAHCPCluster>();
  const clusterVersion = useWatch({ name: FIELD_NAME.CLUSTER_VERSION }) ?? '';
  const links = useGetDocsVersion(clusterVersion);

  const cidrDefaultChecked = useWatch({ name: FIELD_NAME.CIDR_DEFAULT });
  const selectedVPCRaw = useWatch({ name: FIELD_NAME.SELECTED_VPC });
  const machinePoolsSubnets = useWatch<ROSAHCPCluster, 'machine_pools_subnets'>({
    name: FIELD_NAME.MACHINE_POOLS_SUBNETS,
  });

  const selectedVPC = resolveSelectedVpc(selectedVPCRaw, props.vpcList.data);
  const machinePoolSubnetIds = useMemo(
    () => getMachinePoolSubnetIds(machinePoolsSubnets),
    [machinePoolsSubnets]
  );
  const hasMachinePoolSubnetSelected = machinePoolSubnetIds.length > 0;
  const { publicSubnet } = useMemo(
    () =>
      buildMachinePoolsReviewSelectOptions(
        selectedVPC,
        props.vpcList.data,
        hasMachinePoolSubnetSelected ? machinePoolSubnetIds : undefined
      ),
    [selectedVPC, props.vpcList.data, machinePoolSubnetIds, hasMachinePoolSubnetSelected]
  );

  const clusterPrivacy = useWatch({ name: FIELD_NAME.CLUSTER_PRIVACY_FIELD.NAME });
  useClearFieldWhenHidden<ROSAHCPCluster>(
    FIELD_NAME.CLUSTER_PRIVACY_FIELD.PUBLIC_SUBNET_ID,
    clusterPrivacy === ClusterNetwork.internal
  );

  const previousVpcRef = useRef<string | undefined>(selectedVPC?.id);
  useEffect(() => {
    const currentVpcId = selectedVPC?.id;
    if (previousVpcRef.current === null || previousVpcRef.current === undefined) {
      previousVpcRef.current = currentVpcId;
      return;
    }
    if (currentVpcId !== previousVpcRef.current) {
      setValue(FIELD_NAME.CLUSTER_PRIVACY_FIELD.PUBLIC_SUBNET_ID, undefined, {
        shouldValidate: true,
      });
    }
    previousVpcRef.current = currentVpcId;
  }, [selectedVPC?.id, setValue]);

  return (
    <Section label={n.sectionLabel} description={n.privacyHelper}>
      <FieldWrapper>
        <WizRadioGroup
          name={FIELD_NAME.CLUSTER_PRIVACY_FIELD.NAME}
          schema={clusterValidationSchema}
        >
          <Radio
            labelHelp={n.publicPopover}
            id={FIELD_NAME.CLUSTER_PRIVACY_FIELD.EXTERNAL}
            value={ClusterNetwork.external}
            label={n.publicLabel}
          >
            <WizSelect
              name={FIELD_NAME.CLUSTER_PRIVACY_FIELD.PUBLIC_SUBNET_ID}
              schema={clusterValidationSchema}
              options={publicSubnet}
              isDisabled={!hasMachinePoolSubnetSelected}
              helperText={hasMachinePoolSubnetSelected ? undefined : n.publicSubnetDisabledHelper}
            />
          </Radio>

          <Radio
            labelHelp={n.privatePopover}
            id={FIELD_NAME.CLUSTER_PRIVACY_FIELD.INTERNAL}
            value={ClusterNetwork.internal}
            label={n.privateLabel}
          />
        </WizRadioGroup>
      </FieldWrapper>

      <ExpandableSection isIndented toggleText={n.advancedToggle}>
        <NestedFields>
          {!isProxyStepHidden && (
            <FieldWrapper size="full">
              <WizCheckbox name={FIELD_NAME.CONFIGURE_PROXY} schema={clusterValidationSchema} />
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
            <WizCheckbox name={FIELD_NAME.CIDR_DEFAULT} schema={clusterValidationSchema} />
          </FieldWrapper>

          <FieldWrapper size="lg">
            <WizTextInput<ROSAHCPCluster>
              name={FIELD_NAME.NETWORK_MACHINE_CIDR}
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
              name={FIELD_NAME.NETWORK_SERVICE_CIDR}
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
              name={FIELD_NAME.NETWORK_POD_CIDR}
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
              name={FIELD_NAME.NETWORK_HOST_PREFIX}
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
