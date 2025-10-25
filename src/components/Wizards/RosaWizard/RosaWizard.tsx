import { Step, WizardCancel, WizardPage, WizardSubmit } from '@patternfly-labs/react-form-wizard';
import { stepId, stepName } from './constants';
import { ControlPlaneStep } from './Steps/ControlPlane/ControlPlaneStep';
type ClassNameProps = Record<string, never>;

type ControlPlaneProps = {
  classNames: ClassNameProps;
  AwsControlPlaneLink: React.ReactNode;
  allowAlertFeatureFlag: boolean;
  rosaArchitectureRenaimingAlertLink: React.ReactNode;
  showRosaCliRequirement: boolean;
  rosaHostedCliMinVersion: string;
  productName: string;
  virtualPrivateCloudLink: React.ReactNode;
  isTileSelected: string;
  handleChange: () => void;
  isHCPDisabled: boolean;
  linkToGetStarted: React.ReactNode;
  rosaHomeGetStartedLink: React.ReactNode;
  hasHostedProductQuota: boolean;
};

type StepsProps = {
  constrolPlane: ControlPlaneProps;
};

type RosaWizardProps = {
  onSubmit: WizardSubmit;
  onCancel: WizardCancel;
  history: any;
  title: string;
  stepsProps: StepsProps;
  defaultData: any;
};

export const RosaWizard = ({
  onSubmit,
  onCancel,
  history: _history,
  title,
  stepsProps,
  defaultData,
}: RosaWizardProps) => {
  return (
    <WizardPage
      onSubmit={onSubmit}
      onCancel={() => onCancel()}
      title={title}
      defaultData={defaultData}
    >
      <Step id={stepId.CONTROL_PLANE} label={stepName.CONTROL_PLANE}>
        <ControlPlaneStep controlPlaneStepProps={stepsProps.constrolPlane} />
      </Step>
    </WizardPage>
  );
};
