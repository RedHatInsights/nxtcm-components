import React, { type ReactNode } from 'react';
import {
  Alert,
  Wizard,
  WizardHeader,
  WizardStep,
  WizardFooterWrapper,
  Button,
  useWizardContext,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useStore } from '@tanstack/react-form';

import { ClusterUpdatesSubstep, EncryptionSubstep } from './Steps/AdditionalSetupStep';
import { RosaWizardSubmitError } from './RosaWizardSubmitError';
import {
  DetailsSubStep,
  NetworkingAndSubnetsSubStep,
  RolesAndPoliciesSubStep,
} from './Steps/BasicSetupStep';
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
  MachineTypesDropdownType,
  Region,
  ClusterNetwork,
  ClusterUpgrade,
  ClusterEncryptionKeys,
  type RosaWizardFormData,
} from '../types';
import { MachinePoolsSubstep } from './Steps/BasicSetupStep/MachinePoolsSubstep/MachinePoolsSubstep';
import { RosaWizardStringsProvider, useRosaWizardStrings } from './RosaWizardStringsContext';
import { type RosaWizardStringsInput } from './rosaWizardStrings';
import { useAppForm, useRosaForm } from './RosaFormContext';
import { YamlDrawerEditor } from './Steps/YamlCodeEditor';

/**
 * Subscribes to TanStack Form derived state and returns true when any
 * registered field has validation errors. Uses `isFieldsValid` which is
 * computed from each field's `meta.errors`.
 */
function useFormHasErrors(): boolean {
  const form = useRosaForm();
  return useStore(form.store, (s) => !s.isFieldsValid);
}

/** Props and async resources passed into the Basic Setup wizard step (details, roles, pools, networking). */
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

/** Per-step data passed into the wizard; currently supplies configuration for the basic setup branch. */
export type WizardStepsData = {
  basicSetupStep: BasicSetupStepProps;
};

/**
 * Callback invoked when the wizard review step is submitted.
 *
 * The `data` object is the live TanStack Form state — optional
 * {@link ClusterFormData} fields may be present with value `undefined`
 * (not absent). See {@link RosaWizardFormData} for details.
 */
export type RosaWizardSubmitFn = (data: RosaWizardFormData) => Promise<void>;

/** Top-level props for the ROSA cluster creation wizard (submit handlers, copy, step data, optional YAML). */
type RosaWizardProps = {
  onSubmit: RosaWizardSubmitFn;
  onSubmitError?: string | boolean;
  onCancel: () => void;
  title: string;
  wizardsStepsData: WizardStepsData;
  onBackToReviewStep?: () => void | Promise<void>;
  yamlEditor?: () => ReactNode;
  yaml?: boolean;
  strings?: RosaWizardStringsInput;
};

/** Stable PatternFly Wizard step IDs used for navigation (e.g. skip to review, resume after error). */
const STEP_IDS = {
  BASIC_SETUP: 'basic-setup-step-id-expandable-section',
  DETAILS: 'basic-setup-step-details',
  ROLES_AND_POLICIES: 'roles-and-policies-sub-step',
  MACHINE_POOLS: 'machinepools-sub-step',
  NETWORKING: 'networking-sub-step',
  ADDITIONAL_SETUP: 'additional-setup-step-id-expandable-section',
  CLUSTER_WIDE_PROXY: 'additional-setup-cluster-wide-proxy',
  ENCRYPTION: 'additional-setup-encryption',
  CLUSTER_UPDATES: 'additional-setup-cluster-updates',
  REVIEW: 'review-step',
} as const;

/**
 * ROSA cluster wizard: wraps content with string overrides and renders the full multi-step flow.
 */
export const RosaWizard = (props: RosaWizardProps): JSX.Element => (
  <RosaWizardStringsProvider strings={props.strings}>
    <RosaWizardBody {...props} />
  </RosaWizardStringsProvider>
);

