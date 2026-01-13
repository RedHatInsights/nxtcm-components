import { WizardCancel, WizardSubmit } from '@patternfly-labs/react-form-wizard';
import { RosaWizard } from './RosaWizard/RosaWizard';
import { RosaWizardWithYamlEditor } from './RosaWizard/RosaWizardWithYamlEditor';

type WizardWrapperProps = {
  type: string;
  onSubmit: WizardSubmit;
  onCancel: WizardCancel;
  title: string;
  defaultData: any;
  stepProps: any;
  wizardsStepsData: any;
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
    case 'rosa-yaml-editor':
      return (
        <RosaWizardWithYamlEditor
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
