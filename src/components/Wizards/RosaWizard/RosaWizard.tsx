import { ClusterUpdatesSubstep, EncryptionSubstep } from './Steps/AdditionalSetupStep';
import { RosaWizardSubmitError } from './RosaWizardSubmitError';
import {
  DetailsSubStep,
  NetworkingAndSubnetsSubStep,
  RolesAndPoliciesSubStep,
} from './Steps/BasicSetupStep';
import React, { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ClusterWideProxySubstep } from './Steps/AdditionalSetupStep/ClusterWideProxySubstep/ClusterWideProxySubstep';
import { ReviewStepData } from './Steps/ReviewStepData';
import {
  OIDCConfig,
  OpenShiftVersionsData,
  Role,
  Resource,
  SecurityGroup,
  SelectDropdownType,
  Subnet,
  ValidationResource,
  VPC,
  WizardNavigationContext,
  MachineTypesDropdownType,
  Region,
  type RosaWizardFormData,
} from '../types';
import { MachinePoolsSubstep } from './Steps/BasicSetupStep/MachinePoolsSubstep/MachinePoolsSubstep';
import { YamlDrawerEditor } from './Steps/YamlCodeEditor';
import { RosaWizardStringsProvider, useRosaWizardStrings } from './RosaWizardStringsContext';
import { buildWizardStringsForRosa, type RosaWizardStringsInput } from './rosaWizardStrings';
import { RosaExpandableStep, RosaStep } from './Inputs';
import { createDefaultRosaWizardFormValues } from './rosaWizardDefaultFormData';
import { RosaWizardShell, type RosaWizardCancel, type RosaWizardSubmitHandler } from './RosaWizardShell';
import { WizardFooterStringsProvider } from './wizardFooterStrings';

