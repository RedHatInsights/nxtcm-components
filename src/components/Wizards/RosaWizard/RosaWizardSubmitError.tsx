import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateStatus,
} from '@patternfly/react-core';

export type RosaWizardSubmitErrorProps = {
  /** Error message or flag from parent (e.g. submit failure). */
  onSubmitError: string | boolean;
  /** When provided, "Back to review step" is shown and this is called when it is clicked. */
  onBackToReviewStep?: () => void | Promise<void>;
  /** True while the back-to-review action is in progress (disables button). */
  isNavigatingToReview: boolean;
  onCancel: () => void;
};

export function RosaWizardSubmitError(props: RosaWizardSubmitErrorProps) {
  const { onSubmitError, onBackToReviewStep, isNavigatingToReview, onCancel } = props;

  return (
    <EmptyState
      status={EmptyStateStatus.danger}
      titleText={'Error creating cluster'}
      headingLevel="h2"
    >
      {typeof onSubmitError === 'string' && onSubmitError.length > 0 && (
        <EmptyStateBody>{onSubmitError}</EmptyStateBody>
      )}
      <EmptyStateFooter>
        <EmptyStateActions>
          {onBackToReviewStep && (
            <Button
              variant="primary"
              onClick={() => void onBackToReviewStep()}
              isLoading={isNavigatingToReview}
              isDisabled={isNavigatingToReview}
            >
              Back to review step
            </Button>
          )}
        </EmptyStateActions>
        <EmptyStateActions>
          <Button variant="link" onClick={onCancel}>
            Exit wizard
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
