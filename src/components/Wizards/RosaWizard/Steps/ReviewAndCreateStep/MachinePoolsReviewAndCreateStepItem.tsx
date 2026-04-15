import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import { type MachinePoolSubnetEntry } from '../../../types';

/** Props for the machine pool vs subnet summary list on the review step. */
export type MachinePoolsReviewAndCreateStepItemProps = {
  machinePools: MachinePoolSubnetEntry[];
  poolLabel: string;
  subnetLabel: string;
};

/**
 * Renders each machine pool’s subnet choice in a two-column layout with lock affordances
 * for fields that are not editable on this screen.
 */
export const MachinePoolsReviewAndCreateStepItem: React.FunctionComponent<
  MachinePoolsReviewAndCreateStepItemProps
> = ({ machinePools, poolLabel, subnetLabel }) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <strong>{poolLabel}</strong>
          </FlexItem>
          <FlexItem>
            <Flex>
              <FlexItem>
                <strong>{subnetLabel}</strong>
              </FlexItem>
              <FlexItem>
                <LockIcon />
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </StackItem>

      {machinePools.map((entry, index) => (
        <StackItem key={index}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>{`${poolLabel} ${index + 1}`}</FlexItem>
            <FlexItem>{entry.machine_pool_subnet || '—'}</FlexItem>
          </Flex>
        </StackItem>
      ))}
    </Stack>
  );
};
