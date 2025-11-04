import { Wizard, WizardStep } from '@patternfly/react-core';
import { StepId, StepName } from './constants';

export type NxtcmWizardProp = {
  navigate: (url: string) => void;
};

export const NxtcmWizard: React.FC<NxtcmWizardProp> = ({ navigate }) => {
  const onClose = () => navigate('/create/cloud');
  return (
    <Wizard id="nxtcm-wizard" onClose={onClose}>
      <WizardStep name={StepName.BillingModel} id={StepId.BillingModel}></WizardStep>
    </Wizard>
  );
};
