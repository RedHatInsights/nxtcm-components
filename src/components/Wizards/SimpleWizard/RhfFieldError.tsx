import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

export const RhfFieldError = ({ message }: { message?: string }) =>
  message ? (
    <FormHelperText>
      <HelperText>
        <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
          {message}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  ) : null;
