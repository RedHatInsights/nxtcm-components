import { Split, SplitItem } from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ROSAHCPCluster } from '../../../types';
import ExternalLink from '../../../components/ExternalLink';
import { useDocsVersion } from '../../../constants/links';
import { WizNumberInput } from '../../../components/WizFields';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { clusterValidationSchema, minReplicasSchema } from '../../../yupSchemas';
import { FIELD_NAME } from '../../../constants';

const minReplicasUiMin = minReplicasSchema.getDefault() as number;

function AutoscalingReplicasLabelHelp({ helpText }: { helpText: string }) {
  const a = useRosaHcpWizardStrings().autoscaling;
  const clusterVersion = useWatch({ name: FIELD_NAME.CLUSTER_VERSION }) ?? '';
  const links = useDocsVersion(clusterVersion);
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
  const { control } = useFormContext<ROSAHCPCluster>();
  const minReplicas = useWatch({ control, name: FIELD_NAME.MIN_REPLICAS });
  const maxReplicas = useWatch({ control, name: FIELD_NAME.MAX_REPLICAS });

  const minReplicasMax =
    typeof maxReplicas === 'number' && Number.isFinite(maxReplicas)
      ? Math.min(maxReplicas, maxAutoscalingNodes)
      : maxAutoscalingNodes;
  const maxReplicasMin =
    typeof minReplicas === 'number' && Number.isFinite(minReplicas) ? minReplicas : 1;

  return (
    <Split hasGutter isWrappable>
      <SplitItem>
        <WizNumberInput<ROSAHCPCluster>
          name={FIELD_NAME.MIN_REPLICAS}
          schema={clusterValidationSchema}
          min={minReplicasUiMin}
          max={minReplicasMax}
          labelHelp={<AutoscalingReplicasLabelHelp helpText={a.minHelp} />}
        />
      </SplitItem>
      <SplitItem>
        <WizNumberInput<ROSAHCPCluster>
          name={FIELD_NAME.MAX_REPLICAS}
          schema={clusterValidationSchema}
          min={maxReplicasMin}
          max={maxAutoscalingNodes}
          labelHelp={<AutoscalingReplicasLabelHelp helpText={a.maxHelp} />}
        />
      </SplitItem>
    </Split>
  );
};
