import {
  Banner,
  PageSection,
  Spinner,
  Wizard,
  WizardStep,
  WizardStepChangeScope,
  WizardStepType,
} from '@patternfly/react-core';
import { StepId, StepName } from './constants';
import { BillingModelStep } from './Steps/BillingModel/BillingModelStep';

export type NxtcmWizardProp = {
    navigate: (url: string) => void;
}

export const NxtcmWizard: React.FC<NxtcmWizardProp> = ({navigate}) => {
    const onClose = () => navigate('/create/cloud');
    return(
        <Wizard
            id="nxtcm-wizard"
            onClose={onClose}
        >
            <WizardStep name={StepName.BillingModel} id={StepId.BillingModel}>
                <BillingModelStep />
            </WizardStep>
        </Wizard>
    )
}