import { ClusterNetwork, Resource, Subnet, VPC } from '../../../../types';
import {
  Indented,
  LabelHelp,
  Radio,
  RosaCheckbox,
  RosaRadioGroup,
  RosaSection,
  RosaSelect,
  RosaTextInput,
} from '../../../Inputs';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';
import { constructSelectedSubnets, subnetsFilter } from '../../../helpers';
import {
  Alert,
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
import links from '../../../externalLinks';
import ExternalLink from '../../../common/ExternalLink';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';
import { useFormContext, useWatch } from 'react-hook-form';

type NetworkingAndSubnetsSubStepProps = {
  vpcList: Resource<VPC[]>;
  setIsClusterWideProxySelected: (value: boolean) => void;
};

export const NetworkingAndSubnetsSubStep = (props: NetworkingAndSubnetsSubStepProps) => {
  const { networking: n } = useRosaWizardStrings();
  const v = useRosaWizardValidators();
  const { setValue } = useFormContext();
  const cluster = useWatch({ name: 'cluster' });
  const { setIsClusterWideProxySelected } = props;
  const vpcRef = cluster?.selected_vpc;
  const selectedVPC =
    typeof vpcRef === 'string' ? props.vpcList.data?.find((vpc: VPC) => vpc.id === vpcRef) : vpcRef;

  const { publicSubnets } = subnetsFilter(selectedVPC);

  const defaultCidrValue = cluster?.cidr_default;
  const clusterWideProxy = cluster?.['configure_proxy'];
  React.useEffect(() => {
    setIsClusterWideProxySelected(!!clusterWideProxy);
    if (!clusterWideProxy) {
      setValue('cluster.http_proxy_url', undefined, { shouldDirty: true });
      setValue('cluster.https_proxy_url', undefined, { shouldDirty: true });
      setValue('cluster.no_proxy_domains', undefined, { shouldDirty: true });
      setValue('cluster.additional_trust_bundle', undefined, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterWideProxy, setValue]);

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
      <RosaSection label={n.sectionLabel} id="networking-section">
        <Grid>
          <GridItem span={7}>
            <RosaRadioGroup
              id="public-private-subnet-radio-group"
              path="cluster.cluster_privacy"
              helperText={n.privacyHelper}
              onValueChange={() => {
                setValue('cluster.cluster_privacy_public_subnet_id', undefined, { shouldDirty: true });
              }}
            >
              <Radio
                id="public"
                label={n.publicLabel}
                value={ClusterNetwork.external}
                popover={<LabelHelp id="subnet-label-help-public" labelHelp={n.publicPopover} />}
              >
                <FieldWithAPIErrorAlert
                  error={props.vpcList.error}
                  isFetching={props.vpcList.isFetching}
                  fieldName={n.publicSubnetLabel}
                  retry={props.vpcList.fetch ? () => void props.vpcList.fetch?.() : undefined}
                >
                  <RosaSelect
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
                </FieldWithAPIErrorAlert>
              </Radio>

              <Radio
                id="private"
                label={n.privateLabel}
                value={ClusterNetwork.internal}
                popover={<LabelHelp id="subnet-label-help-private" labelHelp={n.privatePopover} />}
              ></Radio>
            </RosaRadioGroup>
          </GridItem>
        </Grid>
      </RosaSection>

      <ExpandableSection toggleText={n.advancedToggle}>
        <Indented>
          <Stack>
            <StackItem>
              <RosaCheckbox
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

          <RosaCheckbox
            id="use-cidr-default-values"
            path="cluster.cidr_default"
            label={n.useDefaultsLabel}
            helperText={n.useDefaultsHelp}
          />

          <Stack hasGutter>
            <StackItem>
              <RosaTextInput
                validation={machineCidrValidators}
                validateOnBlur
                id="network_machine_cidr"
                path="cluster.network_machine_cidr"
                label={n.machineCidrLabel}
                helperText={n.machineCidrHelp}
                disabled={defaultCidrValue}
              />
            </StackItem>
            <StackItem>
              <RosaTextInput
                validation={serviceCidrValidators}
                validateOnBlur
                id="network_service_cidr"
                path="cluster.network_service_cidr"
                label={n.serviceCidrLabel}
                helperText={n.serviceCidrHelp}
                disabled={defaultCidrValue}
              />
            </StackItem>
            <StackItem>
              <RosaTextInput
                validation={podCidrValidators}
                validateOnBlur
                id="network_pod_cidr"
                path="cluster.network_pod_cidr"
                label={n.podCidrLabel}
                helperText={n.podCidrHelp}
                disabled={defaultCidrValue}
              />
            </StackItem>
            <StackItem>
              <RosaTextInput
                validation={hostPrefixValidators}
                validateOnBlur
                path="cluster.network_host_prefix"
                label={n.hostPrefixLabel}
                helperText={n.hostPrefixHelp}
                disabled={defaultCidrValue}
              />
            </StackItem>
          </Stack>
        </Indented>
      </ExpandableSection>
    </>
  );
};