/** Initial TanStack Form values for a new cluster before the user edits any fields. */
const DEFAULT_CLUSTER_DATA: RosaWizardFormData = {
  cluster: {
    name: undefined,
    cluster_version: undefined,
    associated_aws_id: '',
    billing_account_id: undefined,
    region: undefined,
    installer_role_arn: undefined,
    support_role_arn: undefined,
    worker_role_arn: undefined,
    byo_oidc_config_id: '',
    custom_operator_roles_prefix: '',
    encryption_keys: ClusterEncryptionKeys.default,
    etcd_encryption: false,
    configure_proxy: false,
    cidr_default: true,
    network_machine_cidr: '10.0.0.0/16',
    network_service_cidr: '172.30.0.0/16',
    network_pod_cidr: '10.128.0.0/14',
    network_host_prefix: '/23',
    autoscaling: false,
    nodes_compute: 2,
    upgrade_policy: ClusterUpgrade.automatic,
    cluster_privacy: ClusterNetwork.external,
    compute_root_volume: 300,
  },
};

/** Custom footer for the review (final) step that shows a Submit button instead of Next */
function ReviewStepFooter({ onSubmit }: { onSubmit: () => void }): JSX.Element {
  const { goToPrevStep, close } = useWizardContext();
  const {
    wizard: { chrome },
  } = useRosaWizardStrings();
  return (
    <WizardFooterWrapper>
      <Button variant="primary" onClick={onSubmit}>
        {chrome.submitButtonText}
      </Button>
      <Button variant="secondary" onClick={() => void goToPrevStep()}>
        {chrome.backButtonText}
      </Button>
      <Button variant="link" onClick={close}>
        {chrome.cancelButtonText}
      </Button>
    </WizardFooterWrapper>
  );
}

/**
 * Validation-aware standard footer. Validates all form fields on click; if any
 * errors exist, the Next button is disabled and an inline alert is shown.
 */
function ValidatedStepFooter(): JSX.Element {
  const { goToNextStep, goToPrevStep, close } = useWizardContext();
  const {
    wizard: { chrome },
  } = useRosaWizardStrings();
  const form = useRosaForm();
  const hasErrors = useFormHasErrors();
  const [attempted, setAttempted] = React.useState(false);

  const handleNext = React.useCallback(async () => {
    await form.validateAllFields('change');
    await form.validateAllFields('blur');
    setAttempted(true);
    if (form.state.isFieldsValid) {
      void goToNextStep();
    }
  }, [form, goToNextStep]);

  return (
    <WizardFooterWrapper>
      {attempted && hasErrors && (
        <Alert variant="danger" isInline isPlain title={chrome.validationErrorText} />
      )}
      <Button variant="primary" onClick={() => void handleNext()} isDisabled={hasErrors}>
        {chrome.nextButtonText}
      </Button>
      <Button variant="secondary" onClick={() => void goToPrevStep()}>
        {chrome.backButtonText}
      </Button>
      <Button variant="link" onClick={close}>
        {chrome.cancelButtonText}
      </Button>
    </WizardFooterWrapper>
  );
}

/**
 * Footer for the last required substep. Shows both "Next" (to proceed into
 * optional steps) and "Skip to review" (to jump straight to Review).
 * Both buttons validate all mounted fields before navigating.
 */
function LastRequiredStepFooter(): JSX.Element {
  const { goToNextStep, goToPrevStep, goToStepById, close } = useWizardContext();
  const {
    wizard: { chrome },
  } = useRosaWizardStrings();
  const form = useRosaForm();
  const hasErrors = useFormHasErrors();
  const [attempted, setAttempted] = React.useState(false);

  const validate = React.useCallback(async (): Promise<boolean> => {
    await form.validateAllFields('change');
    await form.validateAllFields('blur');
    setAttempted(true);
    return form.state.isFieldsValid;
  }, [form]);

  const handleNext = React.useCallback(async () => {
    if (await validate()) void goToNextStep();
  }, [validate, goToNextStep]);

  const handleSkip = React.useCallback(async () => {
    if (await validate()) goToStepById(STEP_IDS.REVIEW);
  }, [validate, goToStepById]);

  return (
    <WizardFooterWrapper>
      {attempted && hasErrors && (
        <Alert variant="danger" isInline isPlain title={chrome.validationErrorText} />
      )}
      <Button variant="primary" onClick={() => void handleNext()} isDisabled={hasErrors}>
        {chrome.nextButtonText}
      </Button>
      <Button variant="secondary" onClick={() => void handleSkip()} isDisabled={hasErrors}>
        {chrome.skipToReviewButtonText}
      </Button>
      <Button variant="secondary" onClick={() => void goToPrevStep()}>
        {chrome.backButtonText}
      </Button>
      <Button variant="link" onClick={close}>
        {chrome.cancelButtonText}
      </Button>
    </WizardFooterWrapper>
  );
}

