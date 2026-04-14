/* Layout + PatternFly wizard chrome migrated from @patternfly-labs/react-form-wizard Wizard / WizardPage. */
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Alert,
  Button,
  Content,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  Flex,
  PageSection,
  Switch,
  Title,
  useWizardContext,
  Wizard as PFWizard,
  WizardFooterWrapper,
  WizardStep,
  type WizardStepType,
} from '@patternfly/react-core';
import { klona } from 'klona/json';
import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFormContext, type FieldErrors } from 'react-hook-form';
import type { RosaWizardFormData } from '../types';
import {
  RosaWizardActiveStepIdPublisher,
  RosaWizardStepValidationProvider,
  useRosaWizardStepValidationMarkAttempt,
  useRosaWizardStepValidationState,
  useRosaWizardStepValidationSyncActiveStep,
} from './rosaWizardStepValidation';
import { useWizardFooterStrings } from './wizardFooterStrings';
import { getTriggerFieldsForStepId } from './rosaWizardStepTriggerFields';

export type RosaWizardCancel = () => void;
export type RosaWizardSubmitHandler = (data: RosaWizardFormData) => Promise<void>;

type WizardContextType = ReturnType<typeof useWizardContext>;

type SubStepComponent = {
  id: string;
  name: ReactNode;
  component: ReactNode;
};

type WizardStepLikeProps = {
  id?: string;
  label?: ReactNode;
  isExpandable?: boolean;
  steps?: ReactElement[];
};

function getFirstNavigableStepId(stepElements: ReactElement[]): string | undefined {
  for (const stepElement of stepElements) {
    const p = stepElement.props as WizardStepLikeProps;
    if (p.steps && p.steps.length > 0) {
      const nested = getFirstNavigableStepId(p.steps);
      if (nested) return nested;
    }
    if (p.id) {
      return p.id;
    }
  }
  return undefined;
}

function hasErrorAt(errors: FieldErrors<RosaWizardFormData>, path: string): boolean {
  const parts = path.split('.');
  let cur: unknown = errors;
  for (const part of parts) {
    cur = cur && typeof cur === 'object' ? (cur as Record<string, unknown>)[part] : undefined;
  }
  return !!cur;
}

function WizardDrawer(props: { yamlEditor?: () => ReactNode }) {
  const [yamlEditor] = useState<(() => ReactNode) | undefined>(() => props.yamlEditor);
  return (
    <DrawerPanelContent isResizable={true} defaultSize="600px" minSize="400px">
      {yamlEditor?.()}
    </DrawerPanelContent>
  );
}

export type RosaWizardShellProps = {
  title: string;
  description?: string;
  yaml?: boolean;
  yamlEditor?: () => ReactNode;
  onCancel: RosaWizardCancel;
  onSubmit: RosaWizardSubmitHandler;
  skipToReviewStepIds?: string[];
  resumeAtStepId?: string | null;
  onResumedToStep?: () => void;
  setUseWizardContext?: (context: WizardContextType) => void;
  onStepChange?: (event: React.MouseEvent<HTMLButtonElement>, currentStep: WizardStepType) => void;
  children: ReactNode;
};

