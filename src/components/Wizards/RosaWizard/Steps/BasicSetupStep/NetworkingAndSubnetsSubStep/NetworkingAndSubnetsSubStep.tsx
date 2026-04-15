import { ClusterNetwork, Resource, Subnet, VPC } from '../../../../types';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';
import { constructSelectedSubnets, subnetsFilter } from '../../../helpers';
import {
  Alert,
  Content,
  ContentVariants,
  ExpandableSection,
  FormSection,
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
import { useClusterValues, useRosaForm } from '../../../RosaFormContext';
import {
  FormCheckbox,
  FormRadioGroup,
  FormSelect,
  FormTextInput,
  type SelectOptionItem,
} from '../../../../../../TanstackForm';

/** Props for networking fields and a callback used to reflect cluster-wide proxy selection in parent UI. */
type NetworkingAndSubnetsSubStepProps = {
  vpcList: Resource<VPC[]>;
  setIsClusterWideProxySelected: (value: boolean) => void;
};

/**
 * Cluster privacy, public subnet for external clusters, proxy toggle, and advanced CIDR/host-prefix inputs.
 */
export const NetworkingAndSubnetsSubStep = (
  props: NetworkingAndSubnetsSubStepProps
): JSX.Element => {
  const { networking: n } = useRosaWizardStrings();
  const v = useRosaWizardValidators();
  const form = useRosaForm();
  const cluster = useClusterValues();
  const { setIsClusterWideProxySelected } = props;

  const vpcRef = cluster.selected_vpc;
  const selectedVPC =
    typeof vpcRef === 'string' ? props.vpcList.data?.find((vpc: VPC) => vpc.id === vpcRef) : vpcRef;

  const { publicSubnets } = subnetsFilter(selectedVPC);

  const defaultCidrValue = cluster.cidr_default;
  const clusterWideProxy = cluster.configure_proxy;

  React.useEffect(() => {
    setIsClusterWideProxySelected(!!clusterWideProxy);
    if (!clusterWideProxy) {
      form.setFieldValue('cluster.http_proxy_url', undefined);
      form.setFieldValue('cluster.https_proxy_url', undefined);
      form.setFieldValue('cluster.no_proxy_domains', undefined);
      form.setFieldValue('cluster.additional_trust_bundle', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterWideProxy]);

  const selectedSubnets = constructSelectedSubnets(cluster);

  const machineDisjointSubnets = disjointSubnets('network_machine_cidr', v.disjointSubnets);
  const serviceDisjointSubnets = disjointSubnets('network_service_cidr', v.disjointSubnets);
  const podDisjointSubnets = disjointSubnets('network_pod_cidr', v.disjointSubnets);
  const awsServiceSubnetMask = awsSubnetMask('network_service_cidr', v.serviceCidr);

  /** Validates the pod network host prefix field. */
  const hostPrefixValidators = (value: string): string | undefined =>
    hostPrefix(value, v.hostPrefix);
  /** Validates a generic CIDR string and numeric range rules from wizard copy. */
  const cidrValidators = (value: string): string | undefined =>
    cidr(value, v.cidr) || validateRange(value, v.validateRange, v.cidr) || undefined;

  /** Validates machine CIDR against AWS rules, subnets, and disjointness with other cluster networks. */
  const machineCidrValidators = (value: string): string | undefined =>
    cidrValidators(value) ||
    awsMachineCidr(value, cluster, v.awsMachineCidr) ||
    validateRange(value, v.validateRange, v.cidr) ||
    subnetCidrs(value, cluster, 'network_machine_cidr', selectedSubnets, v.subnetCidrs) ||
    machineDisjointSubnets(value, cluster) ||
    undefined;

  /** Validates Kubernetes service CIDR, disjointness, AWS mask rules, and subnet overlap. */
  const serviceCidrValidators = (value: string): string | undefined =>
    cidrValidators(value) ||
    serviceCidr(value, v.serviceCidr) ||
    serviceDisjointSubnets(value, cluster) ||
    awsServiceSubnetMask(value) ||
    subnetCidrs(value, cluster, 'network_service_cidr', selectedSubnets, v.subnetCidrs) ||
    undefined;

  /** Validates pod CIDR against host prefix, disjointness, and subnet overlap. */
  const podCidrValidators = (value: string): string | undefined =>
    cidrValidators(value) ||
    podCidr(value, cluster.network_host_prefix, v.podCidr) ||
    podDisjointSubnets(value, cluster) ||
    subnetCidrs(value, cluster, 'network_pod_cidr', selectedSubnets, v.subnetCidrs) ||
    undefined;

  const publicSubnetOptions: SelectOptionItem[] = React.useMemo(
    () =>
      (publicSubnets ?? []).map((subnet: Subnet) => ({
        value: subnet.subnet_id,
        label: subnet.name,
      })),
    [publicSubnets]
  );

  return (
    <>
      <FormSection title={n.sectionLabel} id="networking-section">
        <Grid>
          <GridItem span={7}>
            <form.Field
              name="cluster.cluster_privacy"
              listeners={{
                onChange: () => {
                  form.setFieldValue('cluster.cluster_privacy_public_subnet_id', undefined);
                },
              }}
            >
              {(field) => (
                <FormRadioGroup
                  field={field}
                  label=""
                  helperText={n.privacyHelper}
                  options={[
                    {
                      value: ClusterNetwork.external,
                      label: n.publicLabel,
                      popover: n.publicPopover,
                    },
                    {
                      value: ClusterNetwork.internal,
                      label: n.privateLabel,
                      popover: n.privatePopover,
                    },
                  ]}
                />
              )}
            </form.Field>

            {cluster.cluster_privacy === ClusterNetwork.external && (
              <FieldWithAPIErrorAlert
                error={props.vpcList.error}
                isFetching={props.vpcList.isFetching}
                fieldName={n.publicSubnetLabel}
                retry={props.vpcList.fetch ? () => void props.vpcList.fetch?.() : undefined}
              >
                <form.Field name="cluster.cluster_privacy_public_subnet_id">
                  {(field) => (
                    <FormSelect
                      field={field}
                      label={n.publicSubnetLabel}
                      placeholder={n.publicSubnetPlaceholder}
                      options={props.vpcList.isFetching ? [] : publicSubnetOptions}
                      isPending={props.vpcList.isFetching}
                    />
                  )}
                </form.Field>
              </FieldWithAPIErrorAlert>
            )}
          </GridItem>
        </Grid>
      </FormSection>

      <ExpandableSection toggleText={n.advancedToggle}>
        <div className="pf-v6-u-ml-lg">
          <Stack>
            <StackItem>
              <form.Field name="cluster.configure_proxy">
                {(field) => (
                  <FormCheckbox
                    field={field}
                    label={n.proxyCheckboxLabel}
                    description={n.proxyCheckboxHelp}
                  />
                )}
              </form.Field>
            </StackItem>
            {clusterWideProxy && (
              <div className="pf-v6-u-ml-lg">
                <StackItem>
                  <Alert variant="info" isInline isPlain title={n.proxyNextStepInfo} />
                </StackItem>
              </div>
            )}
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

          <form.Field name="cluster.cidr_default">
            {(field) => (
              <FormCheckbox
                field={field}
                label={n.useDefaultsLabel}
                description={n.useDefaultsHelp}
              />
            )}
          </form.Field>

          <Stack hasGutter>
            <StackItem>
              <form.Field
                name="cluster.network_machine_cidr"
                validators={{
                  onBlur: ({ value }) => machineCidrValidators(value as string) || undefined,
                }}
              >
                {(field) => (
                  <FormTextInput
                    field={field}
                    label={n.machineCidrLabel}
                    helperText={n.machineCidrHelp}
                    isDisabled={defaultCidrValue}
                  />
                )}
              </form.Field>
            </StackItem>
            <StackItem>
              <form.Field
                name="cluster.network_service_cidr"
                validators={{
                  onBlur: ({ value }) => serviceCidrValidators(value as string) || undefined,
                }}
              >
                {(field) => (
                  <FormTextInput
                    field={field}
                    label={n.serviceCidrLabel}
                    helperText={n.serviceCidrHelp}
                    isDisabled={defaultCidrValue}
                  />
                )}
              </form.Field>
            </StackItem>
            <StackItem>
              <form.Field
                name="cluster.network_pod_cidr"
                validators={{
                  onBlur: ({ value }) => podCidrValidators(value as string) || undefined,
                }}
              >
                {(field) => (
                  <FormTextInput
                    field={field}
                    label={n.podCidrLabel}
                    helperText={n.podCidrHelp}
                    isDisabled={defaultCidrValue}
                  />
                )}
              </form.Field>
            </StackItem>
            <StackItem>
              <form.Field
                name="cluster.network_host_prefix"
                validators={{
                  onBlur: ({ value }) => hostPrefixValidators(value as string) || undefined,
                }}
              >
                {(field) => (
                  <FormTextInput
                    field={field}
                    label={n.hostPrefixLabel}
                    helperText={n.hostPrefixHelp}
                    isDisabled={defaultCidrValue}
                  />
                )}
              </form.Field>
            </StackItem>
          </Stack>
        </div>
      </ExpandableSection>
    </>
  );
};