export type BasicSetupStepProps = {
  clusterNameValidation: ValidationResource;
  checkClusterNameUniqueness?: (name: string, region?: string) => void;
  userRole: ValidationResource;

  versions: Resource<OpenShiftVersionsData, []> & { fetch: () => Promise<void> };
  awsInfrastructureAccounts: Resource<SelectDropdownType[]>;
  awsBillingAccounts: Resource<SelectDropdownType[]>;
  regions: Resource<Region[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  roles: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  oidcConfig: Resource<OIDCConfig[]>;
  vpcList: Resource<VPC[]>;
  subnets: Resource<Subnet[]>;
  securityGroups: Resource<SecurityGroup[]>;
  machineTypes: Resource<MachineTypesDropdownType[]>;
};

export type WizardStepsData = {
  basicSetupStep: BasicSetupStepProps;
};

export type { RosaWizardCancel, RosaWizardSubmitHandler };

type RosaWizardProps = {
  onSubmit: RosaWizardSubmitHandler;
  onSubmitError?: string | boolean;
  onCancel: RosaWizardCancel;
  title: string;
  wizardsStepsData: WizardStepsData;
  onBackToReviewStep?: () => void | Promise<void>;
  yamlEditor?: () => ReactNode;
  yaml?: boolean;
  strings?: RosaWizardStringsInput;
};

function getDefaultYamlEditor() {
  return <YamlDrawerEditor />;
}

const STEP_IDS = {
  BASIC_SETUP: 'basic-setup-step-id-expandable-section',
  DETAILS: 'basic-setup-step-details',
  MACHINE_POOLS: 'machinepools-sub-step',
  NETWORKING: 'networking-sub-step',
  ADDITIONAL_SETUP: 'additional-setup-step-id-expandable-section',
  CLUSTER_WIDE_PROXY: 'additional-setup-cluster-wide-proxy',
  ENCRYPTION: 'additional-setup-encryption',
  CLUSTER_UPDATES: 'additional-setup-cluster-updates',
  REVIEW: 'review-step',
} as const;

export const RosaWizard = (props: RosaWizardProps) => (
  <RosaWizardStringsProvider strings={props.strings}>
    <RosaWizardBody {...props} />
  </RosaWizardStringsProvider>
);

const RosaWizardBody = (props: RosaWizardProps) => {
  const {
    onSubmit,
    onCancel,
    title,
    wizardsStepsData,
    onSubmitError,
    onBackToReviewStep,
    yaml,
    strings,
  } = props;
  const rosaStrings = useRosaWizardStrings();
  const { wizard } = rosaStrings;
  const sl = wizard.stepLabels;
  const yamlEditor = yaml ? (props.yamlEditor ?? getDefaultYamlEditor) : undefined;
  const wizardStrings = React.useMemo(
    () => buildWizardStringsForRosa(rosaStrings, strings?.formWizard),
    [rosaStrings, strings?.formWizard]
  );

  const form = useForm<RosaWizardFormData>({
    defaultValues: createDefaultRosaWizardFormValues(),
    mode: 'onChange',
    shouldUnregister: false,
  });

  const [isClusterWideProxySelected, setIsClusterWideProxySelected] = React.useState<boolean>(false);
  const skipToReviewStepIds = React.useMemo(
    () => [
      ...(isClusterWideProxySelected ? [STEP_IDS.CLUSTER_WIDE_PROXY] : []),
      STEP_IDS.ENCRYPTION,
      STEP_IDS.CLUSTER_UPDATES,
    ],
    [isClusterWideProxySelected]
  );

  const [resumeAtStepId, setResumeAtStepId] = React.useState<string | null>(null);
  const [isNavigatingToReview, setIsNavigatingToReview] = React.useState(false);

  const [getUseWizardContext, setUseWizardContext] = React.useState<
    WizardNavigationContext | undefined
  >();

  const { basicSetupStep } = wizardsStepsData;

  const hasSubmitError = !!onSubmitError;

  const onBackToReviewClick = React.useCallback(async () => {
    setIsNavigatingToReview(true);
    if (onBackToReviewStep) {
      await onBackToReviewStep();
      setResumeAtStepId(STEP_IDS.REVIEW);
    }

    setIsNavigatingToReview(false);
  }, [onBackToReviewStep]);

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
        <FormProvider {...form}>
          <WizardFooterStringsProvider value={wizardStrings}>
            <RosaWizardShell
              onSubmit={onSubmit}
              onCancel={() => onCancel()}
              title={title}
              skipToReviewStepIds={skipToReviewStepIds}
              resumeAtStepId={resumeAtStepId}
              onResumedToStep={() => setResumeAtStepId(null)}
              yaml={yaml}
              yamlEditor={yamlEditor}
              setUseWizardContext={setUseWizardContext}
            >
              <RosaExpandableStep
                id={STEP_IDS.BASIC_SETUP}
                label={sl.basicSetup}
                key="basic-setup-step-expandable-section-key"
                isExpandable
                steps={[
                  <RosaStep label={sl.details} id={STEP_IDS.DETAILS} key="basic-setup-details">
                    <DetailsSubStep
                      clusterNameValidation={basicSetupStep.clusterNameValidation}
                      versions={basicSetupStep.versions}
                      machineTypes={basicSetupStep.machineTypes}
                      checkClusterNameUniqueness={basicSetupStep.checkClusterNameUniqueness}
                      roles={basicSetupStep.roles}
                      awsInfrastructureAccounts={basicSetupStep.awsInfrastructureAccounts}
                      awsBillingAccounts={basicSetupStep.awsBillingAccounts}
                      regions={basicSetupStep.regions}
                    />
                  </RosaStep>,
                  <RosaStep
                    id="roles-and-policies-sub-step"
                    label={sl.rolesAndPolicies}
                    key="roles-and-policies-sub-step-key"
                  >
                    <RolesAndPoliciesSubStep
                      roles={basicSetupStep.roles}
                      oidcConfig={basicSetupStep.oidcConfig}
                    />
                  </RosaStep>,
                  <RosaStep
                    id={STEP_IDS.MACHINE_POOLS}
                    label={sl.machinePools}
                    key="machinepools-sub-step-key"
                  >
                    <MachinePoolsSubstep
                      vpcList={basicSetupStep.vpcList}
                      machineTypes={basicSetupStep.machineTypes}
                    />
                  </RosaStep>,
                  <RosaStep id={STEP_IDS.NETWORKING} label={sl.networking} key="networking-sub-step-key">
                    <NetworkingAndSubnetsSubStep
                      vpcList={basicSetupStep.vpcList}
                      setIsClusterWideProxySelected={setIsClusterWideProxySelected}
                    />
                  </RosaStep>,
                  ...(isClusterWideProxySelected
                    ? [
                        <RosaStep
                          id={STEP_IDS.CLUSTER_WIDE_PROXY}
                          key="additional-setup-cluster-wide-proxy-key"
                          label={sl.clusterWideProxy}
                        >
                          <ClusterWideProxySubstep />
                        </RosaStep>,
                      ]
                    : []),
                ]}
              />

              <RosaExpandableStep
                id={STEP_IDS.ADDITIONAL_SETUP}
                label={sl.additionalSetup}
                key="additional-setup-step-expandable-section-key"
                isExpandable
                steps={[
                  <RosaStep
                    id={STEP_IDS.ENCRYPTION}
                    key="additional-setup-encryption-key"
                    label={sl.encryptionOptional}
                  >
                    <EncryptionSubstep />
                  </RosaStep>,
                  <RosaStep
                    id={STEP_IDS.CLUSTER_UPDATES}
                    key="additional-setup-cluster-updates-key"
                    label={sl.clusterUpdatesOptional}
                  >
                    <ClusterUpdatesSubstep goToStepId={getUseWizardContext} />
                  </RosaStep>,
                ]}
              />
              <RosaStep label={sl.review} id={STEP_IDS.REVIEW}>
                <ReviewStepData goToStepId={getUseWizardContext} />
              </RosaStep>
            </RosaWizardShell>
          </WizardFooterStringsProvider>
        </FormProvider>
      </div>
    </>
  );
};
