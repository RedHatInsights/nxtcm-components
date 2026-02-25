import { WizCheckbox, WizNumberInput } from '@patternfly-labs/react-form-wizard';
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
};

export const AutoscalingField = (props: AutoscalingFieldProps) => {
  const { t } = useTranslation();

  const { autoscaling } = props;

  return (
    <>
      <WizCheckbox
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
            item.cluster.min_replicas = 2;
            item.cluster.max_replicas = 4;
          } else {
            delete item.cluster.min_replicas;
            delete item.cluster.max_replicas;
            item.cluster.nodes_compute = 2;
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
              min={1}
              max={500}
              validation={validateMinReplicas}
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
              max={500}
              validation={validateMaxReplicas}
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
