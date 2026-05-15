import { Flex, FlexItem } from '@patternfly/react-core';

import type { ClusterFormData } from '../../../../types';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';
import { WizNumberInput } from '../../../components/WizFields';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { clusterValidationSchema, minReplicasSchema } from '../../../yupSchemas';

const minReplicasUiMin = minReplicasSchema.getDefault() as number;

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
        <WizNumberInput<Partial<ClusterFormData>>
          name="min_replicas"
          schema={clusterValidationSchema}
          min={minReplicasUiMin}
          max={maxAutoscalingNodes}
          labelHelp={
            <>
              {a.minHelp}
              <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                {a.learnMoreNodeCount}
              </ExternalLink>
            </>
          }
        />
      </FlexItem>
      <FlexItem>
        <WizNumberInput<Partial<ClusterFormData>>
          name="max_replicas"
          schema={clusterValidationSchema}
          min={1}
          max={maxAutoscalingNodes}
          labelHelp={
            <>
              {a.maxHelp}
              <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                {a.learnMoreNodeCount}
              </ExternalLink>
            </>
          }
        />
      </FlexItem>
    </Flex>
  );
};
