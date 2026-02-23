import React from 'react';
import { Section, WizMachinePoolSelect, WizSelect } from '@patternfly-labs/react-form-wizard';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';
import {
  Content,
  ContentVariants,
  ExpandableSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { useTranslation } from '../../../../../../context/TranslationContext';
import { subnetsFilter } from '../../../helpers';
import { Subnet, VPC } from '../../../../types';
import { AutoscalingField } from './Autoscaling/AutoscalingField';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { Indented } from '@patternfly-labs/react-form-wizard/components/Indented';

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

 <Grid>
          <GridItem span={5}>
        <WizSelect
          label={`${t('Select a VPC to install your machine pools into your selected regions:')} ${cluster?.region}`}
          path="cluster.selected_vpc"
          keyPath="id"
          placeholder={t('Select a VPC to install your machine pools into')}
          required
          labelHelp={
            <>
              {t(
                'To create a cluster hosted by Red Hat, you must have a Virtual Private Cloud (VPC) available to create clusters on.'
              )}{' '}
              <ExternalLink href={links.ROSA_SHARED_VPC}>Learn more about VPCs.</ExternalLink>
            </>
          }
          options={props.vpcList.map((vpc: any) => {
            return {
              label: vpc.name,
              value: vpc.id,
            };
          })}
        />
        </GridItem>
        </Grid>

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
<Grid>
          <GridItem span={5}>
        <WizSelect
          label={t('Compute node instance type')}
          path="cluster.machine_type"
          required
          labelHelp={
            <>
              {t(
                'Instance types are made from varying combinations of CPU, memory, storage, and networking capacity. Instance type availability depends on regional availability and your AWS account configuration.'
              )}{' '}
              <ExternalLink href={links.ROSA_INSTANCE_TYPES}>Learn more.</ExternalLink>
            </>
          }
          options={props.machineTypes}
        />
        </GridItem>
        </Grid>

        <AutoscalingField autoscaling={cluster?.autoscaling} />
      </Section>

      <ExpandableSection toggleText="Advanced machine pool configuration (optional)">
        <Indented>
          {/*
              TODO: implementation of ROOT DISK SIZE and IMDS fields
              */}
        </Indented>
      </ExpandableSection>
    </>
  );
};