export function RosaWizardShell(props: RosaWizardShellProps) {
  let { yamlEditor } = props;
  if (!yamlEditor) {
    yamlEditor = () => null;
  }
  const [drawerExpanded, setDrawerExpanded] = useState(
    props.yaml !== false && localStorage.getItem('yaml') === 'true'
  );
  const toggleDrawerExpanded = useCallback(() => {
    setDrawerExpanded((prev) => {
      localStorage.setItem('yaml', (!prev).toString());
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (props.yaml !== undefined) {
      setDrawerExpanded(props.yaml !== false && localStorage.getItem('yaml') === 'true');
    }
  }, [props.yaml]);

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' }}>
      <PageSection variant="default">
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          wrap="noWrap"
          style={{ flexWrap: 'nowrap', gap: 16 }}
        >
          <Title headingLevel="h1">{props.title}</Title>
          {props.yaml !== false && (
            <Switch
              id="yaml-switch"
              label="YAML"
              isChecked={drawerExpanded}
              onChange={() => toggleDrawerExpanded()}
            />
          )}
        </Flex>
        {props.description && <Content component="small">{props.description}</Content>}
      </PageSection>
      <div style={{ minHeight: 0 }}>
        <Drawer isExpanded={drawerExpanded} isInline>
          <DrawerContent panelContent={<WizardDrawer yamlEditor={yamlEditor} />}>
            <DrawerContentBody>
              <RosaWizardShellInner {...props} />
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

function RosaWizardShellInner(props: RosaWizardShellProps) {
  const { stepsAriaLabel, contentAriaLabel } = useWizardFooterStrings();
  const stepComponents = useMemo(
    () =>
      Children.toArray(props.children).filter((child) => isValidElement(child)) as ReactElement[],
    [props.children]
  );

  const steps = useMemo(() => {
    return stepComponents.map((component) => {
      const p = component.props as WizardStepLikeProps;
      if (p.steps && p.steps.length > 0) {
        const subSteps: SubStepComponent[] = p.steps.map((step: ReactElement) => ({
          id: step.props.id,
          name: step.props?.label,
          component: <Fragment key={step.props?.id}>{step}</Fragment>,
        }));
        return {
          id: p.id ?? '',
          name: p.label,
          component: <Fragment key={String(p.id)}>{component}</Fragment>,
          isExpandable: p.isExpandable,
          subSteps,
        };
      }
      return {
        id: p.id ?? '',
        name: p.label,
        component: <Fragment key={String(p.id)}>{component}</Fragment>,
        isExpandable: p.isExpandable,
      };
    });
  }, [stepComponents]);

  return (
    <RosaWizardStepValidationProvider>
      <PFWizard
        navAriaLabel={`${stepsAriaLabel}`}
        aria-label={`${contentAriaLabel}`}
        onStepChange={props.onStepChange}
        footer={
          <RosaWizardFooter
            setUseWizardContext={props.setUseWizardContext}
            onSubmit={props.onSubmit}
            steps={stepComponents}
            skipToReviewStepIds={props.skipToReviewStepIds}
            resumeAtStepId={props.resumeAtStepId}
            onResumedToStep={props.onResumedToStep}
          />
        }
        onClose={props.onCancel}
      >
        {steps.map(({ id, name, component, subSteps }) => {
          if (subSteps) {
            return (
              <WizardStep
                id={id}
                key={id}
                name={name}
                isExpandable
                steps={subSteps.map((subStep: SubStepComponent) => (
                  <WizardStep id={subStep.id} key={subStep.id} name={subStep.name}>
                    <RosaWizardActiveStepIdPublisher>{subStep.component}</RosaWizardActiveStepIdPublisher>
                  </WizardStep>
                ))}
              />
            );
          }
          return (
            <WizardStep key={id} id={id} name={name}>
              <RosaWizardActiveStepIdPublisher>{component}</RosaWizardActiveStepIdPublisher>
            </WizardStep>
          );
        })}
      </PFWizard>
    </RosaWizardStepValidationProvider>
  );
}

type RosaWizardFooterProps = {
  onSubmit: RosaWizardSubmitHandler;
  steps: ReactElement[];
  skipToReviewStepIds?: string[];
  setUseWizardContext?: (context: WizardContextType) => void;
  resumeAtStepId?: string | null;
  onResumedToStep?: () => void;
};

function RosaWizardFooter(props: RosaWizardFooterProps) {
  const { resumeAtStepId, onResumedToStep, onSubmit, skipToReviewStepIds, steps } = props;
  const wizContext = useWizardContext();
  const { activeStep, goToNextStep: onNext, goToPrevStep: onBack, close: onClose } = wizContext;
  const { getValues, trigger, formState } = useFormContext<RosaWizardFormData>();
  const { errors } = formState;

  const strings = useWizardFooterStrings();
  const markStepValidationAttempted = useRosaWizardStepValidationMarkAttempt();
  const stepValidationState = useRosaWizardStepValidationState();

  const hasResumedRef = useRef(false);
  const prevResumeAtStepIdRef = useRef(resumeAtStepId);

  useEffect(() => {
    props.setUseWizardContext?.(wizContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.setUseWizardContext]);

  useEffect(() => {
    if (prevResumeAtStepIdRef.current !== resumeAtStepId) {
      hasResumedRef.current = false;
      prevResumeAtStepIdRef.current = resumeAtStepId;
    }
    if (resumeAtStepId && !hasResumedRef.current) {
      wizContext.goToStepById(resumeAtStepId);
      onResumedToStep?.();
      hasResumedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResumedToStep, resumeAtStepId]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const activeStepId = activeStep.id?.toString() ?? '';
  useRosaWizardStepValidationSyncActiveStep(activeStepId);
  const triggerFields = getTriggerFieldsForStepId(activeStepId);

  const lastStepId =
    steps.length > 0
      ? (steps[steps.length - 1] as ReactElement<{ id?: string }>).props?.id
      : undefined;
  const firstStepId = steps.length > 0 ? getFirstNavigableStepId(steps) : undefined;

  const stepValidationShownForActive =
    !!activeStepId && !!stepValidationState?.shownByStepId[activeStepId];

  /**
   * `trigger()` from another step (e.g. after AWS account `reset`) runs while this step's
   * `useController` fields are unmounted, so errors never attach. Re-validate once the active
   * step mounts if the user has already tried to advance from this step (same gate as field
   * error display in {@link RosaSelect} via `useRosaShowFieldErrorsAfterStepNav`).
   */
  useLayoutEffect(() => {
    if (!stepValidationShownForActive || !activeStepId) return;
    const fields = getTriggerFieldsForStepId(activeStepId);
    if (!fields?.length) return;
    // Defer until after this commit's layout effects (substep fields mount/register).
    queueMicrotask(() => {
      void trigger(fields);
    });
  }, [activeStepId, stepValidationShownForActive, trigger]);

  const hasBlockingErrorsOnStep =
    triggerFields?.some((f) => hasErrorAt(errors, f as string)) ?? false;

  /** Inline alert after user tried Next / Skip; Next disables whenever the step has RHF errors. */
  const stepHasVisibleErrors = stepValidationShownForActive && hasBlockingErrorsOnStep;

  const onNextClick = useCallback(async () => {
    markStepValidationAttempted(activeStepId);
    const fields = getTriggerFieldsForStepId(activeStepId);
    const ok = !fields?.length || (await trigger(fields, { shouldFocus: true }));
    if (ok) {
      await onNext();
    }
  }, [activeStepId, markStepValidationAttempted, onNext, trigger]);

  const canSkipToReview = skipToReviewStepIds?.includes(activeStepId) ?? false;

  const onSkipToReviewClick = useCallback(async () => {
    markStepValidationAttempted(activeStepId);
    const fields = getTriggerFieldsForStepId(activeStepId);
    const ok = !fields?.length || (await trigger(fields, { shouldFocus: true }));
    if (ok && lastStepId) {
      wizContext.goToStepById(lastStepId);
    }
  }, [activeStepId, lastStepId, markStepValidationAttempted, trigger, wizContext]);

  const isLastStep = lastStepId !== undefined && activeStep.id === lastStepId;

  const onSubmitClickHandler = useCallback(
    async (data: RosaWizardFormData) => {
      setSubmitError('');
      setSubmitting(true);
      try {
        await onSubmit(data);
      } catch (err) {
        if (err instanceof Error) {
          setSubmitError(err.message);
        } else {
          setSubmitError(strings.unknownError);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit, strings.unknownError]
  );

  const onSubmitClick = useCallback(async () => {
    markStepValidationAttempted(activeStepId);
    const ok = await trigger(undefined, { shouldFocus: true });
    if (ok) {
      await onSubmitClickHandler(klona(getValues()) as RosaWizardFormData);
    } else {
      setSubmitError(strings.fixValidationErrorsMsg);
    }
  }, [
    activeStepId,
    getValues,
    markStepValidationAttempted,
    onSubmitClickHandler,
    strings.fixValidationErrorsMsg,
    trigger,
  ]);

  const isNextButtonDisabled = submitting || hasBlockingErrorsOnStep;

  if (isLastStep) {
    return (
      <div className="pf-v6-u-box-shadow-sm-top">
        {submitError && <Alert title={submitError} isInline variant="danger" />}
        <WizardFooterWrapper>
          <div className="pf-v6-u-pb-sm">
            <ActionList>
              <ActionListGroup>
                <ActionListItem>
                  <Button
                    onClick={() => void onSubmitClick()}
                    isDisabled={submitting}
                    isLoading={submitting}
                    type="button"
                  >
                    {submitting ? strings.submittingText : strings.submitText}
                  </Button>
                </ActionListItem>
                <ActionListItem>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void (async () => {
                        await onBack();
                      })();
                    }}
                  >
                    {strings.backButtonText}
                  </Button>
                </ActionListItem>
              </ActionListGroup>
              <ActionListGroup>
                <ActionListItem>
                  <Button variant="link" onClick={onClose}>
                    {strings.cancelButtonText}
                  </Button>
                </ActionListItem>
              </ActionListGroup>
            </ActionList>
          </div>
        </WizardFooterWrapper>
      </div>
    );
  }

  return (
    <div className="pf-v6-u-box-shadow-sm-top">
      {stepHasVisibleErrors && (
        <Alert title={strings.fixValidationErrorsMsg} isInline variant="danger" />
      )}
      <WizardFooterWrapper>
        <div className="pf-v6-u-pb-sm">
          <ActionList>
            <ActionListGroup>
              <ActionListItem>
                <Button
                  variant="primary"
                  onClick={() => void onNextClick()}
                  isDisabled={isNextButtonDisabled}
                >
                  {strings.nextButtonText}
                </Button>
              </ActionListItem>

              {canSkipToReview && (
                <ActionListItem>
                  <Button
                    variant="secondary"
                    onClick={() => void onSkipToReviewClick()}
                    isDisabled={isNextButtonDisabled}
                  >
                    {strings.skipToReviewButtonText}
                  </Button>
                </ActionListItem>
              )}

              <ActionListItem>
                <Button
                  variant="secondary"
                  onClick={() => {
                    void (async () => {
                      await onBack();
                    })();
                  }}
                  isDisabled={activeStepId === firstStepId}
                >
                  {strings.backButtonText}
                </Button>
              </ActionListItem>
            </ActionListGroup>
            <ActionListGroup>
              <ActionListItem>
                <Button variant="link" onClick={onClose}>
                  {strings.cancelButtonText}
                </Button>
              </ActionListItem>
            </ActionListGroup>
          </ActionList>
        </div>
      </WizardFooterWrapper>
    </div>
  );
}
