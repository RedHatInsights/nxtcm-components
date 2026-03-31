import {
  Radio,
  Section,
  useData,
  useItem,
  WizCheckbox,
  WizRadioGroup,
  WizSelect,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import { LabelHelp } from '@patternfly-labs/react-form-wizard/components/LabelHelp';
import { Resource, RosaWizardFormData, Subnet, VPC } from '../../../../types';
import { constructSelectedSubnets, subnetsFilter } from '../../../helpers';
import {
  Alert,
  AlertActionCloseButton,
  Content,
  ContentVariants,
  ExpandableSection,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import React from 'react';
import {
  disjointSubnets,
  awsSubnetMask,
  hostPrefix,
  cidr,
  validateRange,
  awsMachineCidr,
  subnetCidrs,
  serviceCidr,
  podCidr,
} from '../../../validators';
import { Indented } from '@patternfly-labs/react-form-wizard/components/Indented';
import links from '../../../externalLinks';
import ExternalLink from '../../../common/ExternalLink';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';

type NetworkingAndSubnetsSubStepProps = {
  vpcList: Resource<VPC[]>;
  setIsClusterWideProxySelected: (value: boolean) => void;
};

export const NetworkingAndSubnetsSubStep = (props: NetworkingAndSubnetsSubStepProps) => {
  const n = useRosaWizardStrings().networking;
  const v = useRosaWizardValidators();
  const { cluster } = useItem<RosaWizardFormData>();
  const { setIsClusterWideProxySelected } = props;
  const { update } = useData();
  const vpcRef = cluster?.selected_vpc;
  const selectedVPC =
    typeof vpcRef === 'string' ? props.vpcList.data?.find((vpc: VPC) => vpc.id === vpcRef) : vpcRef;

  const { publicSubnets } = subnetsFilter(selectedVPC);

  const defaultCidrValue = cluster?.cidr_default;
  const clusterWideProxy = cluster?.['configure_proxy'];
  React.useEffect(() => {
    setIsClusterWideProxySelected(!!clusterWideProxy);
    if (!clusterWideProxy) {
      const {
        http_proxy_url,
        https_proxy_url,
        no_proxy_domains,
        additional_trust_bundle,
        ...rest
      } = cluster ?? {};
      update({ cluster: rest });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterWideProxy]);

  const selectedSubnets = constructSelectedSubnets(cluster);

  const machineDisjointSubnets = disjointSubnets('network_machine_cidr', v.disjointSubnets);
  const serviceDisjointSubnets = disjointSubnets('network_service_cidr', v.disjointSubnets);
  const podDisjointSubnets = disjointSubnets('network_pod_cidr', v.disjointSubnets);
  const awsServiceSubnetMask = awsSubnetMask('network_service_cidr', v.serviceCidr);

  const hostPrefixValidators = (value: string) => hostPrefix(value, v.hostPrefix);
  const cidrValidators = (value: string) =>
    cidr(value, v.cidr) || validateRange(value, v.validateRange, v.cidr) || undefined;

  const machineCidrValidators = (value: string) =>
    cidrValidators(value) ||
    awsMachineCidr(value, cluster, v.awsMachineCidr) ||
    validateRange(value, v.validateRange, v.cidr) ||
    subnetCidrs(value, cluster, 'network_machine_cidr', selectedSubnets, v.subnetCidrs) ||
    machineDisjointSubnets(value, cluster) ||
    undefined;

  const serviceCidrValidators = (value: string) =>
    cidrValidators(value) ||
    serviceCidr(value, v.serviceCidr) ||
    serviceDisjointSubnets(value, cluster) ||
    awsServiceSubnetMask(value) ||
    subnetCidrs(value, cluster, 'network_service_cidr', selectedSubnets, v.subnetCidrs) ||
    undefined;

  const podCidrValidators = (value: string) =>
    cidrValidators(value) ||
    podCidr(value, cluster?.network_host_prefix, v.podCidr) ||
    podDisjointSubnets(value, cluster) ||
    subnetCidrs(value, cluster, 'network_pod_cidr', selectedSubnets, v.subnetCidrs) ||
    undefined;

  return (
    <>
      <Section label={n.sectionLabel} id="networking-section" key="networking-section-key">
        <WizRadioGroup
          id="public-private-subnet-radio-group"
          path="cluster.cluster_privacy"
          helperText={n.privacyHelper}
          onValueChange={() => {
            if (cluster.cluster_privacy && cluster.cluster_privacy_public_subnet_id) {
              delete cluster.cluster_privacy_public_subnet_id;
            }
          }}
        >
          <Radio
            id="public"
            label={n.publicLabel}
            value="external"
            popover={<LabelHelp id="subnet-label-help-public" labelHelp={n.publicPopover} />}
          >
            <WizSelect
              label={n.publicSubnetLabel}
              path="cluster.cluster_privacy_public_subnet_id"
              options={
                props.vpcList.isFetching
                  ? undefined
                  : publicSubnets?.map((subnet: Subnet) => ({
                      label: subnet.name,
                      value: subnet.subnet_id,
                    }))
              }
              placeholder={n.publicSubnetPlaceholder}
            />
          </Radio>

          <Radio
            id="private"
            label={n.privateLabel}
            value="internal"
            popover={<LabelHelp id="subnet-label-help-private" labelHelp={n.privatePopover} />}
          ></Radio>
        </WizRadioGroup>
      </Section>

      <ExpandableSection toggleText={n.advancedToggle}>
        <Indented>
          <Stack>
            <StackItem>
              <WizCheckbox
                id="cluster-wide-proxy"
                path="cluster.configure_proxy"
                label={n.proxyCheckboxLabel}
                helperText={n.proxyCheckboxHelp}
              />
            </StackItem>
            {clusterWideProxy ? (
              <Indented>
                <StackItem>
                  <Alert variant="info" isInline isPlain title={n.proxyNextStepInfo} />
                </StackItem>
              </Indented>
            ) : null}
          </Stack>

          <Grid>
            <GridItem span={7}>
              <Alert
                isExpandable
                actionClose={<AlertActionCloseButton onClose={() => {}} />}
                variant="warning"
                title={n.cidrAlertTitle}
                ouiaId="encryptionKeysAlert"
              >
                <Content component={ContentVariants.p}>{n.cidrAlertBody}</Content>

                <Content component={ContentVariants.p}>
                  <ExternalLink href={links.CIDR_RANGE_DEFINITIONS_ROSA}>
                    {n.cidrLearnMoreLink}
                  </ExternalLink>
                </Content>
              </Alert>
            </GridItem>
          </Grid>

          <WizCheckbox
            id="use-cidr-default-values"
            path="cluster.cidr_default"
            label={n.useDefaultsLabel}
            helperText={n.useDefaultsHelp}
          />

          <Grid hasGutter>
            <GridItem span={7}>
              <WizTextInput
                validation={machineCidrValidators}
                validateOnBlur
                id="network_machine_cidr"
                path="cluster.network_machine_cidr"
                label={n.machineCidrLabel}
                helperText={n.machineCidrHelp}
                disabled={defaultCidrValue}
              />
            </GridItem>
            <GridItem span={7}>
              <WizTextInput
                validation={serviceCidrValidators}
                validateOnBlur
                id="network_service_cidr"
                path="cluster.network_service_cidr"
                label={n.serviceCidrLabel}
                helperText={n.serviceCidrHelp}
                disabled={defaultCidrValue}
              />
            </GridItem>
            <GridItem span={7}>
              <WizTextInput
                validation={podCidrValidators}
                validateOnBlur
                id="network_pod_cidr"
                path="cluster.network_pod_cidr"
                label={n.podCidrLabel}
                helperText={n.podCidrHelp}
                disabled={defaultCidrValue}
              />
            </GridItem>
            <GridItem span={7}>
              <WizTextInput
                validation={hostPrefixValidators}
                validateOnBlur
                path="cluster.network_host_prefix"
                label={n.hostPrefixLabel}
                helperText={n.hostPrefixHelp}
                disabled={defaultCidrValue}
              />
            </GridItem>
          </Grid>
        </Indented>
      </ExpandableSection>
    </>
  );
};
