import { createContext, useContext } from 'react';
export const defaultStrings = {
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
export const StringContext = createContext(defaultStrings);
StringContext.displayName = 'StringContext';
export function useStringContext() {
    return useContext(StringContext);
}
//# sourceMappingURL=StringContext.js.map