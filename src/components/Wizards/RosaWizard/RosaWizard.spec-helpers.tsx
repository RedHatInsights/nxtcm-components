import React from 'react';
import { RosaWizard } from './RosaWizard';

type RosaWizardProps = React.ComponentProps<typeof RosaWizard>;

/**
 * CT wrapper: starts with `onSubmitError` set; `onBackToReviewStep` clears it to re-show the wizard.
 * Exported because Playwright CT cannot mount components declared only inside a spec file.
 */
export function RosaWizardErrorThenBackToReviewMount(props: RosaWizardProps) {
  const [submitError, setSubmitError] = React.useState<string | boolean>(
    'There has been an error creating the cluster'
  );
  return (
    <RosaWizard
      {...props}
      onSubmitError={submitError}
      onBackToReviewStep={() => setSubmitError(false)}
    />
  );
}
