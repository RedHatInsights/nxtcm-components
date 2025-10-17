import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Button, DescriptionList, Drawer, DrawerContent, DrawerContentBody, DrawerPanelContent, Icon, Wizard as PFWizard, Split, SplitItem, useWizardContext, WizardFooterWrapper, WizardStep, } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { klona } from 'klona/json';
import { Children, Fragment, isValidElement, useCallback, useEffect, useMemo, useState, } from 'react';
import { EditMode } from '.';
import { DataContext } from './contexts/DataContext';
import { DisplayMode, DisplayModeContext } from './contexts/DisplayModeContext';
import { EditModeContext } from './contexts/EditModeContext';
import { ItemContext, useItem } from './contexts/ItemContext';
import { ShowValidationProvider, useSetShowValidation, useShowValidation } from './contexts/ShowValidationProvider';
import { StepHasInputsProvider } from './contexts/StepHasInputsProvider';
import { StepShowValidationProvider, useSetStepShowValidation, useStepShowValidation, } from './contexts/StepShowValidationProvider';
import { StepValidationProvider, useStepHasValidationError } from './contexts/StepValidationProvider';
import { defaultStrings, StringContext, useStringContext } from './contexts/StringContext';
import { EditorValidationStatus, useEditorValidationStatus, useHasValidationError, ValidationProvider, } from './contexts/ValidationProvider';
import { Step } from './Step';
export function Wizard(props) {
    const [data, setData] = useState(props.defaultData ? klona(props.defaultData) : {});
    const update = useCallback((newData) => setData((data) => klona(newData ?? data)), []);
    const [drawerExpanded, setDrawerExpanded] = useState(false);
    useEffect(() => {
        if (props.showYaml !== undefined) {
            setDrawerExpanded(props.showYaml);
        }
    }, [props.showYaml]);
    const displayMode = DisplayMode.Step;
    const { wizardStrings } = props;
    return (_jsx(EditModeContext.Provider, { value: props.editMode === undefined ? EditMode.Create : props.editMode, children: _jsx(StepHasInputsProvider, { children: _jsx(StepShowValidationProvider, { children: _jsx(StepValidationProvider, { children: _jsx(DisplayModeContext.Provider, { value: displayMode, children: _jsx(DataContext.Provider, { value: { update }, children: _jsx(ItemContext.Provider, { value: data, children: _jsx(ShowValidationProvider, { children: _jsx(ValidationProvider, { children: _jsx(Drawer, { isExpanded: drawerExpanded, isInline: true, children: _jsx(DrawerContent, { panelContent: _jsx(WizardDrawer, { yamlEditor: props.yamlEditor }), children: _jsx(DrawerContentBody, { children: _jsx(ItemContext.Provider, { value: data, children: _jsx(StringContext.Provider, { value: wizardStrings || defaultStrings, children: _jsx(WizardInternal, { title: props.title, onSubmit: props.onSubmit, onCancel: props.onCancel, hasButtons: props.hasButtons, submitButtonText: props.submitButtonText, submittingButtonText: props.submittingButtonText, children: props.children }) }) }) }) }) }) }) }) }) }) }) }) }) }) }));
}
function WizardInternal({ children, onSubmit, onCancel, submitButtonText, submittingButtonText }) {
    const { reviewLabel, stepsAriaLabel, contentAriaLabel } = useStringContext();
    const stepComponents = useMemo(() => Children.toArray(children).filter((child) => isValidElement(child) && child.type === Step), [children]);
    const reviewStep = useMemo(() => ({
        id: 'review-step',
        name: reviewLabel,
        component: (_jsx(Step, { label: reviewLabel, id: "review", children: _jsx(DescriptionList, { isHorizontal: true, isCompact: true, style: { paddingLeft: 16, paddingBottom: 16, paddingRight: 16 }, children: _jsx(DisplayModeContext.Provider, { value: DisplayMode.Details, children: children }) }) })),
    }), [children, reviewLabel]);
    const showValidation = useShowValidation();
    const stepHasValidationError = useStepHasValidationError();
    const stepShowValidation = useStepShowValidation();
    const steps = useMemo(() => {
        const steps = stepComponents.map((component) => ({
            id: component.props?.id,
            name: (_jsxs(Split, { hasGutter: true, children: [_jsx(SplitItem, { isFilled: true, children: component.props?.label }), (showValidation || stepShowValidation[component.props?.id]) &&
                        stepHasValidationError[component.props?.id] && (_jsx(SplitItem, { children: _jsx(Icon, { status: "danger", children: _jsx(ExclamationCircleIcon, {}) }) }))] })),
            component: _jsx(Fragment, { children: component }, component.props?.id),
        }));
        steps.push(reviewStep);
        return steps;
    }, [reviewStep, showValidation, stepComponents, stepHasValidationError, stepShowValidation]);
    return (_jsx(Fragment, { children: _jsx(PFWizard, { navAriaLabel: `${stepsAriaLabel}`, "aria-label": `${contentAriaLabel}`, footer: _jsx(MyFooter, { onSubmit: onSubmit, steps: stepComponents, submitButtonText: submitButtonText, submittingButtonText: submittingButtonText }), onClose: onCancel, children: steps.map(({ id, name, component }) => (_jsx(WizardStep, { id: id, name: name, children: component }, id))) }) }));
}
function MyFooter(props) {
    const { activeStep, goToNextStep: onNext, goToPrevStep: onBack, close: onClose } = useWizardContext();
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const { onSubmit, submitButtonText, submittingButtonText } = props;
    const { unknownError } = useStringContext();
    const onSubmitClickHandler = useCallback((data) => {
        async function asyncSubmit() {
            setSubmitError('');
            setSubmitting(true);
            try {
                await onSubmit(data);
            }
            catch (err) {
                if (err instanceof Error) {
                    setSubmitError(err.message);
                    return err.message;
                }
                else {
                    setSubmitError(unknownError);
                    return unknownError;
                }
            }
            finally {
                setSubmitting(false);
            }
            return undefined;
        }
        void asyncSubmit();
    }, [onSubmit, unknownError]);
    const data = useItem();
    const onSubmitClick = useCallback(() => {
        onSubmitClickHandler(data);
    }, [data, onSubmitClickHandler]);
    const setShowValidation = useSetShowValidation();
    const showWizardValidation = useShowValidation();
    const wizardHasValidationError = useHasValidationError();
    const { editorValidationStatus } = useEditorValidationStatus();
    const stepHasValidationError = useStepHasValidationError();
    const activeStepId = activeStep.id.toString();
    const activeStepHasValidationError = stepHasValidationError[activeStepId];
    const stepShowValidation = useStepShowValidation();
    const activeStepShowValidation = stepShowValidation[activeStepId];
    const setStepShowValidation = useSetStepShowValidation();
    const onNextClick = useCallback(async () => {
        const stepID = activeStep.id?.toString() ?? '';
        setStepShowValidation(stepID, true);
        if (!activeStepHasValidationError) {
            await onNext();
        }
    }, [activeStep.id, activeStepHasValidationError, onNext, setStepShowValidation]);
    const isLastStep = activeStep.id === 'review-step';
    useEffect(() => {
        if (isLastStep) {
            setShowValidation(true);
        }
        else {
            setSubmitError('');
        }
    }, [activeStep, setShowValidation, isLastStep]);
    const { fixValidationErrorsMsg, fixEditorValidationErrorsMsg, waitforEditorValidationErrorsMsg, submitText, submittingText, cancelButtonText, backButtonText, nextButtonText, } = useStringContext();
    if (isLastStep) {
        return (_jsxs("div", { className: "pf-v6-u-box-shadow-sm-top", children: [editorValidationStatus === EditorValidationStatus.failure && showWizardValidation && (_jsx(Alert, { title: fixEditorValidationErrorsMsg, isInline: true, variant: "danger" })), wizardHasValidationError && showWizardValidation && (_jsx(Alert, { title: fixValidationErrorsMsg, isInline: true, variant: "danger" })), editorValidationStatus === EditorValidationStatus.pending && showWizardValidation && (_jsx(Alert, { title: waitforEditorValidationErrorsMsg, isInline: true, variant: "warning" })), submitError && _jsx(Alert, { title: submitError, isInline: true, variant: "danger" }), _jsxs(WizardFooterWrapper, { children: [_jsxs(Button, { onClick: onSubmitClick, isDisabled: ((wizardHasValidationError || editorValidationStatus !== EditorValidationStatus.success) &&
                                showWizardValidation) ||
                                submitting, isLoading: submitting, type: "submit", children: [!submitButtonText && (submitting ? submittingText : submitText), submitting ? submittingButtonText : submitButtonText] }), _jsx(Button, { variant: "secondary", onClick: () => {
                                void (async () => {
                                    await onBack();
                                })();
                            }, children: backButtonText }), _jsx("div", { className: "pf-v6-c-wizard__footer-cancel", children: _jsx(Button, { variant: "link", onClick: onClose, children: cancelButtonText }) })] }), _jsx(RenderHiddenSteps, { stepComponents: props.steps })] }));
    }
    return (_jsxs("div", { className: "pf-v6-u-box-shadow-sm-top", children: [activeStepHasValidationError && activeStepShowValidation && (_jsx(Alert, { title: fixValidationErrorsMsg, isInline: true, variant: "danger" })), _jsxs(WizardFooterWrapper, { children: [_jsx(Button, { variant: "primary", onClick: () => {
                            void (async () => {
                                await onNextClick();
                            })();
                        }, isDisabled: (activeStepHasValidationError && activeStepShowValidation) || submitting, children: nextButtonText }), _jsx(Button, { variant: "secondary", onClick: () => {
                            void (async () => {
                                await onBack();
                            })();
                        }, isDisabled: activeStep.index === 1, children: backButtonText }), _jsx("div", { className: "pf-v6-c-wizard__footer-cancel", children: _jsx(Button, { variant: "link", onClick: onClose, children: cancelButtonText }) })] }), _jsx(RenderHiddenSteps, { stepComponents: props.steps })] }));
}
function RenderHiddenSteps(props) {
    const { activeStep } = useWizardContext();
    return (_jsx(DisplayModeContext.Provider, { value: DisplayMode.StepsHidden, children: _jsx("div", { style: { display: 'none' }, children: props.stepComponents.filter((component) => component.props.id !== activeStep.id.toString()) }) }));
}
function WizardDrawer(props) {
    const [yamlEditor] = useState(props.yamlEditor ?? undefined);
    return (_jsx(DrawerPanelContent, { isResizable: true, defaultSize: "600px", children: yamlEditor }));
}
//# sourceMappingURL=Wizard.js.map