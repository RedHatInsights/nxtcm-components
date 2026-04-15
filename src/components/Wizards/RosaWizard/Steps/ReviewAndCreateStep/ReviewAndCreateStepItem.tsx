import { StackItem, Flex, FlexItem } from '@patternfly/react-core';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';

/** Single label/value row for review summaries, optionally showing a lock icon. */
type ReviewAndCreateStepItemProps = {
  label: string;
  value: string | number | boolean | undefined;
  hasIcon?: boolean;
};

/**
 * Displays one reviewed field as label and stringified value, with optional lock icon
 * for read-only cluster metadata.
 */
export const ReviewAndCreateStepItem: React.FunctionComponent<ReviewAndCreateStepItemProps> = ({
  label,
  value,
  hasIcon,
}) => {
  return (
    <StackItem>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <FlexItem>{label}</FlexItem>
        <FlexItem>
          {String(value ?? '')} {hasIcon && <LockIcon />}
        </FlexItem>
      </Flex>
    </StackItem>
  );
};
