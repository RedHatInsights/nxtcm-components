import {
  ExpandableStep,
  Step,
  useItem,
  WizardCancel,
  WizardPage,
  WizardSubmit,
} from "@patternfly-labs/react-form-wizard";
import { ClusterUpdatesSubstep, NetworkingOptionalSubstep, EncryptionSubstep } from "./Steps/AdditionalSetupStep";
import { DetailsSubStep, NetworkingAndSubnetsSubStep, RolesAndPoliciesSubStep } from "./Steps/BasicSetupStep";
import { InputCommonProps, useInput } from "@patternfly-labs/react-form-wizard/inputs/Input";

export type BasicSetupStepProps = {
  openShiftVersions: any;
  awsInfrastructureAccounts: any;
  awsBillingAccounts: any;
  publicSubnets: any;
  privateSubnets: any;
  vpcList: any;
  region: any;
};

type WizardStepsData = {
  basicSetupStep: BasicSetupStepProps;
};

type RosaWizardProps = InputCommonProps & {
  onSubmit: WizardSubmit;
  onCancel: WizardCancel;
  title: string;
  wizardsStepsData: WizardStepsData;
};

export const RosaWizard = (props: any) => {
  const {onSubmit, onCancel, title, wizardsStepsData} = props;
  const {value} = useInput(props);
const data = useItem();
  console.log("WIZARD VALUE", data)

  return (
    <WizardPage
      onSubmit={onSubmit}
      onCancel={() => onCancel()}
      title={title}
      defaultData={{}}
    >
      <ExpandableStep
        id="basic-setup-step-id-expandable-section"
        label="Basic setup"
        key="basic-setup-step-expandable-section-key"
        isExpandable
        steps={[
          <Step
            label="Details"
            id="basic-setup-step-details"
            key="basic-setup-details"
          >
            <DetailsSubStep
              openShiftVersions={
                wizardsStepsData.basicSetupStep.openShiftVersions
              }
              awsInfrastructureAccounts={
                wizardsStepsData.basicSetupStep.awsInfrastructureAccounts
              }
              awsBillingAccounts={
                wizardsStepsData.basicSetupStep.awsBillingAccounts
              }
            />
          </Step>,
          <Step
            id="roles-and-policies-sub-step"
            label="Roles and policies"
            key="roles-and-policies-sub-step-key"
          >
            <RolesAndPoliciesSubStep
              installerRoles={
                wizardsStepsData.basicSetupStep.awsBillingAccounts
              }
              supportRoles={wizardsStepsData.basicSetupStep.awsBillingAccounts}
              workerRoles={wizardsStepsData.basicSetupStep.awsBillingAccounts}
            />
          </Step>,
          <Step
            id="networking-sub-step"
            label="Networking"
            key="networking-sub-step-key"
          >
            <NetworkingAndSubnetsSubStep
              vpcList={wizardsStepsData.basicSetupStep.vpcList}
              publicSubnets={wizardsStepsData.basicSetupStep.publicSubnets}
              privateSubnets={wizardsStepsData.basicSetupStep.privateSubnets}
            />
          </Step>,
        ]}
      />

      <ExpandableStep id="additional-setup-step-id-expandable-section"
        label="Additional setup"
        key="additional-setup-step-expandable-section-key"
        isExpandable
        steps={[
          <Step id="additional-setup-encryption" key="additional-setup-encryption-key" label="Encryption (optional)">
            <EncryptionSubstep />
          </Step>,
          <Step id="additional-setup-networking" key="additional-setup-networking-key" label="Networking (optional)">
            <NetworkingOptionalSubstep />
          </Step>,
          <Step id="additional-setup-cluster-updates" key="additional-setup-cluster-updates-key" label="Cluster updates (optional)">
            <ClusterUpdatesSubstep />
          </Step>
        ]}
      />

    </WizardPage>
  );
};
