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
import { useRosaForm } from '../../../../RosaFormContext';
import { FormCheckbox, FormNumberInput } from '../../../../../../../TanstackForm';

type AutoscalingFieldProps = {
  autoscaling?: boolean;
  machinePoolsNumber?: number;
  openshiftVersion?: string;
};

export const MAX_NODES_HCP_DEFAULT = 500;
export const MAX_NODES_HCP_INSUFFICIENT_VERSION = 90;

const scaleMinNodesOnMachinePoolNumber = (machinePoolsNumber?: number): number =>
  machinePoolsNumber && machinePoolsNumber > 1 ? 1 : 2;

const scaleMaxNodesBasedOnOpenshiftVersion = (openshiftVersion: string): boolean => {
  const majorMinor = parseFloat(openshiftVersion.toString());
  const versionPatch = Number(openshiftVersion.toString().split('.')[2]);
  if (majorMinor >= 4.16) return true;
  if (majorMinor <= 4.13) return false;
  if (majorMinor === 4.14) return versionPatch >= 28;
  if (majorMinor === 4.15) return versionPatch >= 15;
  return true;
};

export const getAutoscalingMaxNodes = (openshiftVersion?: string): number => {
  if (openshiftVersion && !scaleMaxNodesBasedOnOpenshiftVersion(openshiftVersion)) {
    return MAX_NODES_HCP_INSUFFICIENT_VERSION;
  }
  return MAX_NODES_HCP_DEFAULT;
};

export const AutoscalingField = (props: AutoscalingFieldProps): JSX.Element => {
  const a = useRosaWizardStrings().autoscaling;
  const v = useRosaWizardValidators();
  const form = useRosaForm();

  const { autoscaling, openshiftVersion, machinePoolsNumber } = props;
  const maxNodeBasedOnOpenshiftVersion = getAutoscalingMaxNodes(openshiftVersion);

  return (
    <>
      <form.Field
        name="cluster.autoscaling"
        listeners={{
          onChange: ({ value }) => {
            if (value) {
              form.setFieldValue('cluster.nodes_compute', undefined);
              form.setFieldValue(
                'cluster.min_replicas',
                scaleMinNodesOnMachinePoolNumber(machinePoolsNumber)
              );
              form.setFieldValue('cluster.max_replicas', 4);
            } else {
              form.setFieldValue('cluster.min_replicas', undefined);
              form.setFieldValue('cluster.max_replicas', undefined);
              form.setFieldValue('cluster.nodes_compute', 2);
            }
          },
        }}
      >
        {(field) => (
          <FormCheckbox
            field={field}
            title={a.title}
            label={a.enableLabel}
            description={
              <>
                {a.helperLead}{' '}
                <ExternalLink href={links.ROSA_CLUSTER_AUTOSCALING}>
                  {a.learnMoreAutoscaling}
                </ExternalLink>
              </>
            }
          />
        )}
      </form.Field>

      {autoscaling ? (
        <Flex>
          <FlexItem>
            <form.Field
              name="cluster.min_replicas"
              validators={{
                onChange: ({ value }) =>
                  validateMinReplicas(
                    value as number,
                    { cluster: form.getFieldValue('cluster') },
                    machinePoolsNumber,
                    v.replicas
                  ) || undefined,
              }}
            >
              {(field) => (
                <FormNumberInput
                  field={field}
                  label={a.minLabel}
                  labelHelp={
                    <>
                      {a.minHelp}{' '}
                      <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                        {a.learnMoreNodeCount}
                      </ExternalLink>
                    </>
                  }
                  isRequired
                  min={
                    machinePoolsNumber
                      ? scaleMinNodesOnMachinePoolNumber(machinePoolsNumber)
                      : undefined
                  }
                  max={maxNodeBasedOnOpenshiftVersion}
                />
              )}
            </form.Field>
          </FlexItem>
          <FlexItem>
            <form.Field
              name="cluster.max_replicas"
              validators={{
                onChange: ({ value }) =>
                  validateMaxReplicas(
                    value as number,
                    { cluster: form.getFieldValue('cluster') },
                    maxNodeBasedOnOpenshiftVersion,
                    v.replicas
                  ) || undefined,
              }}
            >
              {(field) => (
                <FormNumberInput
                  field={field}
                  label={a.maxLabel}
                  labelHelp={
                    <>
                      {a.maxHelp}{' '}
                      <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                        {a.learnMoreNodeCount}
                      </ExternalLink>
                    </>
                  }
                  isRequired
                  min={1}
                  max={maxNodeBasedOnOpenshiftVersion}
                />
              )}
            </form.Field>
          </FlexItem>
        </Flex>
      ) : (
        <form.Field
          name="cluster.nodes_compute"
          validators={{
            onChange: ({ value }) => validateComputeNodes(value as number, v.replicas) || undefined,
          }}
        >
          {(field) => (
            <FormNumberInput
              field={field}
              label={a.computeCountLabel}
              labelHelp={
                <>
                  {a.computeCountHelp}{' '}
                  <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                    {a.learnMoreNodeCount}
                  </ExternalLink>
                </>
              }
              isRequired
              min={1}
            />
          )}
        </form.Field>
      )}
    </>
  );
};
