/** Fields collected on wizard substep A. */
export type SimpleWizardStepAValues = {
  fullName: string;
  selectionA1: string;
  selectionA2: string;
  selectionA3: string;
};

export type SimpleWizardStepBValues = {
  selectionB1: string;
  selectionB2: string;
  selectionB3: string;
};

export type SimpleWizardStepCValues = {
  selectionC1: string;
  selectionC2: string;
  selectionC3: string;
};

export type SimpleWizardStepDValues = {
  selectionD1: string;
  selectionD2: string;
  selectionD3: string;
};

export type SimpleWizardStepEValues = {
  optionText1: string;
};

export type SimpleWizardStepFValues = {
  optionText2: string;
};

/** Substeps B–D and optional E–F grouped for a clear split from {@link SimpleWizardStepAValues}. */
export type SimpleWizardOptionalStepsValues = {
  stepE: SimpleWizardStepEValues;
  stepF: SimpleWizardStepFValues;
};

export type SimpleWizardRequiredStepsValues = {
  stepA: SimpleWizardStepAValues;
  stepB: SimpleWizardStepBValues;
  stepC: SimpleWizardStepCValues;
  stepD: SimpleWizardStepDValues;
};

export type SimpleWizardFormValues = {
  required: SimpleWizardRequiredStepsValues;
  optional: SimpleWizardOptionalStepsValues;
};

const emptyStepA: SimpleWizardStepAValues = {
  fullName: '',
  selectionA1: '',
  selectionA2: '',
  selectionA3: '',
};

const emptyStepB: SimpleWizardStepBValues = {
  selectionB1: '',
  selectionB2: '',
  selectionB3: '',
};

const emptyStepC: SimpleWizardStepCValues = {
  selectionC1: '',
  selectionC2: '',
  selectionC3: '',
};

const emptyStepD: SimpleWizardStepDValues = {
  selectionD1: '',
  selectionD2: '',
  selectionD3: '',
};

const emptyStepE: SimpleWizardStepEValues = {
  optionText1: '',
};

const emptyStepF: SimpleWizardStepFValues = {
  optionText2: '',
};

export const defaultSimpleWizardFormValues: SimpleWizardFormValues = {
  required: {
    stepA: emptyStepA,
    stepB: emptyStepB,
    stepC: emptyStepC,
    stepD: emptyStepD,
  },
  optional: {
    stepE: emptyStepE,
    stepF: emptyStepF,
  },
};
