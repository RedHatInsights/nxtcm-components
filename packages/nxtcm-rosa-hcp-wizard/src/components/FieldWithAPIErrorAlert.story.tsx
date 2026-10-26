import { RosaHcpWizardStringsProvider } from '../stringsProvider/RosaHcpWizardStringsContext';
import { FieldWithAPIErrorAlert } from './FieldWithAPIErrorAlert';

export interface FieldWithAPIErrorAlertStoryProps {
  error: string | boolean;
  isFetching?: boolean;
  isValidation?: boolean;
}

export function FieldWithAPIErrorAlertStory({
  error,
  isFetching = false,
  isValidation = false,
}: FieldWithAPIErrorAlertStoryProps): React.ReactElement {
  return (
    <RosaHcpWizardStringsProvider>
      <FieldWithAPIErrorAlert
        error={error}
        isFetching={isFetching}
        fieldName="region"
        isValidation={isValidation}
      >
        <div>Field content</div>
      </FieldWithAPIErrorAlert>
    </RosaHcpWizardStringsProvider>
  );
}
