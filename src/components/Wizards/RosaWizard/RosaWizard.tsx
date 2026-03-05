import {
  ExpandableStep,
  Step,
  WizardCancel,
  WizardPage,
  WizardSubmit,
} from '@patternfly-labs/react-form-wizard';
import { ClusterUpdatesSubstep, EncryptionSubstep } from './Steps/AdditionalSetupStep';
import { RosaWizardSubmitError } from './RosaWizardSubmitError';
import {
  DetailsSubStep,
  NetworkingAndSubnetsSubStep,
  RolesAndPoliciesSubStep,
} from './Steps/BasicSetupStep';
import React from 'react';
import { ClusterWideProxySubstep } from './Steps/AdditionalSetupStep/ClusterWideProxySubstep/ClusterWideProxySubstep';
import { ReviewStepData } from './Steps/ReviewStepData';
import {
  MachineTypesDropdownType,
  OIDCConfig,
  Roles,
  SelectDropdownType,
  VPC,
  WizardCallbackFunctions,
  WizardNavigationContext,
} from '../types';
import { useTranslation } from '../../../context/TranslationContext';
import { MachinePoolsSubstep } from './Steps/BasicSetupStep/MachinePoolsSubstep/MachinePoolsSubstep';
import { YamlEditorStep } from './Steps/YamlEditorStep';

export type BasicSetupStepProps = {
  openShiftVersions: SelectDropdownType[];
  awsInfrastructureAccounts: SelectDropdownType[];
  awsBillingAccounts: SelectDropdownType[];
  vpcList: VPC[];
  regions: SelectDropdownType[];
  roles: Roles;
  oicdConfig: OIDCConfig[];
  machineTypes: MachineTypesDropdownType[];
};

export type WizardStepsData = {
  basicSetupStep: BasicSetupStepProps;
  callbackFunctions?: WizardCallbackFunctions;
};

type RosaWizardProps = {
  onSubmit: WizardSubmit;
  onSubmitError?: string | boolean;
  onCancel: WizardCancel;
  title: string;
  wizardsStepsData: WizardStepsData;
  /** Called when "Back to review step" is clicked so the parent can clear its error state. When this promise resolves, the wizard navigates to the review step. */
  onBackToReviewStep?: () => void | Promise<void>;
};

