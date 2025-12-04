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

export const ReviewStepData = (props: any) => {
  const { cluster } = useItem();

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
      (cluster?.encryption_keys && cluster?.encryption_keys !== 'default') ||
      cluster?.etcd_encryption ||
      cluster?.etcd_key_arn ||
      cluster?.kms_key_arn
    ) {
      setIsEncryptionExpanded(true);
    }
    if (cluster?.cidr_default && cluster?.cidr_default === false) {
      setIsOptionalNetworkingExpanded(true);
    }
    if (cluster?.upgrade_policy === 'manual') {
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
    <Section label="Review your ROSA cluster">
      <Alert
        variant="info"
        title={
          <>
            Double check your settings. <strong>Locked settings can not be changed later.</strong>
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
            toggleText="Details"
          >
            {/* START DETAILS DISPLAY */}

            <Stack hasGutter>
              <ReviewAndCreateStepItem label="Cluster name" value={cluster?.name} />
              <ReviewAndCreateStepItem label="OpenShift version" value={cluster?.cluster_version} />
              <ReviewAndCreateStepItem
                label="Associated AWS infrastructure account"
                value={cluster?.associated_aws_id}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label="AWS billing account"
                value={cluster?.billing_account_id}
                hasIcon
              />

              <ReviewAndCreateStepItem label="Region" value={cluster?.region} hasIcon />
            </Stack>

            {/* END DETAILS DISPLAY */}
          </ExpandableSection>
        </SplitItem>
        <SplitItem>
          <Button
            onClick={() => props.goToStepId.goToStepById('basic-setup-step-details')}
            variant="link"
            isInline
          >
            Edit Step
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
            toggleText="Roles and policies"
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem
                label="Installer role"
                value={cluster?.installer_role_arn}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label="OIDC Config ID"
                value={cluster?.byo_oidc_config_id}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label="Operator rols prefix"
                value={cluster?.custom_operator_roles_prefix}
                hasIcon
              />
            </Stack>
          </ExpandableSection>
        </SplitItem>

        <SplitItem>
          <Button
            onClick={() => props.goToStepId.goToStepById('roles-and-policies-sub-step')}
            variant="link"
            isInline
          >
            Edit Step
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
            toggleText="Networking and subnets"
          >
            <Stack hasGutter>
              {cluster?.cluster_privacy === 'external' && (
                <ReviewAndCreateStepItem
                  label="Public subnet name"
                  value={cluster?.cluster_privacy_public_subnet_id}
                  hasIcon
                />
              )}

              <ReviewAndCreateStepItem
                label="Install to selected VPC"
                value={cluster?.selected_vpc}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label="Compute node instance type"
                value={cluster?.machine_type}
              />

              <ReviewAndCreateStepItem
                label="Compute node count"
                value={
                  cluster?.autoscaling
                    ? `Min: ${cluster?.min_replicas} Max: ${cluster?.max_replicas}`
                    : cluster?.nodes_compute
                }
              />

              <Stack hasGutter>
                <StackItem>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                    <FlexItem>Machine pools</FlexItem>
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
            onClick={() => props.goToStepId.goToStepById('networking-sub-step')}
            variant="link"
            isInline
          >
            Edit Step
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
            toggleText="Encryption (optional)"
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem
                label="Additional etcd encryption"
                value={cluster?.etcd_encryption}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label="Encryption keys"
                value={cluster?.encryption_keys}
                hasIcon
              />
            </Stack>
          </ExpandableSection>
        </SplitItem>
        <SplitItem>
          <Button
            onClick={() => props.goToStepId.goToStepById('additional-setup-encryption')}
            variant="link"
            isInline
          >
            Edit Step
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
            toggleText="Networking (optional)"
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem
                label="Machine CIDR"
                value={cluster?.network_machine_cidr}
                hasIcon
              />

              <ReviewAndCreateStepItem
                label="Service CIDR"
                value={cluster?.network_service_cidr}
                hasIcon
              />

              <ReviewAndCreateStepItem label="Pod CIDR" value={cluster?.network_pod_cidr} hasIcon />

              <ReviewAndCreateStepItem
                label="Host prefix"
                value={cluster?.network_host_prefix}
                hasIcon
              />
            </Stack>
          </ExpandableSection>
        </SplitItem>
        <SplitItem>
          <Button
            onClick={() => props.goToStepId.goToStepById('additional-setup-networking')}
            variant="link"
            isInline
          >
            Edit Step
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
            toggleText="Cluster updates (optional)"
          >
            <Stack hasGutter>
              <ReviewAndCreateStepItem
                label="Cluster update stratedy"
                value={
                  cluster?.upgrade_policy === 'manual' ? 'Individual updates' : 'Automatic updates'
                }
                hasIcon
              />
            </Stack>
            <span style={{ display: 'none' }}>
              <WizCheckbox path={''} />
            </span>
          </ExpandableSection>
        </SplitItem>
        <SplitItem>
          <Button
            onClick={() => props.goToStepId.goToStepById('additional-setup-cluster-updates')}
            variant="link"
            isInline
          >
            Edit Step
          </Button>
        </SplitItem>
      </Split>
    </Section>
  );
};
