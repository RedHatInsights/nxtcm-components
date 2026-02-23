import {
  Radio,
  Section,
  WizCheckbox,
  WizRadioGroup,
  WizSelect,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import { LabelHelp } from '@patternfly-labs/react-form-wizard/components/LabelHelp';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';
import { Subnet, VPC } from '../../../../types';
import { useTranslation } from '../../../../../../context/TranslationContext';
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

export const NetworkingAndSubnetsSubStep = (props: any) => {
  const { t } = useTranslation();
  const { value } = useInput(props);
  const { cluster } = value;
  const { setIsClusterWideProxySelected } = props;
  const selectedVPC = props.vpcList.find((vpc: VPC) => vpc.id === cluster?.selected_vpc);

  const { publicSubnets } = subnetsFilter(selectedVPC);

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
      <Section label={t('Networking')} id="networking-section" key="networking-section-key">
        <WizRadioGroup
          id="public-private-subnet-radio-group"
          path="cluster.cluster_privacy"
          helperText={t(
            'Install your cluster with all public or private API endpoints and application routes.'
          )}
        >
          <Radio
            id="public"
            label={t('Public')}
            value="external"
            popover={
              <LabelHelp
                id="subnet-label-help"
                labelHelp={t(
                  'Access Kubernetes API endpoint and application routes from the internet.'
                )}
              />
            }
          >
            <WizSelect
              label={t('Public subnet name')}
              path="cluster.cluster_privacy_public_subnet_id"
              options={publicSubnets?.map((subnet: Subnet) => {
                return {
                  label: subnet.name,
                  value: subnet.subnet_id,
                };
              })}
              placeholder={t('Select public subnet name')}
            />
          </Radio>

          <Radio
            id="private"
            label={t('Private')}
            value="internal"
            popover={
              <LabelHelp
                id="subnet-label-help"
                labelHelp={t(
                  'Access Kubernetes API endpoint and application routes from direct private connections only.'
                )}
              />
            }
          ></Radio>
        </WizRadioGroup>
      </Section>

      <ExpandableSection toggleText="Advanced networking configuration (optional)">
        <Indented>
          <Stack>
            <StackItem>
              <WizCheckbox
                id="cluster-wide-proxy"
                path="cluster.configure_proxy"
                label={t('Configure a cluter-wide proxy')}
                helperText={t(
                  'Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster.'
                )}
              />
            </StackItem>
            {clusterWideProxy ? (
              <Indented>
                <StackItem>
                  <Alert
                    variant="info"
                    isInline
                    isPlain
                    title="You will be able to configure cluster-wide proxy details in the next step"
                  />
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
                title={t('CIDR ranges cannot be changed after you create your cluster')}
                ouiaId="encryptionKeysAlert"
              >
                <Content component={ContentVariants.p}>
                  {t(`Specify non-overelapping ranges for machine, service, and pod ranges. Make sure that
                        your internal organization&apos;s networking ranges do not overlap with ours, which are
                        Kubernetes. Each range should correspond to the first IP address in their subnet.`)}
                </Content>

                <Content component={ContentVariants.p}>
                  {t(`HERE GOES LINK: Learn more about configureing network settings (needs external link
                        icon)`)}
                </Content>
              </Alert>
            </GridItem>
          </Grid>

          <WizCheckbox
            id="use-cidr-default-values"
            path="cluster.cidr_default"
            label={t('Use default values')}
            helperText={t(
              'The values are safe defaults. However, you must ensure that the Machine CIDR matches the selected VPC subnets.'
            )}
          />

          <Grid hasGutter>
            <GridItem span={7}>
              <WizTextInput
                validation={machineCidrValidators}
                validateOnBlur
                id="network_machine_cidr"
                path="cluster.network_machine_cidr"
                label={t('Machine CIDR')}
                helperText={t('Subnet mask must be between /16 and /25')}
                disabled={defaultCidrValue}
              />
            </GridItem>
            <GridItem span={7}>
              <WizTextInput
                validation={serviceCidrValidators}
                validateOnBlur
                id="network_service_cidr"
                path="cluster.network_service_cidr"
                label={t('Service CIDR')}
                helperText={t('Subnet mask must be at most /24')}
                disabled={defaultCidrValue}
              />
            </GridItem>
            <GridItem span={7}>
              <WizTextInput
                validation={podCidrValidators}
                validateOnBlur
                id="network_pod_cidr"
                path="cluster.network_pod_cidr"
                label={t('Pod CIDR')}
                helperText={t('Subnet mask must allow for at least 32 nodes')}
                disabled={defaultCidrValue}
              />
            </GridItem>
            <GridItem span={7}>
              <WizTextInput
                validation={hostPrexiValidators}
                validateOnBlur
                path="cluster.network_host_prefix"
                label={t('Host prefix')}
                helperText={t('Must be between /23 and /26')}
                disabled={defaultCidrValue}
              />
            </GridItem>
          </Grid>
        </Indented>
      </ExpandableSection>
    </>
  );
};