export const RosaWizard = (props: RosaWizardProps) => {
  const { t } = useTranslation();
  const { onSubmit, onCancel, title, wizardsStepsData, onSubmitError, onBackToReviewStep } = props;
  const [isClusterWideProxySelected, setIsClusterWideProxySelected] =
    React.useState<boolean>(false);

  const [resumeAtStepId, setResumeAtStepId] = React.useState<string | null>(null);
  const [isNavigatingToReview, setIsNavigatingToReview] = React.useState(false);

  const [getUseWizardContext, setUseWizardContext] = React.useState<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    WizardNavigationContext | undefined
  >();

  const callbackFunctions = wizardsStepsData.callbackFunctions;

  const hasSubmitError = !!onSubmitError;

  const onBackToReviewClick = React.useCallback(async () => {
    setIsNavigatingToReview(true);
    try {
      await onBackToReviewStep?.();
      setResumeAtStepId('review-step');
    } finally {
      setIsNavigatingToReview(false);
    }
  }, [onBackToReviewStep]);

  const defaultClusterData = {
    cluster: {
      encryption_keys: 'default',
      etcd_encryption: false,
      configure_proxy: false,
      cidr_default: true,
      network_machine_cidr: '10.0.0.0/16',
      network_service_cidr: '172.30.0.0/16',
      network_pod_cidr: '10.128.0.0/14',
      network_host_prefix: '/23',
      autoscaling: false,
      nodes_compute: 2,
      upgrade_policy: 'automatic',
      cluster_privacy: 'external',
      compute_root_volume: 300,
    },
  };

  return (
    <>
      {hasSubmitError && (
        <RosaWizardSubmitError
          onSubmitError={onSubmitError}
          onBackToReviewStep={onBackToReviewStep ? onBackToReviewClick : undefined}
          isNavigatingToReview={isNavigatingToReview}
          onCancel={() => onCancel()}
        />
      )}
      <div style={{ display: hasSubmitError ? 'none' : undefined }}>
        <WizardPage
          onSubmit={onSubmit}
          onCancel={() => onCancel()}
          title={title}
          defaultData={defaultClusterData}
          setUseWizardContext={setUseWizardContext}
          resumeAtStepId={resumeAtStepId}
          onResumedToStep={() => setResumeAtStepId(null)}
          yaml={false}
        >
          <ExpandableStep
            id="basic-setup-step-id-expandable-section"
            label={t('Basic setup')}
            key="basic-setup-step-expandable-section-key"
            isExpandable
            steps={[
              <Step label={t('Details')} id="basic-setup-step-details" key="basic-setup-details">
                <DetailsSubStep
                  openShiftVersions={wizardsStepsData.basicSetupStep.openShiftVersions}
                  awsInfrastructureAccounts={
                    wizardsStepsData.basicSetupStep.awsInfrastructureAccounts
                  }
                  awsBillingAccounts={wizardsStepsData.basicSetupStep.awsBillingAccounts}
                  regions={wizardsStepsData.basicSetupStep.regions}
                  awsAccountDataCallback={callbackFunctions?.onAWSAccountChange}
                  refreshAwsAccountDataCallback={callbackFunctions?.refreshAwsAccountDataCallback}
                  refreshAwsBillingAccountCallback={
                    callbackFunctions?.refreshAwsBillingAccountCallback
                  }
                />
              </Step>,
              <Step
                id="roles-and-policies-sub-step"
                label={t('Roles and policies')}
                key="roles-and-policies-sub-step-key"
              >
                <RolesAndPoliciesSubStep
                  installerRoles={wizardsStepsData.basicSetupStep.roles.installerRoles}
                  supportRoles={wizardsStepsData.basicSetupStep.roles.supportRoles}
                  workerRoles={wizardsStepsData.basicSetupStep.roles.workerRoles}
                  oicdConfig={wizardsStepsData.basicSetupStep.oicdConfig}
                />
              </Step>,
              <Step
                id="machinepools-sub-step"
                label={t('Machine pools')}
                key="machinepools-sub-step-key"
              >
                <MachinePoolsSubstep
                  vpcList={wizardsStepsData.basicSetupStep.vpcList}
                  machineTypes={wizardsStepsData.basicSetupStep.machineTypes}
                />
              </Step>,
              <Step id="networking-sub-step" label={t('Networking')} key="networking-sub-step-key">
                <NetworkingAndSubnetsSubStep
                  vpcList={wizardsStepsData.basicSetupStep.vpcList}
                  setIsClusterWideProxySelected={setIsClusterWideProxySelected}
                />
              </Step>,
              ...(isClusterWideProxySelected
                ? [
                    <Step
                      id="additional-setup-cluster-wide-proxy"
                      key="additional-setup-cluster-wide-proxy-key"
                      label={t('Cluster-wide proxy')}
                    >
                      <ClusterWideProxySubstep />
                    </Step>,
                  ]
                : []),
            ]}
          />

          <ExpandableStep
            id="additional-setup-step-id-expandable-section"
            label={t('Additional setup')}
            key="additional-setup-step-expandable-section-key"
            isExpandable
            steps={[
              <Step
                id="additional-setup-encryption"
                key="additional-setup-encryption-key"
                label={t('Encryption (optional)')}
              >
                <EncryptionSubstep />
              </Step>,
              <Step
                id="additional-setup-cluster-updates"
                key="additional-setup-cluster-updates-key"
                label={t('Cluster updates (optional)')}
              >
                <ClusterUpdatesSubstep goToStepId={getUseWizardContext} />
              </Step>,
            ]}
          />
          <Step label={'YAML Editor'} id={'yaml-editor-step'}>
            <YamlEditorStep />
          </Step>
          <Step label={t('Review')} id={'review-step'}>
            <ReviewStepData goToStepId={getUseWizardContext} />
          </Step>
        </WizardPage>
      </div>
    </>
  );
};
