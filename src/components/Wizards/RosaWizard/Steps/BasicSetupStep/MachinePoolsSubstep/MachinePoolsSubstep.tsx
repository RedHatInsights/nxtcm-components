import React from 'react';
import { Section, WizMachinePoolSelect, WizSelect } from '@patternfly-labs/react-form-wizard';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useTranslation } from '../../../../../../context/TranslationContext';
import { subnetsFilter } from '../../../helpers';
import { Subnet, VPC } from '../../../../types';
import { AutoscalingField } from './Autoscaling/AutoscalingField';

export const MachinePoolsSubstep = (props: any) => {
  const { t } = useTranslation();
  const { value } = useInput(props);
  const { cluster } = value;

  const selectedVPC = props.vpcList.find((vpc: VPC) => vpc.id === cluster?.selected_vpc);

  const { privateSubnets } = subnetsFilter(selectedVPC);

  // Resets cluster_privacy_public_subnet_id when user selects private
  React.useEffect(() => {
    if (cluster?.cluster_privacy === 'internal') {
      cluster.cluster_privacy_public_subnet_id = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Section label={t('Machine pools')} id="machine-pools-section" key="machine-pools-key">
        <Content component={ContentVariants.p}>
          {t(
            'Create machine pools and specify the private subnet for each machine pool. To allow high availability for your workloads, add machine pools on different availablity zones.'
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
              value: vpc.id,
            };
          })}
        />

        <WizMachinePoolSelect
          required
          path="cluster.machine_pools_subnets"
          machinePoolLabel={t('Machine pool')}
          subnetLabel={t('Private subnet name')}
          addMachinePoolBtnLabel={t('Add machine pool')}
          selectPlaceholder={t('Select private subnet')}
          subnetOptions={privateSubnets?.map((subnet: Subnet) => ({
            label: subnet.name,
            value: subnet.subnet_id,
          }))}
          newValue={{ machine_pool_subnet: '' }}
          minItems={1}
        />
      </Section>
      <Section
        label={t('Machine pools settings')}
        id="machine-pools-settings-section"
        key="machine-pools-settings-key"
      >
        <Content component={ContentVariants.p}>
          {t(
            'The following settings apply to all machine pools created during cluster install. Additional machine pools can be created after cluster creation.'
          )}
        </Content>
        <WizSelect
          label={t('Compute node instance type')}
          path="cluster.machine_type"
          required
          labelHelp={t(
            'Instance types are made from varying combinations of CPU, memory, storage, and networking capacity. Instance type availability depends on regional availability and your AWS account configuration. {HERE GOES THE LINK: Learn more }'
          )}
          options={props.machineTypes}
        />

        <AutoscalingField autoscaling={cluster?.autoscaling} />
      </Section>
    </>
  );
};
