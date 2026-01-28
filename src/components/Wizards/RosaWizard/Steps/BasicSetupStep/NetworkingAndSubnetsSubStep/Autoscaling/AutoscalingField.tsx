import { WizCheckbox, WizNumberInput } from '@patternfly-labs/react-form-wizard';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useTranslation } from '../../../../../../../context/TranslationContext';
import {
  validateMinReplicas,
  validateMaxReplicas,
  validateComputeNodes,
} from '../../../../validators';

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
        helperText={t(
          'Autoscaling automatically adds and removes nodes from the machine pool based on resource requirements. {HERE GOES LINK: Learn more about autscaling with ROSA.}'
        )}
        path="cluster.autoscaling"
        label={t('Enable autoscaling')}
      />
      {autoscaling ? (
        <Flex>
          <FlexItem>
            <WizNumberInput
              required
              path="cluster.min_replicas"
              label={t('Min compute node count')}
              labelHelp={t(
                'The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}.'
              )}
              min={1}
              validation={validateMinReplicas}
            />
          </FlexItem>
          <FlexItem>
            <WizNumberInput
              required
              path="cluster.max_replicas"
              label={t('Max compute node count')}
              labelHelp={t(
                'The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}.'
              )}
              min={1}
              validation={validateMaxReplicas}
            />
          </FlexItem>
        </Flex>
      ) : (
        <WizNumberInput
          required
          path="cluster.nodes_compute"
          label={t('Compute node count')}
          labelHelp={t(
            'The number of compute nodes to provision for your initial machine pool. {HERE GOES LINK: Learn more about compute node count}.'
          )}
          min={1}
          validation={validateComputeNodes}
        />
      )}
    </>
  );
};
