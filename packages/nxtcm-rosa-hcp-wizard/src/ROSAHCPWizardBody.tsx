import React, {
  lazy,
  Suspense,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { Wizard, WizardStep } from '@patternfly/react-core/dist/dynamic/components/Wizard';
import { useFormContext, useWatch } from 'react-hook-form';

import { FIELD_NAME, STEP_IDS } from './constants';
import { useWizardFieldMetaChangeEffects } from './fieldMetaChangeEffects/useWizardFieldMetaChangeEffects';
import { createRosaHcpWizardFooter } from './Footer/RosaHcpWizardFooter';
import { RosaHcpYamlEditorFooter } from './Footer/RosaHcpYamlEditorFooter';
import { useRosaHcpWizardSubmit } from './Footer/useRosaHcpWizardSubmit';
import { RosaWizardSubmitError } from './RosaWizardSubmitError';
import { RosaWizardSubmittingState } from './RosaWizardSubmittingState';
import { ClusterWideProxy } from './Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy';
import { Details } from './Steps/BasicSetup/Details/Details';
import { MachinePools } from './Steps/BasicSetup/MachinePools/MachinePools';
import { Networking } from './Steps/BasicSetup/Networking/Networking';
import { RolesAndPolicies } from './Steps/BasicSetup/RolesAndPolicies/RolesAndPolicies';
import { ClusterUpdates } from './Steps/OptionalSetup/ClusterUpdates/ClusterUpdates';
import { Encryption } from './Steps/OptionalSetup/Encryption/Encryption';
import { Review } from './Steps/Review/Review';
import type { YamlEditorHandle } from './Steps/YamlEditor/RosaHcpYamlEditorStep';
import { useRosaHcpWizardStrings } from './stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster, RosaHCPWizardProps } from './types';
import { useIsStepHidden } from './WizardConfigContext';

import './ROSAHCPWizardBody.css';
// Eager load so layout applies during Suspense fallback before the lazy step chunk loads.
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
    selectedSecret,
    enableAllWizardNavSteps = false,
  } = props;

  const { getValues } = useFormContext<Partial<ROSAHCPCluster>>();
  const [isNavigatingToReview, setIsNavigatingToReview] = useState(false);
  // Preserve the YAML submission origin while the loading and error views replace the wizard.
  const [yamlEditorView, setYamlEditorView] = useState<'closed' | 'open' | 'submitted'>('closed');
  const [yamlDraft, setYamlDraft] = useState<string | undefined>(undefined);
  const isYamlEditorOpen = yamlEditorView === 'open';
  const [wizardStartIndex, setWizardStartIndex] = useState(1);
  // The first wizard step is the Basic setup parent; Details is its first focusable substep.
  const lastWizardStepIndexRef = useRef(2);
  const yamlEditorRef = useRef<YamlEditorHandle>(null);
  const wizardViewRef = useRef<HTMLDivElement>(null);
  const submittingViewRef = useRef<HTMLElement>(null);
  const errorViewRef = useRef<HTMLElement>(null);
  const yamlViewRef = useRef<HTMLDivElement>(null);
  const editYamlButtonRef = useRef<HTMLButtonElement>(null);
  const submitErrorTitleId = useId();
  const submitErrorMessageId = useId();
  const createClusterTitleId = useId();

  const getFormYaml = useCallback(
    () => resourceGenerator.renderYaml(getValues()),
    [getValues, resourceGenerator]
  );
  const getSubmissionYaml = useCallback((): string => {
    if (!isYamlEditorOpen) return getFormYaml();

    const yaml = yamlEditorRef.current?.getYaml() ?? '';
    setYamlDraft(yaml);
    return yaml;
  }, [getFormYaml, isYamlEditorOpen]);
  const handleSubmitResolved = useCallback((): void => {
    setWizardStartIndex(lastWizardStepIndexRef.current);
    if (isYamlEditorOpen) setYamlEditorView('submitted');
  }, [isYamlEditorOpen]);
  const { isSubmitting, submitWizard } = useRosaHcpWizardSubmit({
    onSubmit,
    getYaml: getSubmissionYaml,
    skipFormValidation: isYamlEditorOpen,
    onSubmitResolved: handleSubmitResolved,
  });
  const submitReview = useCallback((): Promise<boolean> => {
    setYamlDraft(undefined);
    setYamlEditorView('closed');
    return submitWizard();
  }, [submitWizard]);

  const handleBackToReviewStep = useCallback(async () => {
    if (!onBackToReviewStep) return;
    setWizardStartIndex(lastWizardStepIndexRef.current);
    if (yamlEditorView === 'submitted') setYamlEditorView('open');
    setIsNavigatingToReview(true);
    try {
      await onBackToReviewStep();
    } finally {
      setIsNavigatingToReview(false);
    }
  }, [onBackToReviewStep, yamlEditorView]);

  const handleCloseYamlEditor = useCallback(() => {
    setYamlDraft(undefined);
    setYamlEditorView('closed');
  }, []);
  const openYamlEditor = useCallback(() => {
    setYamlDraft(undefined);
    setYamlEditorView('open');
  }, []);

  const handleWizardStepChange = useCallback<
    NonNullable<React.ComponentProps<typeof Wizard>['onStepChange']>
  >(
    (_event, newStep) => {
      if (newStep?.index) {
        lastWizardStepIndexRef.current = newStep.index;
      }
      if (isYamlEditorOpen && newStep?.id !== STEP_IDS.REVIEW) {
        setYamlEditorView('closed');
      }
    },
    [isYamlEditorOpen]
  );

  const footer = useMemo(
    () => createRosaHcpWizardFooter(isSubmitting, submitReview, enableAllWizardNavSteps),
    [enableAllWizardNavSteps, isSubmitting, submitReview]
  );

  useWizardFieldMetaChangeEffects(wizardData);

  const clusterWideProxySelected = useWatch<ROSAHCPCluster, typeof FIELD_NAME.CONFIGURE_PROXY>({
    name: FIELD_NAME.CONFIGURE_PROXY,
  });

  const isClusterWideProxyHidden = useIsStepHidden(STEP_IDS.CLUSTER_WIDE_PROXY);
  const isClusterUpdatesHidden = useIsStepHidden(STEP_IDS.CLUSTER_UPDATES);

  const rosaStrings = useRosaHcpWizardStrings();
  const { wizard, yamlEditor: yamlStrings } = rosaStrings;
  const sl = wizard.stepLabels;
  const view = isSubmitting
    ? 'submitting'
    : onSubmitError
      ? 'error'
      : isYamlEditorOpen
        ? 'yaml'
        : 'wizard';
  const previousViewRef = useRef(view);

  useLayoutEffect(() => {
    if (view === 'submitting') {
      submittingViewRef.current?.focus();
    } else if (view === 'error') {
      errorViewRef.current?.focus();
    } else if (view === 'yaml') {
      yamlViewRef.current?.focus();
    } else if (previousViewRef.current !== 'wizard') {
      const focusTimer = window.setTimeout(() => {
        if (editYamlButtonRef.current) {
          editYamlButtonRef.current.focus();
        } else {
          wizardViewRef.current
            ?.querySelector<HTMLButtonElement>('button[aria-current="step"]')
            ?.focus();
        }
      }, 0);
      previousViewRef.current = view;
      return () => window.clearTimeout(focusTimer);
    }
    previousViewRef.current = view;
  }, [view]);

  const yamlEditorFooter = useMemo(
    () => (
      <RosaHcpYamlEditorFooter
        editorRef={yamlEditorRef}
        onClose={handleCloseYamlEditor}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitWizard={submitWizard}
      />
    ),

    [handleCloseYamlEditor, isSubmitting, onCancel, submitWizard]
  );

  if (isSubmitting) {
    return (
      <section
        ref={submittingViewRef}
        tabIndex={-1}
        role="status"
        aria-labelledby={createClusterTitleId}
        aria-label={wizard.createCluster}
      >
        <RosaWizardSubmittingState createClusterTitleId={createClusterTitleId} />
      </section>
    );
  }

  if (onSubmitError) {
    return (
      <section
        ref={errorViewRef}
        tabIndex={-1}
        aria-labelledby={submitErrorTitleId}
        aria-describedby={
          typeof onSubmitError === 'string' && onSubmitError.length > 0
            ? submitErrorMessageId
            : undefined
        }
      >
        <RosaWizardSubmitError
          titleId={submitErrorTitleId}
          messageId={submitErrorMessageId}
          onSubmitError={onSubmitError}
          onBackToReviewStep={onBackToReviewStep ? handleBackToReviewStep : undefined}
          isNavigatingToReview={isNavigatingToReview}
          onCancel={onCancel}
        />
      </section>
    );
  }

  return (
    <div
      ref={wizardViewRef}
      data-testid="rosa-hcp-wizard-view"
      className={`rosa-hcp-wizard${isYamlEditorOpen ? ' rosa-hcp-wizard--yaml-editor-open' : ''}`}
    >
      <Wizard
        footer={footer}
        onClose={onCancel}
        onStepChange={handleWizardStepChange}
        startIndex={wizardStartIndex}
        isVisitRequired={!enableAllWizardNavSteps}
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
              <RolesAndPolicies {...wizardData} product={product} selectedSecret={selectedSecret} />
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
        <WizardStep
          isExpandable
          name={sl.additionalSetup}
          id={STEP_IDS.OPTIONAL_SETUP}
          steps={[
            <WizardStep
              name={sl.encryptionOptional}
              id={STEP_IDS.ENCRYPTION}
              key={STEP_IDS.ENCRYPTION}
            >
              <Encryption />
            </WizardStep>,
            ...(!isClusterUpdatesHidden
              ? [
                  <WizardStep
                    name={sl.clusterUpdatesOptional}
                    id={STEP_IDS.CLUSTER_UPDATES}
                    key={STEP_IDS.CLUSTER_UPDATES}
                  >
                    <ClusterUpdates />
                  </WizardStep>,
                ]
              : []),
          ]}
        />

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
            <div
              ref={yamlViewRef}
              className="rosa-hcp-yaml-editor-view"
              role="region"
              aria-label={yamlStrings.title}
              tabIndex={-1}
            >
              <Suspense
                fallback={
                  <div className="pf-v6-u-p-lg pf-v6-u-text-align-center">
                    <Spinner size="lg" aria-label={yamlStrings.title} />
                  </div>
                }
              >
                <RosaHcpYamlEditorStep
                  ref={yamlEditorRef}
                  initialYaml={yamlDraft}
                  onClose={handleCloseYamlEditor}
                  onCancel={onCancel}
                  resourceGenerator={resourceGenerator}
                />
              </Suspense>
            </div>
          ) : (
            <Review
              vpcList={wizardData.vpcList}
              onOpenYamlEditor={openYamlEditor}
              editInYamlButtonRef={editYamlButtonRef}
            />
          )}
        </WizardStep>
      </Wizard>
    </div>
  );
};
