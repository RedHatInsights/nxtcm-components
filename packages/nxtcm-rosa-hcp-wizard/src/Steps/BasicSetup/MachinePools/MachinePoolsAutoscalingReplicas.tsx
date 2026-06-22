import { Flex, FlexItem } from '@patternfly/react-core';
import type { ROSAHCPCluster } from '../../../types';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../constants/links';
import { WizNumberInput } from '../../../components/WizFields';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { clusterValidationSchema, minReplicasSchema } from '../../../yupSchemas';

const minReplicasUiMin = minReplicasSchema.getDefault() as number;

function AutoscalingReplicasLabelHelp({ helpText }: { helpText: string }) {
  const a = useRosaHcpWizardStrings().autoscaling;
  return (
    <>
      {helpText}{' '}
      <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>{a.learnMoreNodeCount}</ExternalLink>
    </>
  );
}

export interface MachinePoolsAutoscalingReplicasProps {
  /** Upper bound for min/max replica inputs from the selected OpenShift version. */
  maxAutoscalingNodes: number;
}

export const MachinePoolsAutoscalingReplicas = (props: MachinePoolsAutoscalingReplicasProps) => {
  const { maxAutoscalingNodes } = props;
  const a = useRosaHcpWizardStrings().autoscaling;

  return (
    <Flex>
      <FlexItem>
        <WizNumberInput<ROSAHCPCluster>
          name="min_replicas"
          schema={clusterValidationSchema}
          min={minReplicasUiMin}
          max={maxAutoscalingNodes}
          labelHelp={<AutoscalingReplicasLabelHelp helpText={a.minHelp} />}
        />
      </FlexItem>
      <FlexItem>
        <WizNumberInput<ROSAHCPCluster>
          name="max_replicas"
          schema={clusterValidationSchema}
          min={1}
          max={maxAutoscalingNodes}
          labelHelp={<AutoscalingReplicasLabelHelp helpText={a.maxHelp} />}
        />
      </FlexItem>
    </Flex>
  );
};
