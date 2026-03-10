import { useData, WizCheckbox, WizNumberInput } from '@patternfly-labs/react-form-wizard';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useTranslation } from '../../../../../../../context/TranslationContext';
import {
  validateMinReplicas,
  validateMaxReplicas,
  validateComputeNodes,
} from '../../../../validators';
import ExternalLink from '../../../../common/ExternalLink';
import links from '../../../../externalLinks';

type AutoscalingFieldProps = {
  autoscaling: boolean;
  machinePoolsNumber: number;
  openshiftVersion: number;
};

export const MAX_NODES_HCP_DEFAULT = 500;
export const MAX_NODES_HCP_INSUFFICIENT_VERSION = 90;

const scaleMinNodesOnMachinePoolNumber = (machinePoolsNumber: number) =>
  machinePoolsNumber > 1 ? 1 : 2;

const scaleMaxNodesBasedOnOpenshiftVersion = (openshiftVersion: number) => {
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

//Minimal versions to allow more then 90 nodes - 4.15.15, 4.14.28
export const getAutoscalingMaxNodes = (openshiftVersion?: number) => {
  if (openshiftVersion && !scaleMaxNodesBasedOnOpenshiftVersion(openshiftVersion)) {
    return MAX_NODES_HCP_INSUFFICIENT_VERSION;
  }
  return MAX_NODES_HCP_DEFAULT;
};

export const AutoscalingField = (props: AutoscalingFieldProps) => {
  const { t } = useTranslation();
  const { update } = useData();

  const { autoscaling, openshiftVersion, machinePoolsNumber } = props;

  const maxNodeBasedOnOpenshiftVersion = getAutoscalingMaxNodes(openshiftVersion);

  return (
    <>
      <WizCheckbox
        id="autoscaling-checkbox"
        title={t('Autoscaling')}
        helperText={
          <>
            {t(
              'Autoscaling automatically adds and removes nodes from the machine pool based on resource requirements.'
            )}{' '}
            <ExternalLink href={links.ROSA_CLUSTER_AUTOSCALING}>
              Learn more about autscaling with ROSA.
            </ExternalLink>
          </>
        }
        path="cluster.autoscaling"
        label={t('Enable autoscaling')}
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
              label={t('Min compute node count')}
              labelHelp={
                <>
                  {t('The number of compute nodes to provision for your initial machine pool.')}
                  <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                    Learn more about compute node count
                  </ExternalLink>
                </>
              }
              min={scaleMinNodesOnMachinePoolNumber(machinePoolsNumber)}
              max={maxNodeBasedOnOpenshiftVersion}
              validation={(value: number, item) =>
                validateMinReplicas(value, item, machinePoolsNumber)
              }
            />
          </FlexItem>
          <FlexItem>
            <WizNumberInput
              required
              path="cluster.max_replicas"
              label={t('Max compute node count')}
              labelHelp={
                <>
                  {t('The number of compute nodes to provision for your initial machine pool.')}
                  <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                    Learn more about compute node count
                  </ExternalLink>
                </>
              }
              min={1}
              max={maxNodeBasedOnOpenshiftVersion}
              validation={(value, item) =>
                validateMaxReplicas(value as number, item, maxNodeBasedOnOpenshiftVersion)
              }
            />
          </FlexItem>
        </Flex>
      ) : (
        <WizNumberInput
          required
          path="cluster.nodes_compute"
          label={t('Compute node count')}
          labelHelp={
            <>
              {t('The number of compute nodes to provision for your initial machine pool.')}
              <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                Learn more about compute node count
              </ExternalLink>
            </>
          }
          min={1}
          validation={validateComputeNodes}
        />
      )}
    </>
  );
};
