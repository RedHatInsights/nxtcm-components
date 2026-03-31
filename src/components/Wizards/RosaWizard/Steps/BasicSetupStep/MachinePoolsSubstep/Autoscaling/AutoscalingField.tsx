import { useData, WizCheckbox, WizNumberInput } from '@patternfly-labs/react-form-wizard';
import { Flex, FlexItem } from '@patternfly/react-core';
import {
  validateMinReplicas,
  validateMaxReplicas,
  validateComputeNodes,
} from '../../../../validators';
import ExternalLink from '../../../../common/ExternalLink';
import links from '../../../../externalLinks';
import {
  useRosaWizardStrings,
  useRosaWizardValidators,
} from '../../../../RosaWizardStringsContext';

type AutoscalingFieldProps = {
  autoscaling?: boolean;
  machinePoolsNumber?: number;
  openshiftVersion?: string;
};

export const MAX_NODES_HCP_DEFAULT = 500;
export const MAX_NODES_HCP_INSUFFICIENT_VERSION = 90;

const scaleMinNodesOnMachinePoolNumber = (machinePoolsNumber?: number) =>
  machinePoolsNumber && machinePoolsNumber > 1 ? 1 : 2;

const scaleMaxNodesBasedOnOpenshiftVersion = (openshiftVersion: string) => {
  const majorMinor = parseFloat(openshiftVersion.toString());
  const versionPatch = Number(openshiftVersion.toString().split('.')[2]);
  if (majorMinor >= 4.16) {
    return true;
  }
  if (majorMinor <= 4.13) {
    return false;
  }
  if (majorMinor === 4.14) {
    return versionPatch >= 28;
  }
  if (majorMinor === 4.15) {
    return versionPatch >= 15;
  }
  return true;
};

export const getAutoscalingMaxNodes = (openshiftVersion?: string) => {
  if (openshiftVersion && !scaleMaxNodesBasedOnOpenshiftVersion(openshiftVersion)) {
    return MAX_NODES_HCP_INSUFFICIENT_VERSION;
  }
  return MAX_NODES_HCP_DEFAULT;
};

export const AutoscalingField = (props: AutoscalingFieldProps) => {
  const a = useRosaWizardStrings().autoscaling;
  const v = useRosaWizardValidators();
  const { update } = useData();

  const { autoscaling, openshiftVersion, machinePoolsNumber } = props;

  const maxNodeBasedOnOpenshiftVersion = getAutoscalingMaxNodes(openshiftVersion);

  return (
    <>
      <WizCheckbox
        id="autoscaling-checkbox"
        title={a.title}
        helperText={
          <>
            {a.helperLead}{' '}
            <ExternalLink href={links.ROSA_CLUSTER_AUTOSCALING}>
              {a.learnMoreAutoscaling}
            </ExternalLink>
          </>
        }
        path="cluster.autoscaling"
        label={a.enableLabel}
        onValueChange={(checked, item) => {
          if (checked) {
            delete item.cluster.nodes_compute;

            item.cluster.min_replicas = scaleMinNodesOnMachinePoolNumber(machinePoolsNumber);
            item.cluster.max_replicas = 4;

            update();
          } else {
            delete item.cluster.min_replicas;
            delete item.cluster.max_replicas;
            item.cluster.nodes_compute = 2;
            update();
          }
        }}
      />
      {autoscaling ? (
        <Flex>
          <FlexItem>
            <WizNumberInput
              required
              path="cluster.min_replicas"
              label={a.minLabel}
              labelHelp={
                <>
                  {a.minHelp}
                  <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                    {a.learnMoreNodeCount}
                  </ExternalLink>
                </>
              }
              min={machinePoolsNumber && scaleMinNodesOnMachinePoolNumber(machinePoolsNumber)}
              max={maxNodeBasedOnOpenshiftVersion}
              validation={(value: number, item) =>
                validateMinReplicas(value, item, machinePoolsNumber, v.replicas)
              }
            />
          </FlexItem>
          <FlexItem>
            <WizNumberInput
              required
              path="cluster.max_replicas"
              label={a.maxLabel}
              labelHelp={
                <>
                  {a.maxHelp}
                  <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                    {a.learnMoreNodeCount}
                  </ExternalLink>
                </>
              }
              min={1}
              max={maxNodeBasedOnOpenshiftVersion}
              validation={(value, item) =>
                validateMaxReplicas(
                  value as number,
                  item,
                  maxNodeBasedOnOpenshiftVersion,
                  v.replicas
                )
              }
            />
          </FlexItem>
        </Flex>
      ) : (
        <WizNumberInput
          required
          path="cluster.nodes_compute"
          label={a.computeCountLabel}
          labelHelp={
            <>
              {a.computeCountHelp}
              <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                {a.learnMoreNodeCount}
              </ExternalLink>
            </>
          }
          min={1}
          validation={(value) => validateComputeNodes(value, v.replicas)}
        />
      )}
    </>
  );
};
