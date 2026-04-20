import { createContext, useContext, type ReactNode } from 'react';

/** Chrome strings for the ROSA wizard footer and shared select/input affordances (from react-form-wizard defaults). */
export type WizardFooterStrings = {
  reviewLabel: string;
  unknownError: string;
  errorString: string;
  stepsAriaLabel: string;
  contentAriaLabel: string;
  actionAriaLabel: string;
  detailsAriaLabel: string;
  sortableMoveItemUpAriaLabel: string;
  sortableMoveItemDownAriaLabel: string;
  removeItemAriaLabel: string;
  deselectAllAriaLabel: string;
  selectAllAriaLabel: string;
  clearButtonTooltip: string;
  pasteButtonTooltip: string;
  backButtonText: string;
  cancelButtonText: string;
  nextButtonText: string;
  skipToReviewButtonText: string;
  fixValidationErrorsMsg: string;
  fixEditorValidationErrorsMsg: string;
  waitforEditorValidationErrorsMsg: string;
  submitText: string;
  submittingText: string;
  moreInfo: string;
  hideSecretTooltip: string;
  showSecretTooltip: string;
  spinnerButtonTooltip: string;
  syncButtonTooltip: string;
  required: string;
  expandToFixValidationErrors: string;
  selectNoItems: string;
  selected: (count: number) => string;
  selectPageItems: (count: number) => string;
  selectAllItems: (count: number) => string;
  noResults: string;
  createOption: string;
};

export const defaultWizardFooterStrings: WizardFooterStrings = {
  reviewLabel: 'Review',
  unknownError: 'Unknown Error',
  errorString: 'error',
  stepsAriaLabel: 'steps',
  contentAriaLabel: 'content',
  actionAriaLabel: 'Action',
  detailsAriaLabel: 'Details',
  sortableMoveItemUpAriaLabel: 'Move item up',
  sortableMoveItemDownAriaLabel: 'Move item down',
  removeItemAriaLabel: 'Remove item',
  deselectAllAriaLabel: 'Deselect all',
  selectAllAriaLabel: 'Select all',
  clearButtonTooltip: 'Clear',
  pasteButtonTooltip: 'Paste',
  backButtonText: 'Back',
  cancelButtonText: 'Cancel',
  nextButtonText: 'Next',
  skipToReviewButtonText: 'Skip to review',
  fixValidationErrorsMsg: 'Please fix validation errors',
  fixEditorValidationErrorsMsg: 'Please fix editor syntax errors',
  waitforEditorValidationErrorsMsg: 'Please wait for editor syntax check',
  submitText: 'Submit',
  submittingText: 'Submitting',
  moreInfo: 'More info',
  hideSecretTooltip: 'Hide secret',
  showSecretTooltip: 'Show secret',
  spinnerButtonTooltip: 'Loading',
  syncButtonTooltip: 'Refresh',
  required: 'Required',
  expandToFixValidationErrors: 'Expand to fix validation errors',
  selectNoItems: 'Select none (0 items)',
  selected: (count) => `${count} selected`,
  selectPageItems: (count) => `Select page (${count} items)`,
  selectAllItems: (count) => `Select all (${count} items)`,
  noResults: 'No results found',
  createOption: 'Create new option',
};

const WizardFooterStringsContext = createContext<WizardFooterStrings>(defaultWizardFooterStrings);
WizardFooterStringsContext.displayName = 'WizardFooterStringsContext';

export function WizardFooterStringsProvider({
  value,
  children,
}: {
  value: WizardFooterStrings;
  children: ReactNode;
}) {
  return (
    <WizardFooterStringsContext.Provider value={value}>{children}</WizardFooterStringsContext.Provider>
  );
}

export function useWizardFooterStrings(): WizardFooterStrings {
  return useContext(WizardFooterStringsContext);
}
