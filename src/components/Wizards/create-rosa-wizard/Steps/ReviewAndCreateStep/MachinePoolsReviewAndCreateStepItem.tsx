import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

type MachinePoolReviewAndCreateItem = {
  availability_zone: string;
  public_subnet: string;
};

type MachinePoolsReviewAndCreateStepItemProps = {
  machinePools: MachinePoolReviewAndCreateItem[];
};

export const MachinePoolsReviewAndCreateStepItem: React.FunctionComponent<
  MachinePoolsReviewAndCreateStepItemProps
> = ({ machinePools }) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <strong>Availability zone</strong>
          </FlexItem>
          <FlexItem>
            <Flex>
              <FlexItem>
                <strong>Public subnet</strong>
              </FlexItem>
              <FlexItem>
                <LockIcon />
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </StackItem>

      {machinePools.map((machinePool: MachinePoolReviewAndCreateItem, index: number) => {
        return (
          <StackItem key={index}>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <FlexItem>{machinePool?.availability_zone}</FlexItem>
              <FlexItem>{machinePool?.public_subnet}</FlexItem>
            </Flex>
          </StackItem>
        );
      })}
    </Stack>
  );
};
