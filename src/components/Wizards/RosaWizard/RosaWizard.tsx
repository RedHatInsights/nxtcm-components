import React, { type ReactNode } from 'react';
import {
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
import { useAppForm } from './RosaFormContext';
import { YamlDrawerEditor } from './Steps/YamlCodeEditor';

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

/**
 * Callback invoked when the wizard review step is submitted.
 *
 * The `data` object is the live TanStack Form state — optional
 * {@link ClusterFormData} fields may be present with value `undefined`
 * (not absent). See {@link RosaWizardFormData} for details.
 */
export type RosaWizardSubmitFn = (data: RosaWizardFormData) => Promise<void>;

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

export const RosaWizard = (props: RosaWizardProps): JSX.Element => (
  <RosaWizardStringsProvider strings={props.strings}>
    <RosaWizardBody {...props} />
  </RosaWizardStringsProvider>
);

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
 * Custom footer that skips optional Additional Setup steps and
 * jumps straight to Review when the user clicks "Next".
 */
function SkipToReviewFooter(): JSX.Element {
  const { goToPrevStep, goToStepById, close } = useWizardContext();
  const {
    wizard: { chrome },
  } = useRosaWizardStrings();
  return (
    <WizardFooterWrapper>
      <Button variant="primary" onClick={() => goToStepById(STEP_IDS.REVIEW)}>
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

function getDefaultYamlEditor(): ReactNode {
  return <YamlDrawerEditor />;
}

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
                header={<WizardHeader title={title} onClose={onCancel} />}
                footer={{
                  nextButtonText: wizard.chrome.nextButtonText,
                  backButtonText: wizard.chrome.backButtonText,
                  cancelButtonText: wizard.chrome.cancelButtonText,
                }}
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
                      footer={isClusterWideProxySelected ? undefined : <SkipToReviewFooter />}
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
                      footer={<SkipToReviewFooter />}
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
