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
import React, { ReactNode } from 'react';
import { ClusterWideProxySubstep } from './Steps/AdditionalSetupStep/ClusterWideProxySubstep/ClusterWideProxySubstep';
import { ReviewStepData } from './Steps/ReviewStepData';
import {
  MachineTypesDropdownType,
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
} from '../types';
import { useTranslation } from '../../../context/TranslationContext';
import { MachinePoolsSubstep } from './Steps/BasicSetupStep/MachinePoolsSubstep/MachinePoolsSubstep';
import { YamlDrawerEditor } from './Steps/YamlCodeEditor';

export type BasicSetupStepProps = {
  // validation-only fields (no data, just state)
  clusterNameValidation: ValidationResource;
  userRole: ValidationResource;

  // data resources — each carries data/error/loading and optional fetch
  versions: Resource<OpenShiftVersionsData, []> & { fetch: () => Promise<void> };
  awsInfrastructureAccounts: Resource<SelectDropdownType[]>;
  awsBillingAccounts: Resource<SelectDropdownType[]>;
  regions: Resource<SelectDropdownType[]>;
  roles: Resource<Role[], [awsAccount: string]> & {
    fetch: (awsAccount: string) => Promise<void>;
  };
  oidcConfig: Resource<OIDCConfig[]>;
  vpcList: Resource<VPC[]>;
  // subnets are currently embedded in vpc.aws_subnets; resource shape is ready for future separation
  subnets: Resource<Subnet[]>;
  securityGroups: Resource<SecurityGroup[]>;
  machineTypes: Resource<MachineTypesDropdownType[]>;
};

export type WizardStepsData = {
  basicSetupStep: BasicSetupStepProps;
};

function buildVersionOptions(data: OpenShiftVersionsData): SelectDropdownType[] {
  const defaultEqualsLatest = data.latest.value === data.default.value;

  if (defaultEqualsLatest) {
    return [data.default, ...data.others];
  }

  return [data.latest, data.default, ...data.others];
}

type RosaWizardProps = {
  onSubmit: WizardSubmit;
  onSubmitError?: string | boolean;
  onCancel: WizardCancel;
  title: string;
  wizardsStepsData: WizardStepsData;
  /** Called when "Back to review step" is clicked so the parent can clear its error state. When this promise resolves, the wizard navigates to the review step. */
  onBackToReviewStep?: () => void | Promise<void>;
  yamlEditor?: () => ReactNode;
  yaml?: boolean;
};

function getDefaultYamlEditor() {
  return <YamlDrawerEditor />;
}

export const RosaWizard = (props: RosaWizardProps) => {
  const { t } = useTranslation();
  const { onSubmit, onCancel, title, wizardsStepsData, onSubmitError, onBackToReviewStep, yaml } =
    props;
  const yamlEditor = props.yamlEditor ?? getDefaultYamlEditor;
  const [isClusterWideProxySelected, setIsClusterWideProxySelected] =
    React.useState<boolean>(false);

  const [resumeAtStepId, setResumeAtStepId] = React.useState<string | null>(null);
  const [isNavigatingToReview, setIsNavigatingToReview] = React.useState(false);

  const [getUseWizardContext, setUseWizardContext] = React.useState<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    WizardNavigationContext | undefined
  >();

  const { basicSetupStep } = wizardsStepsData;

  const hasSubmitError = !!onSubmitError;

  const onBackToReviewClick = React.useCallback(async () => {
    setIsNavigatingToReview(true);
    if (onBackToReviewStep) {
      await onBackToReviewStep();
      setResumeAtStepId('review-step');
    }

    setIsNavigatingToReview(false);
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
          yaml={yaml}
          yamlEditor={yamlEditor}
        >
          <ExpandableStep
            id="basic-setup-step-id-expandable-section"
            label={t('Basic setup')}
            key="basic-setup-step-expandable-section-key"
            isExpandable
            steps={[
              <Step label={t('Details')} id="basic-setup-step-details" key="basic-setup-details">
                <DetailsSubStep
                  clusterNameValidation={basicSetupStep.clusterNameValidation}
                  openShiftVersions={buildVersionOptions(basicSetupStep.versions.data)}
                  versionsIsPending={basicSetupStep.versions.isFetching}
                  refreshVersionsCallback={() => void basicSetupStep.versions.fetch()}
                  roles={basicSetupStep.roles}
                  awsInfrastructureAccounts={basicSetupStep.awsInfrastructureAccounts}
                  awsBillingAccounts={basicSetupStep.awsBillingAccounts}
                  regions={basicSetupStep.regions}
                />
              </Step>,
              <Step
                id="roles-and-policies-sub-step"
                label={t('Roles and policies')}
                key="roles-and-policies-sub-step-key"
              >
                <RolesAndPoliciesSubStep
                  roles={basicSetupStep.roles}
                  oidcConfig={basicSetupStep.oidcConfig}
                />
              </Step>,
              <Step
                id="machinepools-sub-step"
                label={t('Machine pools')}
                key="machinepools-sub-step-key"
              >
                <MachinePoolsSubstep
                  vpcList={basicSetupStep.vpcList}
                  machineTypes={basicSetupStep.machineTypes}
                />
              </Step>,
              <Step id="networking-sub-step" label={t('Networking')} key="networking-sub-step-key">
                <NetworkingAndSubnetsSubStep
                  vpcList={basicSetupStep.vpcList}
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
          <Step label={t('Review')} id={'review-step'}>
            <ReviewStepData goToStepId={getUseWizardContext} />
          </Step>
        </WizardPage>
      </div>
    </>
  );
};
