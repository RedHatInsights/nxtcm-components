import {
  ExpandableStep,
  Step,
  WizardCancel,
  WizardPage,
  WizardSubmit,
} from '@patternfly-labs/react-form-wizard';
import {
  ClusterUpdatesSubstep,
  NetworkingOptionalSubstep,
  EncryptionSubstep,
} from './Steps/AdditionalSetupStep';
import {
  DetailsSubStep,
  NetworkingAndSubnetsSubStep,
  RolesAndPoliciesSubStep,
} from './Steps/BasicSetupStep';
import { InputCommonProps } from '@patternfly-labs/react-form-wizard/inputs/Input';
import React from 'react';
import { ClusterWideProxySubstep } from './Steps/AdditionalSetupStep/ClusterWideProxySubstep/ClusterWideProxySubstep';
import { ReviewStepData } from './Steps/ReviewStepData';
import { MachineTypesDropdownType, OIDCConfig, Roles, SelectDropdownType, VPC } from '../types';
import { WizardStepType } from '@patternfly/react-core';

export type BasicSetupStepProps = {
  openShiftVersions: SelectDropdownType[];
  awsInfrastructureAccounts: SelectDropdownType[];
  awsBillingAccounts: SelectDropdownType[];
  publicSubnets: SelectDropdownType[];
  privateSubnets: SelectDropdownType[];
  vpcList: VPC[];
  regions: SelectDropdownType[];
  roles: Roles;
  oicdConfig: OIDCConfig[];
  machineTypes: MachineTypesDropdownType[];
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
  const { onSubmit, onCancel, title, wizardsStepsData } = props;
  const [isClusterWideProxySelected, setIsClusterWideProxySelected] =
    React.useState<boolean>(false);
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const onStepChange = (_event: React.MouseEvent<HTMLButtonElement>, currentStep: WizardStepType) =>
    setCurrentStep(currentStep);
  const [getUseWizardContext, setUseWizardContext] = React.useState();

  return (
    <WizardPage
      onSubmit={onSubmit}
      onCancel={() => onCancel()}
      title={title}
      defaultData={{}}
      setUseWizardContext={setUseWizardContext}
      onStepChange={onStepChange}
    >
      <ExpandableStep
        id="basic-setup-step-id-expandable-section"
        label="Basic setup"
        key="basic-setup-step-expandable-section-key"
        isExpandable
        steps={[
          <Step label="Details" id="basic-setup-step-details" key="basic-setup-details">
            <DetailsSubStep
              openShiftVersions={wizardsStepsData.basicSetupStep.openShiftVersions}
              awsInfrastructureAccounts={wizardsStepsData.basicSetupStep.awsInfrastructureAccounts}
              awsBillingAccounts={wizardsStepsData.basicSetupStep.awsBillingAccounts}
              regions={wizardsStepsData.basicSetupStep.regions}
            />
          </Step>,
          <Step
            id="roles-and-policies-sub-step"
            label="Roles and policies"
            key="roles-and-policies-sub-step-key"
          >
            <RolesAndPoliciesSubStep
              installerRoles={wizardsStepsData.basicSetupStep.roles.installerRoles}
              supportRoles={wizardsStepsData.basicSetupStep.roles.supportRoles}
              workerRoles={wizardsStepsData.basicSetupStep.roles.workerRoles}
              oicdConfig={wizardsStepsData.basicSetupStep.oicdConfig}
            />
          </Step>,
          <Step id="networking-sub-step" label="Networking" key="networking-sub-step-key">
            <NetworkingAndSubnetsSubStep
              machineTypes={wizardsStepsData.basicSetupStep.machineTypes}
              vpcList={wizardsStepsData.basicSetupStep.vpcList}
              publicSubnets={wizardsStepsData.basicSetupStep.publicSubnets}
              privateSubnets={wizardsStepsData.basicSetupStep.privateSubnets}
            />
          </Step>,
        ]}
      />

      <ExpandableStep
        id="additional-setup-step-id-expandable-section"
        label="Additional setup"
        key="additional-setup-step-expandable-section-key"
        isExpandable
        steps={[
          <Step
            id="additional-setup-encryption"
            key="additional-setup-encryption-key"
            label="Encryption (optional)"
          >
            <EncryptionSubstep />
          </Step>,
          <Step
            id="additional-setup-networking"
            key="additional-setup-networking-key"
            label="Networking (optional)"
          >
            <NetworkingOptionalSubstep
              setIsClusterWideProxySelected={setIsClusterWideProxySelected}
            />
          </Step>,
          ...(isClusterWideProxySelected
            ? [
                <Step
                  id="additional-setup-cluster-wide-proxy"
                  key="additional-setup-cluster-wide-proxy-key"
                  label="Cluster-wide proxy"
                >
                  <ClusterWideProxySubstep />
                </Step>,
              ]
            : []),
          <Step
            id="additional-setup-cluster-updates"
            key="additional-setup-cluster-updates-key"
            label="Cluster updates (optional)"
          >
            <ClusterUpdatesSubstep />
          </Step>,
        ]}
      />

      <Step label={'Review'} id={'review-step-id'}>
        <ReviewStepData goToStepId={getUseWizardContext} />
      </Step>
    </WizardPage>
  );
};
