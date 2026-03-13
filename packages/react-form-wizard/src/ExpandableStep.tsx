/* Copyright Contributors to the Open Cluster Management project */
import { Form } from '@patternfly/react-core';
import { Fragment, isValidElement, ReactElement, ReactNode, useLayoutEffect } from 'react';
import { DisplayMode, useDisplayMode } from './contexts/DisplayModeContext';
import { HasInputsProvider, useHasInputs } from './contexts/HasInputsProvider';
import { ShowValidationProvider, useSetShowValidation } from './contexts/ShowValidationProvider';
import { useSetStepHasInputs } from './contexts/StepHasInputsProvider';
import { useStepShowValidation } from './contexts/StepShowValidationProvider';
import {
  useSetStepHasValidationError,
  useStepHasValidationError,
} from './contexts/StepValidationProvider';
import { useHasValidationError, ValidationProvider } from './contexts/ValidationProvider';
import { HiddenFn, useInputHidden } from './inputs/Input';

export interface ExpandableStepProps {
  label: string;
  id: string;
  children?: ReactNode;
  hidden?: HiddenFn;
  autohide?: boolean;

  isExpandable?: boolean;
  steps?: React.ReactNode[];
}

export function ExpandableStep(props: ExpandableStepProps) {
  return (
    <div id={props.id}>
      <HasInputsProvider key={props.id}>
        <ShowValidationProvider>
          <ValidationProvider>
            <ExpandableStepInternal {...props}>{props.children}</ExpandableStepInternal>
          </ValidationProvider>
        </ShowValidationProvider>
      </HasInputsProvider>
    </div>
  );
}

export function ExpandableStepInternal(props: ExpandableStepProps) {
  const displayMode = useDisplayMode();
  const hidden = useInputHidden(props);
  const setShowValidation = useSetShowValidation();
  const stepShowValidation = useStepShowValidation();
  useLayoutEffect(() => {
    if (displayMode !== DisplayMode.Details) {
      if (stepShowValidation[props.id]) {
        setShowValidation(true);
      }
    }
  }, [displayMode, props.id, setShowValidation, stepShowValidation]);

  const hasValidationError = useHasValidationError();
  const setStepHasValidationError = useSetStepHasValidationError();
  const stepHasValidationError = useStepHasValidationError();
  useLayoutEffect(() => {
    if (displayMode !== DisplayMode.Details)
      setStepHasValidationError(props.id, hasValidationError);
  }, [hasValidationError, displayMode, props.id, setStepHasValidationError]);

  // When this expandable step has sub-steps, also set this step's id to have an error if any substep has an error (for nav icon)
  useLayoutEffect(() => {
    if (displayMode === DisplayMode.Details || !props.steps?.length) return;
    const stepIds = props.steps
      .filter(
        (s): s is ReactElement<{ id?: string }> =>
          isValidElement(s) && typeof (s as ReactElement<{ id?: string }>).props?.id === 'string'
      )
      .map((s) => (s as ReactElement<{ id: string }>).props.id);
    const anySubStepHasError = stepIds.some((id) => stepHasValidationError[id]);
    setStepHasValidationError(props.id, anySubStepHasError);
  }, [displayMode, props.id, props.steps, setStepHasValidationError, stepHasValidationError]);

  const hasInputs = useHasInputs();
  const setStepHasInputs = useSetStepHasInputs();
  useLayoutEffect(() => {
    if (displayMode !== DisplayMode.Details) {
      setStepHasInputs(props.id, hasInputs);
    }
  }, [hasInputs, displayMode, props.id, setStepHasInputs]);

  if (props.steps && props.steps.length > 0) {
    return null;
  }

  if (hidden && props.autohide !== false) return <Fragment />;

  if (displayMode === DisplayMode.Details) {
    return (
      <Fragment>
        {props.children}
        {props.steps}
      </Fragment>
    );
  }

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      {props.isExpandable && props.steps ? props.steps : props.children}
    </Form>
  );
}
