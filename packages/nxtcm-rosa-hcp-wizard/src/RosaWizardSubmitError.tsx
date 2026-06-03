import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateStatus,
} from '@patternfly/react-core';
import { useRosaHcpWizardStrings } from './stringsProvider/RosaHcpWizardStringsContext';

export type RosaWizardSubmitErrorProps = {
  /** Error message or flag from parent (e.g. submit failure). */
  onSubmitError: string | boolean;
  /** When provided, "Back to the wizard" is shown and this is called when it is clicked. */
  onBackToReviewStep?: () => void | Promise<void>;
  /** True while the back-to-wizard action is in progress (disables button). */
  isNavigatingToReview: boolean;
  onCancel: () => void;
};

export function RosaWizardSubmitError(props: RosaWizardSubmitErrorProps) {
  const { onSubmitError, onBackToReviewStep, isNavigatingToReview, onCancel } = props;
  const { submitError } = useRosaHcpWizardStrings();

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
