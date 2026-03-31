import React from 'react';
import { Section, useItem, WizCheckbox } from '@patternfly-labs/react-form-wizard';
import {
  Alert,
  Button,
  ExpandableSection,
  Flex,
  FlexItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import { ReviewAndCreateStepItem } from './ReviewAndCreateStep/ReviewAndCreateStepItem';
import { MachinePoolsReviewAndCreateStepItem } from './ReviewAndCreateStep/MachinePoolsReviewAndCreateStepItem';
import {
  ClusterEncyptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  RosaWizardFormData,
  WizardNavigationContext,
} from '../../types';
import { useRosaWizardStrings } from '../RosaWizardStringsContext';

type ReviewStepDataProps = {
  goToStepId?: WizardNavigationContext;
};

export const ReviewStepData = (props: ReviewStepDataProps) => {
  const r = useRosaWizardStrings().review;
  const { cluster } = useItem<RosaWizardFormData>();

  const [isDetailsSectionExpanded, setIsDetailsSectionExpanded] = React.useState<boolean>(true);
  const [isRolesAndPoliciesExpanded, setIsRolesAndPoliciesExpanded] = React.useState<boolean>(true);
  const [isNetworkingAndSubnetsExpanded, setIsNetworkingAndSubnetsExpanded] =
    React.useState<boolean>(true);
  const [isEncryptionExpanded, setIsEncryptionExpanded] = React.useState<boolean>(false);
  const [isOptionalNetworkingExpanded, setIsOptionalNetworkingExpanded] =
    React.useState<boolean>(false);
  const [isOptionalClusterUpgradesExpanded, setIsOptionalClusterUpgradesExpanded] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (
      (cluster?.encryption_keys && cluster?.encryption_keys === ClusterEncyptionKeys.custom) ||
      cluster?.etcd_encryption ||
      cluster?.etcd_key_arn ||
      cluster?.kms_key_arn
    ) {
      setIsEncryptionExpanded(true);
    }
    if (!cluster?.cidr_default) {
      setIsOptionalNetworkingExpanded(true);
    }
    if (cluster?.upgrade_policy === ClusterUpgrade.manual) {
      setIsOptionalClusterUpgradesExpanded(true);
    }
  }, [
    cluster?.cidr_default,
    cluster?.encryption_keys,
    cluster?.etcd_encryption,
    cluster?.etcd_key_arn,
    cluster?.kms_key_arn,
    cluster?.upgrade_policy,
  ]);

  return (
    <Section label={r.sectionLabel}>
      <Alert
        variant="info"
        title={
          <>
            {r.alertTitle}
            <LockIcon />
          </>
        }
        ouiaId="reviewStepAlert"
      />

      <Split hasGutter>
        <SplitItem isFilled>
          <ExpandableSection
            isIndented
            isWidthLimited
            isExpanded={isDetailsSectionExpanded}
            onToggle={() => setIsDetailsSectionExpanded(!isDetailsSectionExpanded)}
            toggleText={r.detailsToggle}
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem label={r.clusterName} value={cluster?.name} />
              <ReviewAndCreateStepItem
                label={r.openShiftVersion}
                value={cluster?.cluster_version}
              />
              <ReviewAndCreateStepItem
                label={r.awsInfra}
                value={cluster?.associated_aws_id}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label={r.awsBilling}
                value={cluster?.billing_account_id}
                hasIcon
              />

              <ReviewAndCreateStepItem label={r.region} value={cluster?.region} hasIcon />
            </Stack>
          </ExpandableSection>
        </SplitItem>
        <SplitItem>
          <Button
            onClick={() => props.goToStepId?.goToStepById('basic-setup-step-details')}
            variant="link"
            isInline
          >
            {r.editStep}
          </Button>
        </SplitItem>
      </Split>

      <Split hasGutter>
        <SplitItem isFilled>
          <ExpandableSection
            isIndented
            isWidthLimited
            isExpanded={isRolesAndPoliciesExpanded}
            onToggle={() => setIsRolesAndPoliciesExpanded(!isRolesAndPoliciesExpanded)}
            toggleText={r.rolesToggle}
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem
                label={r.installerRole}
                value={cluster?.installer_role_arn}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label={r.oidcConfigId}
                value={cluster?.byo_oidc_config_id}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label={r.operatorPrefix}
                value={cluster?.custom_operator_roles_prefix}
                hasIcon
              />
            </Stack>
          </ExpandableSection>
        </SplitItem>

        <SplitItem>
          <Button
            onClick={() => props.goToStepId?.goToStepById('roles-and-policies-sub-step')}
            variant="link"
            isInline
          >
            {r.editStep}
          </Button>
        </SplitItem>
      </Split>

      <Split hasGutter>
        <SplitItem isFilled>
          <ExpandableSection
            isIndented
            isWidthLimited
            isExpanded={isNetworkingAndSubnetsExpanded}
            onToggle={() => setIsNetworkingAndSubnetsExpanded(!isNetworkingAndSubnetsExpanded)}
            toggleText={r.networkingToggle}
          >
            <Stack hasGutter>
              {cluster?.cluster_privacy === ClusterNetwork.external && (
                <ReviewAndCreateStepItem
                  label={r.publicSubnet}
                  value={cluster?.cluster_privacy_public_subnet_id}
                  hasIcon
                />
              )}

              <ReviewAndCreateStepItem
                label={r.installVpc}
                value={cluster?.selected_vpc?.name}
                hasIcon
              />

              <ReviewAndCreateStepItem label={r.instanceType} value={cluster?.machine_type} />

              <ReviewAndCreateStepItem
                label={r.computeCount}
                value={
                  cluster?.autoscaling
                    ? `${r.autoscalingMinPrefix} ${cluster?.min_replicas} ${r.autoscalingMaxPrefix} ${cluster?.max_replicas}`
                    : cluster?.nodes_compute
                }
              />

              <Stack hasGutter>
                <StackItem>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                    <FlexItem>{r.machinePoolsHeading}</FlexItem>
                    <FlexItem>
                      <LockIcon />
                    </FlexItem>
                  </Flex>
                </StackItem>
                <StackItem style={{ marginLeft: '30px' }}>
                  <MachinePoolsReviewAndCreateStepItem
                    machinePools={[
                      {
                        availability_zone: 'us-east-1a',
                        public_subnet: 'admin-rosa-2-subnet-private2-us-east-1a',
                      },
                      {
                        availability_zone: 'us-east-1b',
                        public_subnet: 'admin-rosa-2-subnet-private2-us-east-1b',
                      },
                    ]}
                  />
                </StackItem>
              </Stack>
            </Stack>
          </ExpandableSection>
        </SplitItem>

        <SplitItem>
          <Button
            onClick={() => props.goToStepId?.goToStepById('networking-sub-step')}
            variant="link"
            isInline
          >
            {r.editStep}
          </Button>
        </SplitItem>
      </Split>

      <Split>
        <SplitItem isFilled>
          <ExpandableSection
            isWidthLimited
            isIndented
            isExpanded={isEncryptionExpanded}
            onToggle={() => setIsEncryptionExpanded(!isEncryptionExpanded)}
            toggleText={r.encryptionToggle}
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem
                label={r.additionalEtcd}
                value={cluster?.etcd_encryption}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label={r.encryptionKeys}
                value={cluster?.encryption_keys}
                hasIcon
              />
            </Stack>
          </ExpandableSection>
        </SplitItem>
        <SplitItem>
          <Button
            onClick={() => props.goToStepId?.goToStepById('additional-setup-encryption')}
            variant="link"
            isInline
          >
            {r.editStep}
          </Button>
        </SplitItem>
      </Split>

      <Split>
        <SplitItem isFilled>
          <ExpandableSection
            isWidthLimited
            isIndented
            isExpanded={isOptionalNetworkingExpanded}
            onToggle={() => setIsOptionalNetworkingExpanded(!isOptionalNetworkingExpanded)}
            toggleText={r.optionalNetworkingToggle}
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem
                label={r.machineCidr}
                value={cluster?.network_machine_cidr}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label={r.serviceCidr}
                value={cluster?.network_service_cidr}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label={r.podCidr}
                value={cluster?.network_pod_cidr}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label={r.hostPrefix}
                value={cluster?.network_host_prefix}
                hasIcon
              />
            </Stack>
          </ExpandableSection>
        </SplitItem>
        <SplitItem>
          <Button
            onClick={() => props.goToStepId?.goToStepById('additional-setup-networking')}
            variant="link"
            isInline
          >
            {r.editStep}
          </Button>
        </SplitItem>
      </Split>

      <Split>
        <SplitItem isFilled>
          <ExpandableSection
            isWidthLimited
            isIndented
            isExpanded={isOptionalClusterUpgradesExpanded}
            onToggle={() =>
              setIsOptionalClusterUpgradesExpanded(!isOptionalClusterUpgradesExpanded)
            }
            toggleText={r.clusterUpdatesToggle}
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem
                label={r.updateStrategy}
                value={
                  cluster?.upgrade_policy === ClusterUpgrade.manual
                    ? r.strategyIndividual
                    : r.strategyAutomatic
                }
                hasIcon
              />
            </Stack>
            <span style={{ display: 'none' }}>
              <WizCheckbox path={''} id="non-displayed-checkbox" />
            </span>
          </ExpandableSection>
        </SplitItem>
        <SplitItem>
          <Button
            onClick={() => props.goToStepId?.goToStepById('additional-setup-cluster-updates')}
            variant="link"
            isInline
          >
            {r.editStep}
          </Button>
        </SplitItem>
      </Split>
    </Section>
  );
};
