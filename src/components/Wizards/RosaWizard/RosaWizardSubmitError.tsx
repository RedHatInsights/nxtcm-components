import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateStatus,
} from '@patternfly/react-core';
import { useRosaWizardStrings } from './RosaWizardStringsContext';

/** Props for the submit-error empty state (message, optional back-to-review, cancel, loading). */
export type RosaWizardSubmitErrorProps = {
  /** Error message or flag from parent (e.g. submit failure). */
  onSubmitError: string | boolean;
  /** When provided, "Back to review step" is shown and this is called when it is clicked. */
  onBackToReviewStep?: () => void | Promise<void>;
  /** True while the back-to-review action is in progress (disables button). */
  isNavigatingToReview: boolean;
  onCancel: () => void;
};

/**
 * Full-screen PatternFly empty state shown when cluster creation submission fails or is flagged.
 */
export function RosaWizardSubmitError(props: RosaWizardSubmitErrorProps) {
  const { onSubmitError, onBackToReviewStep, isNavigatingToReview, onCancel } = props;
  const { submitError } = useRosaWizardStrings();

  return (
    <EmptyState status={EmptyStateStatus.danger} titleText={submitError.title} headingLevel="h2">
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
              {submitError.backToReviewStep}
            </Button>
          )}
        </EmptyStateActions>
        <EmptyStateActions>
          <Button variant="link" onClick={onCancel}>
            {submitError.exitWizard}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
