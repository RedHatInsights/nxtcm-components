import { useState } from 'react';

import { RosaHcpWizardStringsProvider } from '../stringsProvider/RosaHcpWizardStringsContext';
import { FieldWithAPIErrorAlert } from './FieldWithAPIErrorAlert';

export interface FieldWithAPIErrorAlertStoryProps {
  error: string | boolean;
  isFetching?: boolean;
  isValidation?: boolean;
  retry?: boolean;
}

export function FieldWithAPIErrorAlertStory({
  error,
  isFetching = false,
  isValidation = false,
  retry = false,
}: FieldWithAPIErrorAlertStoryProps): React.ReactElement {
  const [retryCalls, setRetryCalls] = useState(0);
  return (
    <RosaHcpWizardStringsProvider>
      <FieldWithAPIErrorAlert
        error={error}
        isFetching={isFetching}
        fieldName="region"
        isValidation={isValidation}
        retry={retry ? () => setRetryCalls((count) => count + 1) : undefined}
      >
        <div>Field content</div>
      </FieldWithAPIErrorAlert>
      <input hidden readOnly data-testid="retry-count" value={retryCalls} />
    </RosaHcpWizardStringsProvider>
  );
}
