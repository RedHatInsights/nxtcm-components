import React from 'react';
import {
  Radio,
  Section,
  useItem,
  WizMachinePoolSelect,
  WizNumberInput,
  WizRadioGroup,
  WizSelect,
} from '@patternfly-labs/react-form-wizard';
import {
  Content,
  ContentVariants,
  ExpandableSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { subnetsFilter } from '../../../helpers';
import {
  MachineTypesDropdownType,
  Resource,
  RosaWizardFormData,
  Subnet,
  VPC,
} from '../../../../types';
import { AutoscalingField } from './Autoscaling/AutoscalingField';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { Indented } from '@patternfly-labs/react-form-wizard/components/Indented';
import { validateRootDiskSize } from '../../../validators';
import { SecurityGroupsSection } from './SecurityGroupSection/SecurityGroupSection';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';

type MachinePoolsSubstepProps = {
  vpcList: Resource<VPC[]>;
  machineTypes: Resource<MachineTypesDropdownType[]>;
};

export const MachinePoolsSubstep = (props: MachinePoolsSubstepProps) => {
  const mp = useRosaWizardStrings().machinePools;
  const v = useRosaWizardValidators();
  const { cluster } = useItem<RosaWizardFormData>();

  const vpcRef = cluster?.selected_vpc;
  const selectedVPC =
    typeof vpcRef === 'string' ? props.vpcList.data.find((vpc: VPC) => vpc.id === vpcRef) : vpcRef;

  const { privateSubnets } = subnetsFilter(selectedVPC);

  React.useEffect(() => {
    if (cluster?.cluster_privacy === 'internal') {
      cluster.cluster_privacy_public_subnet_id = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Section label={mp.sectionLabel} id="machine-pools-section" key="machine-pools-key">
        <Content component={ContentVariants.p}>{mp.intro}</Content>

        <Grid>
          <GridItem span={5}>
            <WizSelect
              onValueChange={(_newVpc, item) => {
                if (item?.cluster) {
                  item.cluster.security_groups_worker = [];
                }
              }}
              label={`${mp.vpcLabelPrefix} ${cluster?.region}`}
              path="cluster.selected_vpc"
              keyPath="id"
              placeholder={mp.vpcPlaceholder}
              required
              labelHelp={
                <>
                  {mp.vpcHelpLead}{' '}
                  <ExternalLink href={links.ROSA_SHARED_VPC}>{mp.vpcLearnMoreLink}</ExternalLink>
                </>
              }
              options={props.vpcList.data.map((vpc: VPC) => ({
                label: vpc.name,
                value: vpc.id,
              }))}
              disabled={props.vpcList.isFetching}
            />
          </GridItem>
        </Grid>

        <WizMachinePoolSelect
          required
          path="cluster.machine_pools_subnets"
          machinePoolLabel={mp.machinePoolLabel}
          subnetLabel={mp.subnetLabel}
          addMachinePoolBtnLabel={mp.addPoolButton}
          selectPlaceholder={mp.subnetPlaceholder}
          subnetOptions={privateSubnets?.map((subnet: Subnet) => ({
            label: subnet.name,
            value: subnet.subnet_id,
          }))}
          newValue={{ machine_pool_subnet: '' }}
          minItems={1}
        />
      </Section>
      <Section
        label={mp.settingsSectionLabel}
        id="machine-pools-settings-section"
        key="machine-pools-settings-key"
      >
        <Content component={ContentVariants.p}>{mp.settingsIntro}</Content>
        <Grid>
          <GridItem span={5}>
            <WizSelect
              label={mp.instanceTypeLabel}
              path="cluster.machine_type"
              required
              labelHelp={
                <>
                  {mp.instanceTypeHelpLead}{' '}
                  <ExternalLink href={links.ROSA_INSTANCE_TYPES}>
                    {mp.instanceTypeLearnMore}
                  </ExternalLink>
                </>
              }
              options={props.machineTypes.data}
              disabled={props.machineTypes.isFetching}
            />
          </GridItem>
        </Grid>

        <AutoscalingField
          autoscaling={cluster?.autoscaling}
          machinePoolsNumber={cluster?.machine_pools_subnets?.length}
          openshiftVersion={cluster?.cluster_version}
        />
      </Section>

      <ExpandableSection toggleText={mp.advancedToggle}>
        <Indented>
          <WizRadioGroup
            labelHelpTitle={mp.imdsHelpTitle}
            labelHelp={
              <>
                <Content component={ContentVariants.p}>{mp.imdsHelpP1}</Content>
                <Content component={ContentVariants.p}>
                  {/* TODO: External link component is in another PR */}
                  {/* <ExternalLink href={links.AWS_IMDS}>Learn more about IMDS</ExternalLink> */}
                </Content>
              </>
            }
            label={mp.imdsLabel}
            path="cluster.imds"
          >
            <Radio
              id="cluster-metadata-service-imdsv1-imdsv2-btn"
              label={mp.imdsBothLabel}
              value="imdsv1andimdsv2"
              description={mp.imdsBothDescription}
            />
            <Radio
              id="cluster-metadata-service-imdsv2-only-btn"
              label={mp.imdsV2Label}
              value="imdsv2only"
              description={mp.imdsV2Description}
            />
          </WizRadioGroup>

          <WizNumberInput
            path="cluster.compute_root_volume"
            label={mp.rootDiskLabel}
            labelHelp={mp.rootDiskHelp}
            min={75}
            max={16384}
            validation={(value) => validateRootDiskSize(value, v.rootDisk)}
          />
        </Indented>
      </ExpandableSection>
      <SecurityGroupsSection
        selectedVPC={selectedVPC}
        refreshVPCs={props.vpcList.fetch ? () => void props.vpcList.fetch?.() : undefined}
      />
    </>
  );
};
