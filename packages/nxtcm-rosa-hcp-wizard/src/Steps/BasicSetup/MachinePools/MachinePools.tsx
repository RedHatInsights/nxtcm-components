import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ROSAHCPCluster, ROSAHCPWizardData, VPCRefetchArgs } from '../../../types';
import {
  buildMachinePoolsReviewSelectOptions,
  canSelectImds,
  getWorkerNodeVolumeSizeMaxGiB,
  resolveSelectedVpc,
} from '../../../utilities/helpers';
import { Section } from '../../../components/Section';
import { FieldWrapper, FieldWrapperStack } from '../../../components/FieldWrapper';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../constants/links';
import { WizCheckbox, WizNumberInput, WizSelect } from '../../../components/WizFields';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { clusterValidationSchema } from '../../../yupSchemas';
import { getAutoscalingMaxNodes } from '../../../utilities/getAutoscalingMaxNodes';
import { MachinePoolsAdvancedSection } from './MachinePoolsAdvancedSection';
import { MachinePoolsAutoscalingReplicas } from './MachinePoolsAutoscalingReplicas';

type MachinePoolsProps = Pick<ROSAHCPWizardData, 'vpcList' | 'machineTypes'>;

export const MachinePools = (props: MachinePoolsProps) => {
  const { vpcList, machineTypes } = props;
  const mp = useRosaHcpWizardStrings().machinePools;
  const a = useRosaHcpWizardStrings().autoscaling;

  const { control } = useFormContext<Partial<ROSAHCPCluster>>();

  const region = useWatch({ control, name: 'region' });
  const clusterVersion = useWatch({ control, name: 'cluster_version' }) ?? '';
  const selectedVpcRaw = useWatch({ control, name: 'selected_vpc' });
  const autoscaling = useWatch({ control, name: 'autoscaling' });
  const awsAccountId = useWatch({ control, name: 'associated_aws_id' });
  const installerRoleArn = useWatch({ control, name: 'installer_role_arn' });
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

  const { vpc: vpcOptions, subnet: subnetOptions } = machinePoolsSelectOptions;

  const availabilityZones = useMemo(() => {
    if (!selectedVPC?.aws_subnets?.length) {
      return undefined;
    }
    return [...new Set(selectedVPC.aws_subnets.map((s) => s.availability_zone))];
  }, [selectedVPC]);

  const vpcRefetchArgs: VPCRefetchArgs | undefined =
    awsAccountId && installerRoleArn && region
      ? { account_id: awsAccountId, role_arn: installerRoleArn, region }
      : undefined;

  const onRefreshVpc = vpcRefetchArgs
    ? () => {
        void vpcList.fetch(vpcRefetchArgs);
      }
    : undefined;
  const machineTypesFetchArgs =
    installerRoleArn && region && availabilityZones
      ? { role_arn: installerRoleArn, region: region, availability_zones: availabilityZones }
      : undefined;

  const onRefreshMachineTypes = machineTypesFetchArgs
    ? () => {
        void machineTypes.fetch(machineTypesFetchArgs);
      }
    : undefined;

  return (
    <Section label={mp.sectionLabel} id="machine-pools-section" description={mp.intro}>
      <FieldWrapperStack>
        {/* <FieldWrapperBlock>
          <Content component={ContentVariants.p}>{mp.intro}</Content>
        </FieldWrapperBlock> */}
        <FieldWrapper width="medium">
          <WizSelect<ROSAHCPCluster>
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
                <ExternalLink href={links.ROSA_SHARED_VPC}>{mp.vpcLearnMoreLink}</ExternalLink>
              </>
            }
          />
        </FieldWrapper>
        <FieldWrapper width="medium">
          <WizSelect<ROSAHCPCluster>
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
        </FieldWrapper>
        <FieldWrapper width="medium">
          <WizSelect<ROSAHCPCluster>
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
        </FieldWrapper>
        <FieldWrapper>
          <WizCheckbox<ROSAHCPCluster>
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
        </FieldWrapper>
        <FieldWrapper>
          {autoscaling ? (
            <MachinePoolsAutoscalingReplicas maxAutoscalingNodes={maxAutoscalingNodes} />
          ) : (
            <WizNumberInput<ROSAHCPCluster>
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
        </FieldWrapper>
      </FieldWrapperStack>
      <MachinePoolsAdvancedSection
        wrongVersionForIMDS={wrongVersionForIMDS}
        maxRootDiskSize={maxRootDiskSize}
        clusterVersion={clusterVersion}
        selectedVPC={selectedVPC}
        vpcList={vpcList}
        refreshVPCs={onRefreshVpc}
      />
    </Section>
  );
};
