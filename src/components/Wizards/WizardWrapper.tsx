import { RosaWizard } from './RosaWizard/RosaWizard';
import { RosaWizardFormData, WizardType } from './types';
import { WizardStepsData } from './RosaWizard/RosaWizard';

type WizardWrapperProps = {
  type: WizardType;
  onSubmit: (data: RosaWizardFormData) => Promise<void>;
  onCancel: () => void;
  title: string;
  wizardsStepsData: WizardStepsData;
};

export const WizardWrapper: React.FunctionComponent<WizardWrapperProps> = (props) => {
  switch (props.type) {
    case 'rosa-hcp':
      return (
        <RosaWizard
          wizardsStepsData={props.wizardsStepsData}
          onSubmit={props.onSubmit}
          onCancel={props.onCancel}
          title={props.title}
        />
      );
    default:
      return null;
  }
};
