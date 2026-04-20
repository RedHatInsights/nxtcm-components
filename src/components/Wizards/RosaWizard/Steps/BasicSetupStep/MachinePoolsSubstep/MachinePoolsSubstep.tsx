import React from 'react';
import {
  Content,
  ContentVariants,
  ExpandableSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { subnetsFilter, canSelectImds, getWorkerNodeVolumeSizeMaxGiB } from '../../../helpers';
import {
  Indented,
  Radio,
  RosaMachinePoolSelect,
  RosaNumberInput,
  RosaRadioGroup,
  RosaSection,
  RosaSelect,
} from '../../../Inputs';
import { MachineTypesDropdownType, Resource, Subnet, VPC } from '../../../../types';
import { AutoscalingField } from './Autoscaling/AutoscalingField';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { SecurityGroupsSection } from './SecurityGroupSection/SecurityGroupSection';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';

type MachinePoolsSubstepProps = {
  vpcList: Resource<VPC[]>;
  machineTypes: Resource<MachineTypesDropdownType[], [region: string]> & {
    fetch?: (region: string) => Promise<void>;
  };
};

export const MachinePoolsSubstep = (props: MachinePoolsSubstepProps) => {
  const mp = useRosaWizardStrings().machinePools;
  const { setValue } = useFormContext();
  const cluster = useWatch({ name: 'cluster' });
  const currentRegion = cluster?.region;
  const clusterVersion = cluster.cluster_version ?? '';
  const maxRootDiskSize = getWorkerNodeVolumeSizeMaxGiB(clusterVersion);

  // Refetch machine types with the selected region
  React.useEffect(() => {
    if (props.machineTypes.fetch && currentRegion) void props.machineTypes.fetch(currentRegion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vpcRef = cluster?.selected_vpc;
  const selectedVPC =
    typeof vpcRef === 'string' ? props.vpcList.data.find((vpc: VPC) => vpc.id === vpcRef) : vpcRef;

  const { privateSubnets } = subnetsFilter(selectedVPC);

  return (
    <>
      <RosaSection label={mp.sectionLabel} id="machine-pools-section">
        <Content component={ContentVariants.p}>{mp.intro}</Content>
        <Grid>
          <GridItem span={5}>
            <FieldWithAPIErrorAlert
              error={props.vpcList.error}
              isFetching={props.vpcList.isFetching}
              fieldName={mp.vpcLabel}
              retry={props.vpcList.fetch ? () => void props.vpcList.fetch?.() : undefined}
            >
              <RosaSelect
                onValueChange={() => {
                  setValue('cluster.security_groups_worker', [], { shouldDirty: true });
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
                refreshCallback={props.vpcList.fetch}
                options={props.vpcList.data.map((vpc: VPC) => ({
                  label: vpc.name,
                  value: vpc.id,
                }))}
                disabled={props.vpcList.isFetching}
              />
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>

        <Grid hasGutter>
          <GridItem span={8}>
            <FieldWithAPIErrorAlert
              error={props.vpcList.error}
              isFetching={props.vpcList.isFetching}
              fieldName={mp.subnetLabel}
              retry={props.vpcList.fetch ? () => void props.vpcList.fetch?.() : undefined}
            >
              <RosaMachinePoolSelect
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
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>
      </RosaSection>
      <RosaSection label={mp.settingsSectionLabel} id="machine-pools-settings-section">
        <Content component={ContentVariants.p}>{mp.settingsIntro}</Content>
        <Grid>
          <GridItem span={5}>
            <FieldWithAPIErrorAlert
              error={props.machineTypes.error}
              isFetching={props.machineTypes.isFetching}
              fieldName={mp.instanceTypeLabel}
              retry={
                props.machineTypes.fetch && currentRegion
                  ? () => void props.machineTypes.fetch?.(currentRegion)
                  : undefined
              }
            >
              <RosaSelect
                label={mp.instanceTypeLabel}
                disabled={props.machineTypes.isFetching}
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
              />
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>

        <AutoscalingField
          autoscaling={cluster.autoscaling}
          machinePoolsNumber={cluster.machine_pools_subnets?.length}
          openshiftVersion={cluster.cluster_version}
        />
      </RosaSection>

      <ExpandableSection toggleText={mp.advancedToggle}>
        <Indented>
          <RosaRadioGroup
            disabled={!canSelectImds(clusterVersion)}
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
          </RosaRadioGroup>

          <RosaNumberInput
            path="cluster.compute_root_volume"
            label={mp.rootDiskLabel}
            labelHelp={mp.rootDiskHelp}
            min={75}
            max={maxRootDiskSize}
          />
        </Indented>
      </ExpandableSection>
      <SecurityGroupsSection
        clusterVersion={clusterVersion}
        selectedVPC={selectedVPC}
        vpcList={props.vpcList}
        refreshVPCs={props.vpcList.fetch ? () => void props.vpcList.fetch?.() : undefined}
      />
    </>
  );
};