/**
 * Renders nothing visually — navigates the PF6 Wizard to the review step
 * when `shouldResume` flips to true (e.g. after clearing a submit error).
 */
function ResumeToReviewStep({
  shouldResume,
  onResumed,
}: {
  shouldResume: boolean;
  onResumed: () => void;
}): null {
  const { goToStepById } = useWizardContext();
  React.useEffect(() => {
    if (shouldResume) {
      goToStepById(STEP_IDS.REVIEW);
      onResumed();
    }
  }, [shouldResume, goToStepById, onResumed]);
  return null;
}

/** Returns the default YAML drawer editor element when YAML mode is enabled without a custom editor. */
function getDefaultYamlEditor(): ReactNode {
  return <YamlDrawerEditor />;
}

/**
 * Inner wizard shell: form provider, steps, optional YAML drawer, and submit-error overlay handling.
 */
const RosaWizardBody = (props: RosaWizardProps): JSX.Element => {
  const {
    onSubmit,
    onCancel,
    title,
    wizardsStepsData,
    onSubmitError,
    onBackToReviewStep,
    yaml,
    yamlEditor,
  } = props;
  const rosaStrings = useRosaWizardStrings();
  const { wizard } = rosaStrings;
  const sl = wizard.stepLabels;

  const [isClusterWideProxySelected, setIsClusterWideProxySelected] =
    React.useState<boolean>(false);
  const [isNavigatingToReview, setIsNavigatingToReview] = React.useState(false);
  const [shouldResumeToReview, setShouldResumeToReview] = React.useState(false);
  const [drawerExpanded, setDrawerExpanded] = React.useState(false);

  const resolvedYamlEditor = yaml ? (yamlEditor ?? getDefaultYamlEditor) : undefined;

  const toggleDrawer = React.useCallback(() => {
    setDrawerExpanded((prev) => !prev);
  }, []);

  const { basicSetupStep } = wizardsStepsData;

  const hasSubmitError = !!onSubmitError;

  const form = useAppForm({
    defaultValues: DEFAULT_CLUSTER_DATA,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const handleSubmit = React.useCallback(() => {
    void form.handleSubmit();
  }, [form]);

  const onBackToReviewClick = React.useCallback(async () => {
    setIsNavigatingToReview(true);
    if (onBackToReviewStep) {
      await onBackToReviewStep();
      setShouldResumeToReview(true);
    }
    setIsNavigatingToReview(false);
  }, [onBackToReviewStep]);

  const handleResumed = React.useCallback(() => setShouldResumeToReview(false), []);

  return (
    <form.AppForm>
      {hasSubmitError && (
        <RosaWizardSubmitError
          onSubmitError={onSubmitError}
          onBackToReviewStep={onBackToReviewStep ? onBackToReviewClick : undefined}
          isNavigatingToReview={isNavigatingToReview}
          onCancel={onCancel}
        />
      )}
      <div style={{ display: hasSubmitError ? 'none' : undefined, height: '100%' }}>
        {resolvedYamlEditor && (
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <Switch
                  id="yaml-switch"
                  label="YAML"
                  isChecked={drawerExpanded}
                  onChange={toggleDrawer}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        )}
        <Drawer isExpanded={drawerExpanded && !!resolvedYamlEditor} isInline>
          <DrawerContent
            panelContent={
              resolvedYamlEditor ? (
                <DrawerPanelContent isResizable defaultSize="600px" minSize="400px">
                  {resolvedYamlEditor()}
                </DrawerPanelContent>
              ) : undefined
            }
          >
            <DrawerContentBody>
              <Wizard
                onClose={onCancel}
                height="100%"
                header={
                  <WizardHeader
                    title={title}
                    onClose={onCancel}
                    closeButtonAriaLabel={wizard.chrome.closeButtonAriaLabel}
                  />
                }
                footer={<ValidatedStepFooter />}
              >
                {/* ─── Basic Setup (expandable parent with sub-steps) ─── */}
                <WizardStep
                  name={sl.basicSetup}
                  id={STEP_IDS.BASIC_SETUP}
                  isExpandable
                  steps={[
                    <WizardStep key={STEP_IDS.DETAILS} name={sl.details} id={STEP_IDS.DETAILS}>
                      <ResumeToReviewStep
                        shouldResume={shouldResumeToReview}
                        onResumed={handleResumed}
                      />
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
                    </WizardStep>,
                    <WizardStep
                      key={STEP_IDS.ROLES_AND_POLICIES}
                      name={sl.rolesAndPolicies}
                      id={STEP_IDS.ROLES_AND_POLICIES}
                    >
                      <RolesAndPoliciesSubStep
                        roles={basicSetupStep.roles}
                        oidcConfig={basicSetupStep.oidcConfig}
                      />
                    </WizardStep>,
                    <WizardStep
                      key={STEP_IDS.MACHINE_POOLS}
                      name={sl.machinePools}
                      id={STEP_IDS.MACHINE_POOLS}
                    >
                      <MachinePoolsSubstep
                        vpcList={basicSetupStep.vpcList}
                        machineTypes={basicSetupStep.machineTypes}
                      />
                    </WizardStep>,
                    <WizardStep
                      key={STEP_IDS.NETWORKING}
                      name={sl.networking}
                      id={STEP_IDS.NETWORKING}
                      footer={isClusterWideProxySelected ? undefined : <LastRequiredStepFooter />}
                    >
                      <NetworkingAndSubnetsSubStep
                        vpcList={basicSetupStep.vpcList}
                        setIsClusterWideProxySelected={setIsClusterWideProxySelected}
                      />
                    </WizardStep>,
                    <WizardStep
                      key={STEP_IDS.CLUSTER_WIDE_PROXY}
                      name={sl.clusterWideProxy}
                      id={STEP_IDS.CLUSTER_WIDE_PROXY}
                      isHidden={!isClusterWideProxySelected}
                      footer={<LastRequiredStepFooter />}
                    >
                      <ClusterWideProxySubstep />
                    </WizardStep>,
                  ]}
                />

                {/* ─── Additional Setup (expandable parent with sub-steps) ─── */}
                <WizardStep
                  name={sl.additionalSetup}
                  id={STEP_IDS.ADDITIONAL_SETUP}
                  isExpandable
                  steps={[
                    <WizardStep
                      key={STEP_IDS.ENCRYPTION}
                      name={sl.encryptionOptional}
                      id={STEP_IDS.ENCRYPTION}
                    >
                      <EncryptionSubstep />
                    </WizardStep>,
                    <WizardStep
                      key={STEP_IDS.CLUSTER_UPDATES}
                      name={sl.clusterUpdatesOptional}
                      id={STEP_IDS.CLUSTER_UPDATES}
                    >
                      <ClusterUpdatesSubstep />
                    </WizardStep>,
                  ]}
                />

                {/* ─── Review ─── */}
                <WizardStep
                  name={sl.review}
                  id={STEP_IDS.REVIEW}
                  footer={<ReviewStepFooter onSubmit={handleSubmit} />}
                >
                  <ReviewStepData />
                </WizardStep>
              </Wizard>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </div>
    </form.AppForm>
  );
};
