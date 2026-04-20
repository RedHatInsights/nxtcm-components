import React from 'react';
import {
  Content,
  ContentVariants,
  ExpandableSection,
  FormSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { subnetsFilter, canSelectImds, getWorkerNodeVolumeSizeMaxGiB } from '../../../helpers';
import { MachineTypesDropdownType, Resource, Subnet, VPC } from '../../../../types';
import { AutoscalingField } from './Autoscaling/AutoscalingField';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { SecurityGroupsSection } from './SecurityGroupSection/SecurityGroupSection';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../common/FieldWithAPIErrorAlert';
import { useClusterValues, useRosaForm } from '../../../RosaFormContext';
import {
  FormNumberInput,
  FormRadioGroup,
  FormSelect,
  FormMachinePoolSelect,
  type SelectOptionItem,
  type MachinePoolSelectOption,
} from '../../../../../../TanstackForm';

/** Props for configuring default machine pools: VPC list and instance types for the current region. */
type MachinePoolsSubstepProps = {
  vpcList: Resource<VPC[]>;
  machineTypes: Resource<MachineTypesDropdownType[], [region: string]> & {
    fetch?: (region: string) => Promise<void>;
  };
};

/**
 * Machine pool defaults: VPC, subnets per pool, instance type, autoscaling, IMDS, disk, and worker security groups.
 */
export const MachinePoolsSubstep = (props: MachinePoolsSubstepProps): JSX.Element => {
  const strings = useRosaWizardStrings();
  const mp = strings.machinePools;
  const form = useRosaForm();
  const cluster = useClusterValues();
  const currentRegion = cluster.region;
  const clusterVersion = cluster.cluster_version ?? '';
  const maxRootDiskSize = getWorkerNodeVolumeSizeMaxGiB(clusterVersion);

  React.useEffect(() => {
    if (props.machineTypes.fetch && currentRegion) void props.machineTypes.fetch(currentRegion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vpcRef = cluster.selected_vpc;
  const selectedVPC =
    typeof vpcRef === 'string' ? props.vpcList.data.find((vpc: VPC) => vpc.id === vpcRef) : vpcRef;

  const { privateSubnets } = subnetsFilter(selectedVPC);

  const vpcOptions: SelectOptionItem[] = React.useMemo(
    () =>
      props.vpcList.data.map((vpc: VPC) => ({
        value: vpc.id,
        label: vpc.name,
      })),
    [props.vpcList.data]
  );

  const machineTypeOptions: SelectOptionItem[] = React.useMemo(
    () =>
      props.machineTypes.data.map((mt) => ({
        value: mt.value,
        label: mt.label,
        description: mt.description,
      })),
    [props.machineTypes.data]
  );

  const machinePoolSubnetOptions: MachinePoolSelectOption[] = React.useMemo(
    () =>
      (privateSubnets ?? []).map((subnet: Subnet) => ({
        value: subnet.subnet_id,
        label: subnet.name,
      })),
    [privateSubnets]
  );

  return (
    <>
      <FormSection title={mp.sectionLabel} id="machine-pools-section">
        <Content component={ContentVariants.p}>{mp.intro}</Content>
        <Grid>
          <GridItem span={5}>
            <FieldWithAPIErrorAlert
              error={props.vpcList.error}
              isFetching={props.vpcList.isFetching}
              fieldName={mp.vpcLabel}
              retry={props.vpcList.fetch ? () => void props.vpcList.fetch?.() : undefined}
            >
              <form.Field
                name="cluster.selected_vpc"
                listeners={{
                  onChange: () => {
                    form.setFieldValue('cluster.security_groups_worker', []);
                  },
                }}
              >
                {(field) => (
                  <FormSelect
                    field={field}
                    label={`${mp.vpcLabelPrefix} ${cluster.region}`}
                    placeholder={mp.vpcPlaceholder}
                    labelHelp={
                      <>
                        {mp.vpcHelpLead}{' '}
                        <ExternalLink href={links.ROSA_SHARED_VPC}>
                          {mp.vpcLearnMoreLink}
                        </ExternalLink>
                      </>
                    }
                    isRequired
                    isDisabled={props.vpcList.isFetching}
                    isPending={props.vpcList.isFetching}
                    options={vpcOptions}
                    onRefresh={props.vpcList.fetch ? () => void props.vpcList.fetch?.() : undefined}
                  />
                )}
              </form.Field>
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
              <form.Field name="cluster.machine_pools_subnets">
                {(field) => (
                  <FormMachinePoolSelect
                    field={field}
                    machinePoolLabel={mp.machinePoolLabel}
                    subnetLabel={mp.subnetLabel}
                    addButtonLabel={mp.addPoolButton}
                    selectPlaceholder={mp.subnetPlaceholder}
                    subnetOptions={machinePoolSubnetOptions}
                    minItems={1}
                    isRequired
                  />
                )}
              </form.Field>
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>
      </FormSection>

      <FormSection title={mp.settingsSectionLabel} id="machine-pools-settings-section">
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
              <form.Field name="cluster.machine_type">
                {(field) => (
                  <FormSelect
                    field={field}
                    label={mp.instanceTypeLabel}
                    labelHelp={
                      <>
                        {mp.instanceTypeHelpLead}{' '}
                        <ExternalLink href={links.ROSA_INSTANCE_TYPES}>
                          {mp.instanceTypeLearnMore}
                        </ExternalLink>
                      </>
                    }
                    isRequired
                    isDisabled={props.machineTypes.isFetching}
                    options={machineTypeOptions}
                  />
                )}
              </form.Field>
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>

        <AutoscalingField
          autoscaling={cluster.autoscaling}
          machinePoolsNumber={cluster.machine_pools_subnets?.length}
          openshiftVersion={cluster.cluster_version}
        />
      </FormSection>

      <ExpandableSection toggleText={mp.advancedToggle}>
        <div className="pf-v6-u-ml-lg">
          <form.Field name="cluster.imds">
            {(field) => (
              <FormRadioGroup
                field={field}
                label={mp.imdsLabel}
                labelHelp={
                  <>
                    <Content component={ContentVariants.p}>{mp.imdsHelpP1}</Content>
                    <Content component={ContentVariants.p}>
                      {/* TODO: ExternalLink to AWS IMDS documentation */}
                    </Content>
                  </>
                }
                labelHelpTitle={mp.imdsHelpTitle}
                isDisabled={!canSelectImds(clusterVersion)}
                options={[
                  {
                    value: 'imdsv1andimdsv2',
                    label: mp.imdsBothLabel,
                    description: mp.imdsBothDescription,
                  },
                  {
                    value: 'imdsv2only',
                    label: mp.imdsV2Label,
                    description: mp.imdsV2Description,
                  },
                ]}
              />
            )}
          </form.Field>

          <form.Field name="cluster.compute_root_volume">
            {(field) => (
              <FormNumberInput
                field={field}
                label={mp.rootDiskLabel}
                labelHelp={mp.rootDiskHelp}
                min={75}
                max={maxRootDiskSize}
              />
            )}
          </form.Field>
        </div>
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
