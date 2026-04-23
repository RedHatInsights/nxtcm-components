import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

export type RhfFieldErrorProps = {
  /** Optional DOM id for `aria-describedby` on the control. */
  id?: string;
  message?: string;
};

export const RhfFieldError = ({ id, message }: RhfFieldErrorProps) =>
  message ? (
    <FormHelperText id={id}>
      <HelperText>
        <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
          {message}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  ) : null;
