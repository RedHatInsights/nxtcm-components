import { useEffect, useMemo } from 'react';
import { Content, ContentVariants, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';

import type { ClusterFormData } from '../../../../types';
import type { ROSAHCPWizardData } from '../../../types';
import {
  buildMachinePoolsReviewSelectOptions,
  canSelectImds,
  getWorkerNodeVolumeSizeMaxGiB,
  resolveSelectedVpc,
} from '../../../helpers';
import { Section } from '../../../components/Section';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';
import { WizCheckbox, WizNumberInput, WizSelect } from '../../../components/WizFields';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { clusterValidationSchema } from '../../../yupSchemas';
import { getAutoscalingMaxNodes } from '../../../getAutoscalingMaxNodes';
import { MachinePoolsAdvancedSection } from './MachinePoolsAdvancedSection';
import { MachinePoolsAutoscalingReplicas } from './MachinePoolsAutoscalingReplicas';
import { SecurityGroupsSection } from './SecurityGroupSection/SecurityGroupSection';
import {
  useAutoscalingFieldDefaults,
  useEnsureMachinePoolSubnetRow,
  useResetOnVpcChange,
} from './useMachinePoolsFormEffects';

type MachinePoolsProps = Pick<ROSAHCPWizardData, 'vpcList' | 'machineTypes'>;

export const MachinePools = (props: MachinePoolsProps) => {
  const { vpcList, machineTypes } = props;
  const mp = useRosaHcpWizardStrings().machinePools;
  const a = useRosaHcpWizardStrings().autoscaling;

  const { control } = useFormContext<Partial<ClusterFormData>>();

  const region = useWatch({ control, name: 'region' });
  const clusterVersion = useWatch({ control, name: 'cluster_version' }) ?? '';
  const selectedVpcRaw = useWatch({ control, name: 'selected_vpc' });
  const autoscaling = useWatch({ control, name: 'autoscaling' });

  const maxRootDiskSize = getWorkerNodeVolumeSizeMaxGiB(clusterVersion);
  const wrongVersionForIMDS = !canSelectImds(clusterVersion);
  const maxAutoscalingNodes = getAutoscalingMaxNodes(clusterVersion);

  const selectedVPC = useMemo(
    () => resolveSelectedVpc(selectedVpcRaw, vpcList.data),
    [selectedVpcRaw, vpcList.data]
  );

  const machinePoolsSelectOptions = useMemo(
    () => buildMachinePoolsReviewSelectOptions(selectedVPC, vpcList.data),
    [selectedVPC, vpcList.data]
  );

  const vpcId = typeof selectedVpcRaw === 'string' ? selectedVpcRaw : selectedVpcRaw?.id;

  useResetOnVpcChange(vpcId);
  useEnsureMachinePoolSubnetRow();
  useAutoscalingFieldDefaults(autoscaling);

  useEffect(() => {
    if (region) {
      void machineTypes.fetch(region);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, machineTypes.fetch]);

  const { vpc: vpcOptions, subnet: subnetOptions } = machinePoolsSelectOptions;

  const onRefreshVpc = vpcList.fetch
    ? () => {
        void vpcList.fetch?.();
      }
    : undefined;
  const onRefreshMachineTypes =
    region && machineTypes.fetch
      ? () => {
          void machineTypes.fetch(region);
        }
      : undefined;

  return (
    <>
      <Section label={mp.sectionLabel} id="machine-pools-section">
        {/* Stack + StackItem matches Details step; avoids extra mt-* on top of FormGroup margins. */}
        <Stack hasGutter>
          <StackItem>
            <Content component={ContentVariants.p}>{mp.intro}</Content>
          </StackItem>
          <StackItem>
            <Grid>
              <GridItem span={5}>
                <WizSelect<Partial<ClusterFormData>>
                  name="selected_vpc"
                  schema={clusterValidationSchema}
                  label={`${mp.vpcLabelPrefix} ${region ?? ''}`}
                  placeholder={[mp.vpcPlaceholder, region].filter(Boolean).join(' ')}
                  isLoading={vpcList.isFetching}
                  options={vpcOptions}
                  apiError={vpcList.error}
                  onRefresh={onRefreshVpc}
                  isDisabled={vpcList.isFetching}
                  labelHelp={
                    <>
                      {mp.vpcHelpLead}{' '}
                      <ExternalLink href={links.ROSA_SHARED_VPC}>
                        {mp.vpcLearnMoreLink}
                      </ExternalLink>
                    </>
                  }
                />
              </GridItem>
            </Grid>
          </StackItem>
          <StackItem>
            <Grid>
              <GridItem span={5}>
                <WizSelect<Partial<ClusterFormData>>
                  name="machine_pools_subnets.0.machine_pool_subnet"
                  schema={clusterValidationSchema}
                  label={mp.subnetLabel}
                  placeholder={mp.subnetPlaceholder}
                  options={subnetOptions}
                  isLoading={vpcList.isFetching}
                  apiError={vpcList.error}
                  onRefresh={onRefreshVpc}
                  isDisabled={vpcList.isFetching || !selectedVPC}
                />
              </GridItem>
            </Grid>
          </StackItem>
          <StackItem>
            <Grid>
              <GridItem span={5}>
                <WizSelect<Partial<ClusterFormData>>
                  name="machine_type"
                  schema={clusterValidationSchema}
                  isLoading={machineTypes.isFetching}
                  options={machineTypes.data}
                  apiError={machineTypes.error}
                  onRefresh={onRefreshMachineTypes}
                  isDisabled={machineTypes.isFetching}
                  labelHelp={
                    <>
                      {mp.instanceTypeHelpLead}{' '}
                      <ExternalLink href={links.ROSA_INSTANCE_TYPES}>
                        {mp.instanceTypeLearnMore}
                      </ExternalLink>
                    </>
                  }
                />
              </GridItem>
            </Grid>
          </StackItem>
          <StackItem>
            <WizCheckbox<Partial<ClusterFormData>>
              id="autoscaling-checkbox"
              name="autoscaling"
              schema={clusterValidationSchema}
              helperText={
                <>
                  {a.helperLead}{' '}
                  <ExternalLink href={links.ROSA_CLUSTER_AUTOSCALING}>
                    {a.learnMoreAutoscaling}
                  </ExternalLink>
                </>
              }
              label={a.enableLabel}
            />
          </StackItem>
          <StackItem>
            {autoscaling ? (
              <MachinePoolsAutoscalingReplicas maxAutoscalingNodes={maxAutoscalingNodes} />
            ) : (
              <WizNumberInput<Partial<ClusterFormData>>
                name="nodes_compute"
                schema={clusterValidationSchema}
                min={1}
                labelHelp={
                  <>
                    {a.computeCountHelp}
                    <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                      {a.learnMoreNodeCount}
                    </ExternalLink>
                  </>
                }
              />
            )}
          </StackItem>
        </Stack>
      </Section>

      <Stack hasGutter className="pf-v6-u-mt-md">
        <MachinePoolsAdvancedSection
          wrongVersionForIMDS={wrongVersionForIMDS}
          maxRootDiskSize={maxRootDiskSize}
        />

        <SecurityGroupsSection
          clusterVersion={clusterVersion}
          selectedVPC={selectedVPC}
          vpcList={vpcList}
          refreshVPCs={onRefreshVpc}
        />
      </Stack>
    </>
  );
};
