// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
/**
 * Playwright CT mount targets for {@link RosaWizardSubmitError}.
 * Stateful wrappers live here so specs can mount them (Playwright CT cannot mount components defined in test files).
 */
import React from 'react';

import { withRosaCt } from '../components/WizFields/wizFieldCtSpecHelpers';
import { RosaWizardSubmitError } from './RosaWizardSubmitError';

export type RosaWizardSubmitErrorMountProps = React.ComponentProps<typeof RosaWizardSubmitError>;

function RosaWizardSubmitErrorMountComponent(props: RosaWizardSubmitErrorMountProps) {
  return withRosaCt(<RosaWizardSubmitError {...props} />);
}

/** Starts in submit error state and clears error when "Back to the wizard" is clicked. */
export function RosaWizardSubmitErrorThenBackMount(
  props: Omit<
    RosaWizardSubmitErrorMountGalleryProps,
    'onSubmitError' | 'onBackToReviewStep' | 'isNavigatingToReview'
  >
) {
  const [submitError, setSubmitError] = React.useState<string | boolean>(
    'There has been an error creating the cluster'
  );
  const [isNavigatingToReview, setIsNavigatingToReview] = React.useState(false);

  const onBackToReviewStep = React.useCallback(async () => {
    setIsNavigatingToReview(true);
    await new Promise((resolve) => setTimeout(resolve, 50));
    setSubmitError(false);
    setIsNavigatingToReview(false);
  }, []);

  if (!submitError) {
    return withRosaCt(<p>Wizard content restored</p>);
  }

  return withRosaCt(
    <RosaWizardSubmitError
      {...props}
      onCancel={() => {}}
      onSubmitError={submitError}
      onBackToReviewStep={onBackToReviewStep}
      isNavigatingToReview={isNavigatingToReview}
    />
  );
}

type BrowserProps = NonNullable<React.ComponentProps<typeof RosaWizardSubmitErrorMountComponent>>;

export type RosaWizardSubmitErrorMountGalleryProps = Omit<
  BrowserProps,
  'onCancel' | 'onBackToReviewStep'
> & {
  onCancel?: boolean;
  onBackToReviewStep?: boolean;
};

export function RosaWizardSubmitErrorMount(
  props: RosaWizardSubmitErrorMountGalleryProps
): React.ReactElement {
  const [onCancelCalls, setOnCancelCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onCancel']>>[]
  >([]);
  const [onBackToReviewStepCalls, setOnBackToReviewStepCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onBackToReviewStep']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onCancel: props.onCancel
        ? () => {
            setOnCancelCalls((calls) => [...calls, []]);
          }
        : () => {},
      onBackToReviewStep: props.onBackToReviewStep
        ? () => {
            setOnBackToReviewStepCalls((calls) => [...calls, []]);
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <RosaWizardSubmitErrorMountComponent {...browserProps} />
      <div hidden>
        <input data-testid="onCancel-calls" readOnly value={JSON.stringify(onCancelCalls)} />
        <input data-testid="onCancel-count" readOnly value={String(onCancelCalls.length)} />
        <input
          data-testid="onBackToReviewStep-calls"
          readOnly
          value={JSON.stringify(onBackToReviewStepCalls)}
        />
        <input
          data-testid="onBackToReviewStep-count"
          readOnly
          value={String(onBackToReviewStepCalls.length)}
        />
      </div>
    </>
  );
}
