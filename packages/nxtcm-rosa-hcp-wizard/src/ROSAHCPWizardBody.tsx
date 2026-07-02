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
import { useRosaHcpWizardStrings } from './stringsProvider/RosaHcpWizardStringsContext';
import { STEP_IDS } from './constants';
import type { RosaHCPWizardProps } from './types';
import { useIsStepHidden } from './WizardConfigContext';
import { RosaWizardSubmitError } from './RosaWizardSubmitError';
import './ROSAHCPWizardBody.css';
import './Steps/YamlEditor/RosaHcpYamlEditorStep.css';

const RosaHcpYamlEditorStep = lazy(() =>
  import('./Steps/YamlEditor/RosaHcpYamlEditorStep').then((module) => ({
    default: module.RosaHcpYamlEditorStep,
  }))
);

export const ROSAHCPWizardBody = (props: RosaHCPWizardProps) => {
  const {
    wizardData,
    onSubmit,
    onCancel,
    onSubmitError,
    onBackToReviewStep,
    resourceGenerator,
    product,
    enableAllWizardNavSteps = false,
  } = props;

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

  const handleWizardStepChange = useCallback<
    NonNullable<React.ComponentProps<typeof Wizard>['onStepChange']>
  >(
    (_event, newStep) => {
      if (isYamlEditorOpen && newStep?.id !== STEP_IDS.REVIEW) {
        setIsYamlEditorOpen(false);
      }
    },
    [isYamlEditorOpen]
  );

  const footer = useMemo(
    () => createRosaHcpWizardFooter(onSubmit, enableAllWizardNavSteps),
    [enableAllWizardNavSteps, onSubmit]
  );

  useWizardFieldMetaChangeEffects(wizardData);

  const clusterWideProxySelected = useWatch({ name: 'configure_proxy' });

  const isClusterWideProxyHidden = useIsStepHidden(STEP_IDS.CLUSTER_WIDE_PROXY);
  const isClusterUpdatesHidden = useIsStepHidden(STEP_IDS.CLUSTER_UPDATES);

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

  return (
    <div
      className={`rosa-hcp-wizard${isYamlEditorOpen ? ' rosa-hcp-wizard--yaml-editor-open' : ''}`}
    >
      {onSubmitError ? (
        <RosaWizardSubmitError
          onSubmitError={onSubmitError}
          onBackToReviewStep={onBackToReviewStep ? handleBackToReviewStep : undefined}
          isNavigatingToReview={isNavigatingToReview}
          onCancel={onCancel}
        />
      ) : null}
      <Wizard
        footer={footer}
        onClose={onCancel}
        onStepChange={handleWizardStepChange}
        isVisitRequired={!enableAllWizardNavSteps}
        style={onSubmitError ? { display: 'none' } : undefined}
      >
        <WizardStep
          isExpandable
          name={sl.basicSetup}
          id={STEP_IDS.BASIC_SETUP}
          steps={[
            <WizardStep name={sl.details} id={STEP_IDS.DETAILS} key={STEP_IDS.DETAILS}>
              <Details {...wizardData} product={product} />
            </WizardStep>,
            <WizardStep
              name={sl.rolesAndPolicies}
              id={STEP_IDS.ROLES_AND_POLICIES}
              key={STEP_IDS.ROLES_AND_POLICIES}
            >
              <RolesAndPolicies {...wizardData} product={product} />
            </WizardStep>,
            <WizardStep
              name={sl.machinePools}
              id={STEP_IDS.MACHINE_POOLS}
              key={STEP_IDS.MACHINE_POOLS}
            >
              <MachinePools {...wizardData} />
            </WizardStep>,
            <WizardStep name={sl.networking} id={STEP_IDS.NETWORKING} key={STEP_IDS.NETWORKING}>
              <Networking {...wizardData} />
            </WizardStep>,
            ...(clusterWideProxySelected && !isClusterWideProxyHidden
              ? [
                  <WizardStep
                    name={sl.clusterWideProxy}
                    id={STEP_IDS.CLUSTER_WIDE_PROXY}
                    key={STEP_IDS.CLUSTER_WIDE_PROXY}
                  >
                    <ClusterWideProxy />
                  </WizardStep>,
                ]
              : []),
          ]}
        />

        {(() => {
          const optionalSteps = [
            <WizardStep
              name={sl.encryptionOptional}
              id={STEP_IDS.ENCRYPTION}
              key={STEP_IDS.ENCRYPTION}
            >
              <Encryption />
            </WizardStep>,
            !isClusterUpdatesHidden && (
              <WizardStep
                name={sl.clusterUpdatesOptional}
                id={STEP_IDS.CLUSTER_UPDATES}
                key={STEP_IDS.CLUSTER_UPDATES}
              >
                <ClusterUpdates />
              </WizardStep>
            ),
          ].filter((s): s is React.ReactElement => Boolean(s));

          if (optionalSteps.length === 0) return null;

          return (
            <WizardStep
              isExpandable
              name={sl.additionalSetup}
              id={STEP_IDS.OPTIONAL_SETUP}
              key={STEP_IDS.OPTIONAL_SETUP}
              steps={optionalSteps}
            />
          );
        })()}

        <WizardStep
          name={sl.review}
          id={STEP_IDS.REVIEW}
          key={STEP_IDS.REVIEW}
          footer={isYamlEditorOpen ? yamlEditorFooter : undefined}
          body={
            isYamlEditorOpen
              ? { className: 'rosa-hcp-yaml-editor-wizard-main', hasNoPadding: true }
              : undefined
          }
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
                resourceGenerator={resourceGenerator}
              />
            </Suspense>
          ) : (
            <Review vpcList={wizardData.vpcList} onOpenYamlEditor={openYamlEditor} />
          )}
        </WizardStep>
      </Wizard>
    </div>
  );
};
