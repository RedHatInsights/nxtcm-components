import React, { useState, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { Spinner, Wizard, WizardStep } from '@patternfly/react-core';
import { useWatch } from 'react-hook-form';
import { Details } from './Steps/BasicSetup/Details/Details';
import { RolesAndPolicies } from './Steps/BasicSetup/RolesAndPolicies/RolesAndPolicies';
import { MachinePools } from './Steps/BasicSetup/MachinePools/MachinePools';
import { Networking } from './Steps/BasicSetup/Networking/Networking';
import { Encryption } from './Steps/OptionalSetup/Encryption/Encryption';
import { ClusterUpdates } from './Steps/OptionalSetup/ClusterUpdates/ClusterUpdates';
import { ClusterWideProxy } from './Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy';
import { Review } from './Steps/Review/Review';
import type { YamlEditorHandle } from './Steps/YamlEditor/RosaHcpYamlEditorStep';
import { createRosaHcpWizardFooter } from './Footer/RosaHcpWizardFooter';
import { RosaHcpYamlEditorFooter } from './Footer/RosaHcpYamlEditorFooter';
import { useWizardFieldMetaChangeEffects } from './fieldMetaChangeEffects/useWizardFieldMetaChangeEffects';
import { buildRosaHcpWizardStepLayout } from './rosaHcpWizardStepLayout';
import { useRosaHcpWizardStepNavDisabledLookup } from './useRosaHcpWizardStepNavDisabledLookup';
import {
  useRosaHcpWizardStepStatusLookup,
  useRosaHcpWizardValidation,
} from './rosaHcpWizardValidationContext';
import { useRosaHcpWizardStrings } from './stringsProvider/RosaHcpWizardStringsContext';
import { STEP_IDS } from './constants';
import type { RosaHCPWizardProps } from './types';
import { RosaWizardSubmitError } from './RosaWizardSubmitError';

const RosaHcpYamlEditorStep = lazy(() =>
  import('./Steps/YamlEditor/RosaHcpYamlEditorStep').then((module) => ({
    default: module.RosaHcpYamlEditorStep,
  }))
);

export const ROSAHCPWizardBody = (props: RosaHCPWizardProps) => {
  const { wizardData, onSubmit, onCancel, yaml, onSubmitError, onBackToReviewStep } = props;

  const [isNavigatingToReview, setIsNavigatingToReview] = useState(false);
  const [isYamlEditorOpen, setIsYamlEditorOpen] = useState(false);
  const yamlEditorRef = useRef<YamlEditorHandle>(null);

  const handleBackToReviewStep = useCallback(async () => {
    if (!onBackToReviewStep) return;
    setIsNavigatingToReview(true);
    try {
      await onBackToReviewStep();
    } finally {
      setIsNavigatingToReview(false);
    }
  }, [onBackToReviewStep]);

  const handleCloseYamlEditor = useCallback(() => setIsYamlEditorOpen(false), []);
  const openYamlEditor = useCallback(() => setIsYamlEditorOpen(true), []);
  const { onWizardStepChange } = useRosaHcpWizardValidation();

  const handleWizardStepChange = useCallback<
    NonNullable<React.ComponentProps<typeof Wizard>['onStepChange']>
  >(
    (_event, newStep) => {
      if (newStep?.id !== undefined) {
        onWizardStepChange(String(newStep.id));
      }
      if (isYamlEditorOpen && newStep?.id !== STEP_IDS.REVIEW) {
        setIsYamlEditorOpen(false);
      }
    },
    [isYamlEditorOpen, onWizardStepChange]
  );

  const footer = useMemo(() => createRosaHcpWizardFooter(onSubmit), [onSubmit]);

  useWizardFieldMetaChangeEffects(wizardData);

  const clusterWideProxySelected = useWatch({ name: 'configure_proxy' });
  const childStepIdsByParent = useMemo(
    () =>
      buildRosaHcpWizardStepLayout({ includeClusterWideProxy: !!clusterWideProxySelected })
        .childStepIdsByParent,
    [clusterWideProxySelected]
  );
  const statusForStep = useRosaHcpWizardStepStatusLookup(childStepIdsByParent);
  const isNavDisabledForStep = useRosaHcpWizardStepNavDisabledLookup({
    includeClusterWideProxy: !!clusterWideProxySelected,
    childStepIdsByParent,
  });

  const rosaStrings = useRosaHcpWizardStrings();
  const { wizard, yamlEditor: yamlStrings } = rosaStrings;
  const sl = wizard.stepLabels;

  const yamlEditorFooter = useMemo(
    () => (
      <RosaHcpYamlEditorFooter
        editorRef={yamlEditorRef}
        onClose={handleCloseYamlEditor}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleCloseYamlEditor, onCancel, onSubmit]
  );

  if (onSubmitError) {
    return (
      <RosaWizardSubmitError
        onSubmitError={onSubmitError}
        onBackToReviewStep={onBackToReviewStep ? handleBackToReviewStep : undefined}
        isNavigatingToReview={isNavigatingToReview}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div>
      <Wizard
        height="100vh"
        footer={footer}
        onClose={onCancel}
        onStepChange={handleWizardStepChange}
      >
        {/* Leaf step order matches {@link ROSA_HCP_LEAF_STEP_DEFS} in rosaHcpWizardStepLayout.ts */}
        <WizardStep
          isExpandable
          name={sl.basicSetup}
          id={STEP_IDS.BASIC_SETUP}
          status={statusForStep(STEP_IDS.BASIC_SETUP)}
          isDisabled={isNavDisabledForStep(STEP_IDS.BASIC_SETUP)}
          steps={[
            <WizardStep
              name={sl.details}
              id={STEP_IDS.DETAILS}
              key={STEP_IDS.DETAILS}
              status={statusForStep(STEP_IDS.DETAILS)}
              isDisabled={isNavDisabledForStep(STEP_IDS.DETAILS)}
            >
              <Details {...wizardData} />
            </WizardStep>,
            <WizardStep
              name={sl.rolesAndPolicies}
              id={STEP_IDS.ROLES_AND_POLICIES}
              key={STEP_IDS.ROLES_AND_POLICIES}
              status={statusForStep(STEP_IDS.ROLES_AND_POLICIES)}
              isDisabled={isNavDisabledForStep(STEP_IDS.ROLES_AND_POLICIES)}
            >
              <RolesAndPolicies {...wizardData} />
            </WizardStep>,
            <WizardStep
              name={sl.machinePools}
              id={STEP_IDS.MACHINE_POOLS}
              key={STEP_IDS.MACHINE_POOLS}
              status={statusForStep(STEP_IDS.MACHINE_POOLS)}
              isDisabled={isNavDisabledForStep(STEP_IDS.MACHINE_POOLS)}
            >
              <MachinePools {...wizardData} />
            </WizardStep>,
            <WizardStep
              name={sl.networking}
              id={STEP_IDS.NETWORKING}
              key={STEP_IDS.NETWORKING}
              status={statusForStep(STEP_IDS.NETWORKING)}
              isDisabled={isNavDisabledForStep(STEP_IDS.NETWORKING)}
            >
              <Networking {...wizardData} />
            </WizardStep>,
            ...(clusterWideProxySelected
              ? [
                  <WizardStep
                    name={sl.clusterWideProxy}
                    id={STEP_IDS.CLUSTER_WIDE_PROXY}
                    key={STEP_IDS.CLUSTER_WIDE_PROXY}
                    status={statusForStep(STEP_IDS.CLUSTER_WIDE_PROXY)}
                    isDisabled={isNavDisabledForStep(STEP_IDS.CLUSTER_WIDE_PROXY)}
                  >
                    <ClusterWideProxy />
                  </WizardStep>,
                ]
              : []),
          ]}
        />

        <WizardStep
          isExpandable
          name={sl.additionalSetup}
          id={STEP_IDS.OPTIONAL_SETUP}
          key={STEP_IDS.OPTIONAL_SETUP}
          status={statusForStep(STEP_IDS.OPTIONAL_SETUP)}
          isDisabled={isNavDisabledForStep(STEP_IDS.OPTIONAL_SETUP)}
          steps={[
            <WizardStep
              name={sl.encryptionOptional}
              id={STEP_IDS.ENCRYPTION}
              key={STEP_IDS.ENCRYPTION}
              status={statusForStep(STEP_IDS.ENCRYPTION)}
              isDisabled={isNavDisabledForStep(STEP_IDS.ENCRYPTION)}
            >
              <Encryption />
            </WizardStep>,
            <WizardStep
              name={sl.clusterUpdatesOptional}
              id={STEP_IDS.CLUSTER_UPDATES}
              key={STEP_IDS.CLUSTER_UPDATES}
              status={statusForStep(STEP_IDS.CLUSTER_UPDATES)}
              isDisabled={isNavDisabledForStep(STEP_IDS.CLUSTER_UPDATES)}
            >
              <ClusterUpdates />
            </WizardStep>,
          ]}
        />
        <WizardStep
          name={sl.review}
          id={STEP_IDS.REVIEW}
          key={STEP_IDS.REVIEW}
          status={statusForStep(STEP_IDS.REVIEW)}
          isDisabled={isNavDisabledForStep(STEP_IDS.REVIEW)}
          footer={isYamlEditorOpen ? yamlEditorFooter : undefined}
        >
          {isYamlEditorOpen ? (
            <Suspense
              fallback={
                <div className="pf-v6-u-p-lg pf-v6-u-text-align-center">
                  <Spinner size="lg" aria-label={yamlStrings.title} />
                </div>
              }
            >
              <RosaHcpYamlEditorStep
                ref={yamlEditorRef}
                onClose={handleCloseYamlEditor}
                onCancel={onCancel}
              />
            </Suspense>
          ) : (
            <Review
              vpcList={wizardData.vpcList}
              onOpenYamlEditor={yaml ? openYamlEditor : undefined}
            />
          )}
        </WizardStep>
      </Wizard>
    </div>
  );
};
