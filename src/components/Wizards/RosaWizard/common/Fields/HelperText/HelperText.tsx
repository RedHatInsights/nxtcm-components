import { type ComponentProps, type ReactNode } from 'react';
import {
  FormHelperText,
  HelperTextItem,
  HelperText as PFHelperText,
  HelperTextItemVariant,
  HelperTextItemProps,
} from '@patternfly/react-core';

import { helperTextId } from './helperTextUtils';

type FormHelperTextComponentProps = ComponentProps<typeof FormHelperText>;

export interface HelperTextProps extends Omit<FormHelperTextComponentProps, 'children' | 'label'> {
  helperText?: ReactNode | string;
  errorMessage?: ReactNode | string;
  isError?: boolean;
  isSuccess?: boolean;
  successMessage?: ReactNode | string;
  id: string;
  isDisabled?: boolean;
}

export function HelperText(props: HelperTextProps) {
  const {
    errorMessage,
    helperText,
    id,
    isError,
    isDisabled,
    isSuccess,
    successMessage,
    ...formHelperTextRest
  } = props;

  const isErrorMessage = !!isError && !!errorMessage;
  const isSuccessMessage = !!isSuccess && !!successMessage;

  let variant: HelperTextItemProps['variant'] = undefined;
  let message: ReactNode | string = helperText;

  if (isErrorMessage) {
    variant = HelperTextItemVariant.error;
    message = errorMessage;
  } else if (isSuccessMessage && !isError) {
    variant = HelperTextItemVariant.success;
    message = successMessage;
  }

  return helperText || isErrorMessage || isSuccessMessage ? (
    <FormHelperText {...formHelperTextRest}>
      <PFHelperText>
        <HelperTextItem
          id={helperTextId({ id, errorMessage, helperText, isError, isSuccess, successMessage })}
          variant={variant}
        >
          <span
            className={isDisabled && !isErrorMessage ? 'pf-v6-u-text-color-disabled' : undefined}
          >
            {message}
          </span>
        </HelperTextItem>
      </PFHelperText>
    </FormHelperText>
  ) : null;
}
