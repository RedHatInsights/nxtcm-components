import {
  Radio,
  Section,
  WizArrayInput,
  WizCheckbox,
  WizNumberInput,
  WizRadioGroup,
  WizSelect,
  WizTextDetail,
} from '@patternfly-labs/react-form-wizard';
import { LabelHelp } from '@patternfly-labs/react-form-wizard/components/LabelHelp';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';
import { Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';
import { Subnet, VPC } from '../../../../types';
import React from 'react';
import { useTranslation } from '../../../../../../context/TranslationContext';

export const NetworkingAndSubnetsSubStep = (props: any) => {
  const { t } = useTranslation();
  const { value } = useInput(props);
  const { cluster } = value;

  const selectedVPC = props.vpcList.find((vpc: VPC) => vpc.id === cluster?.selected_vpc?.id);

  const privateSubnets = selectedVPC?.aws_subnets.filter((privateSubnet: Subnet) =>
    privateSubnet.name.includes('private')
  );
  const publicSubnets = selectedVPC?.aws_subnets.filter((publicSubnet: Subnet) =>
    publicSubnet.name.includes('public')
  );

  // Resets cluster_privacy_public_subnet_id when user selects private
  React.useEffect(() => {
    if (cluster?.cluster_privacy === 'internal') {
      cluster.cluster_privacy_public_subnet_id = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  return (
    <>
      <Section label={t('Networking')} id="networking-section" key="networking-section-key">
        <WizRadioGroup
          id="public-private-subnet-radio-group"
          path="cluster.cluster_privacy"
          label={t(
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

      <Section label={t('Machine pools')} id="machine-pools-section" key="machine-pools-key">
        <Content component={ContentVariants.p}>
          {t(
            'Create machine pools and specify the private subnet for each machine pool. To allow high availability for your workloads, add machine pools on different availablity zones.'
          )}
        </Content>
        <Content component={ContentVariants.p}>
          {t(
            'The following settings apply to all machine pools created during cluster install. Additional machine pools can be created after cluster creation.'
          )}
        </Content>

        <WizSelect
          label={`${t('Select a VPC to install your machine pools into your selected regions:')} ${cluster?.region}`}
          path="cluster.selected_vpc"
          keyPath="id"
          placeholder={t('Select a VPC to install your machine pools into')}
          required
          labelHelp={t(
            'To create a cluster hosted by Red Hat, you must have a Virtual Private Cloud (VPC) available to create clusters on. {HERE GOES THE LINK: Learn more about VPCs}'
          )}
          options={props.vpcList.map((vpc: any) => {
            return {
              label: vpc.name,
              value: vpc,
            };
          })}
          pathValueToInputValue={(vpc: any) => {
            return vpc?.name ?? '';
          }}
        />

        <WizSelect
          label={t('Compute node instance type')}
          path="cluster.machine_type"
          required
          labelHelp={t(
            'Instance types are made from varying combinations of CPU, memory, storage, and networking capacity. Instance type availability depends on regional availability and your AWS account configuration. {HERE GOES THE LINK: Learn more }'
          )}
          options={props.machineTypes}
        />
        <WizCheckbox
          title={t('Autoscaling')}
          helperText={t(
            'Autoscaling automatically adds and removes nodes from the machine pool based on resource requirements. {HERE GOES LINK: Learn more about autscaling with ROSA.}'
          )}
          path="cluster.autoscaling"
          label={t('Enable autoscaling')}
        />
        {cluster?.autoscaling ? (
          <Flex>
            <FlexItem>
              <WizNumberInput
                required
                path="cluster.min_replicas"
                label={t('Min compute node count')}
                labelHelp={t(
                  'The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}.'
                )}
              />
            </FlexItem>
            <FlexItem>
              <WizNumberInput
                required
                path="cluster.max_replicas"
                label={t('Max compute node count')}
                labelHelp={t(
                  'The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}.'
                )}
              />
            </FlexItem>
          </Flex>
        ) : (
          <WizNumberInput
            required
            path="cluster.nodes_compute"
            label={t('Compute node count')}
            labelHelp={t(
              'The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}.'
            )}
          />
        )}

        <WizArrayInput
          path="cluster.machine_pools_subnets"
          label={t('Machine pools')}
          placeholder={t('Add machine pool')}
          collapsedContent={
            <WizTextDetail path="name" placeholder={t('Expand to edit the machine pool details')} />
          }
        >
          <Flex>
            <FlexItem>
              <Content component={ContentVariants.p} style={{ fontWeight: '500' }}>
                {t('Machine Pool')}
              </Content>
              <Content component={ContentVariants.p}>{t('Machine pool')}: </Content>
            </FlexItem>
            <FlexItem>
              <WizSelect
                path="machine_pool_subnet"
                label={t('Private subnet name')}
                options={privateSubnets?.map((subnet: Subnet) => {
                  return {
                    label: subnet.name,
                    value: subnet.subnet_id,
                  };
                })}
              />
            </FlexItem>
          </Flex>
        </WizArrayInput>
      </Section>
    </>
  );
};
