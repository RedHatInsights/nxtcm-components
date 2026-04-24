import { Wizard, WizardStep } from '@patternfly/react-core';
import ReviewStep from './Steps/ReviewStep';
import { StepA } from './Steps/Required/StepA';
import { StepB } from './Steps/Required/StepB';
import { StepC } from './Steps/Required/StepC';
import { StepD } from './Steps/Required/StepD';
import { StepE } from './Steps/Optional/StepE';
import { StepF } from './Steps/Optional/StepF';

export type WizardExpandableStepsProps = {};

export const WizardExpandableSteps = () => {
  return (
    <Wizard
      isVisitRequired={true}
      height={400}
      title="Expandable steps wizard"
      nav={{ isExpanded: true }}
      onSave={() => {}}
    >
      <WizardStep
        name="Required"
        id="required-steps"
        isExpandable
        steps={[
          <WizardStep name="Substep A" id="expand-steps-sub-a" key="expand-steps-sub-a">
            <StepA />
          </WizardStep>,
          <WizardStep name="Substep B" id="expand-steps-sub-b" key="expand-steps-sub-b">
            <StepB />
          </WizardStep>,
          <WizardStep name="Substep C" id="expand-steps-sub-c" key="expand-steps-sub-c">
            <StepC />
          </WizardStep>,
          <WizardStep name="Substep D" id="expand-steps-sub-d" key="expand-steps-sub-d">
            <StepD />
          </WizardStep>,
        ]}
      />
      <WizardStep
        id="optional-steps"
        isExpandable
        name="Optional"
        steps={[
          <WizardStep id="expand-steps-sub-e" key="expand-steps-sub-e" name="Substep E">
            <StepE />
          </WizardStep>,
          <WizardStep id="expand-steps-sub-f" key="expand-steps-sub-f" name="Substep F">
            <StepF />
          </WizardStep>,
        ]}
      />

      <WizardStep name="Review" id="review-step" footer={{ nextButtonText: 'Submit' }}>
        <ReviewStep />
      </WizardStep>
    </Wizard>
  );
};
