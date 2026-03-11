import { WizardCancel, WizardSubmit } from '@patternfly-labs/react-form-wizard';
import { RosaWizard } from './RosaWizard/RosaWizard';
import { WizardType } from './types';
import { WizardStepsData } from './RosaWizard/RosaWizard';

type WizardWrapperProps = {
  type: WizardType;
  onSubmit: WizardSubmit;
  onCancel: WizardCancel;
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
