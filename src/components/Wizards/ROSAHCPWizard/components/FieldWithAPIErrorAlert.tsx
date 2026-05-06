import React from 'react';
import {
  Button,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import './FieldWithAPIErrorAlert.css';
import { useRosaHcpWizardStrings } from '../stringsProvider/RosaHcpWizardStringsContext';

type FieldWithAPIErrorAlertProps = {
  /** `false`/empty: children only. `true`: summary helper only (no popover). Other values: summary + popover with that detail. */
  error?: React.ReactNode;
  isFetching: boolean;
  fieldName: string;
  isValidation?: boolean;
  children?: React.ReactNode;
  retry?: () => void;
};

export const FieldWithAPIErrorAlert = ({
  error,
  isFetching,
  fieldName,
  isValidation = false,
  children,
  retry,
}: FieldWithAPIErrorAlertProps) => {
  const { common } = useRosaHcpWizardStrings();
  const { errorDetails, showErrorDetails, retry: retryLabel } = common;

  const title = isValidation
    ? `${common.errorValidatingPrefix} ${fieldName}`
    : `${common.errorLoadingPrefix} ${fieldName} ${common.listSuffix}`;

  const summaryHelper = (
    <FormHelperText>
      <HelperText>
        <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
          {title}
        </HelperTextItem>
      </HelperText>
    </FormHelperText>
  );

  const noErrorUi = isFetching || error === false || error == null || error === '';

  if (noErrorUi) {
    return <>{children ?? null}</>;
  }

  if (error === true) {
    return (
      <>
        {children ?? null}
        {summaryHelper}
      </>
    );
  }

  return (
    <>
      {children ?? null}
      <Popover
        appendTo={() => document.body}
        aria-label={errorDetails}
        alertSeverityVariant="danger"
        headerContent={title}
        headerIcon={<ExclamationCircleIcon />}
        bodyContent={<div>{error}</div>}
        footerContent={
          retry ? (
            <Button variant="link" onClick={retry}>
              {retryLabel}
            </Button>
          ) : undefined
        }
      >
        <Button
          type="button"
          variant="plain"
          className="field-with-api-error-alert__details-trigger"
          aria-label={showErrorDetails}
        >
          {summaryHelper}
        </Button>
      </Popover>
    </>
  );
};
