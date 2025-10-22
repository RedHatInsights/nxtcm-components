/* Copyright Contributors to the Open Cluster Management project */
import { Form } from "@patternfly/react-core";
import { Fragment, ReactNode, useLayoutEffect } from "react";
import { DisplayMode, useDisplayMode } from "./contexts/DisplayModeContext";
import { HasInputsProvider, useHasInputs } from "./contexts/HasInputsProvider";
import {
  ShowValidationProvider,
  useSetShowValidation,
} from "./contexts/ShowValidationProvider";
import { useSetStepHasInputs } from "./contexts/StepHasInputsProvider";
import { useStepShowValidation } from "./contexts/StepShowValidationProvider";
import { useSetStepHasValidationError } from "./contexts/StepValidationProvider";
import {
  useHasValidationError,
  ValidationProvider,
} from "./contexts/ValidationProvider";
import { HiddenFn, useInputHidden } from "./inputs/Input";

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
  console.log("PROPS IN ExpandableStep", props)
  return (
    <div id={props.id}>
      <HasInputsProvider key={props.id}>
        <ShowValidationProvider>
          <ValidationProvider>
            <ExpandableStepInternal {...props}>
              {props.children}
            </ExpandableStepInternal>
          </ValidationProvider>
        </ShowValidationProvider>
      </HasInputsProvider>
    </div>
  );
}

export function ExpandableStepInternal(props: ExpandableStepProps) {
  const displayMode = useDisplayMode();
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
  useLayoutEffect(() => {
    if (displayMode !== DisplayMode.Details)
      setStepHasValidationError(props.id, hasValidationError);
  }, [hasValidationError, displayMode, props.id, setStepHasValidationError]);

  const hasInputs = useHasInputs();
  const setStepHasInputs = useSetStepHasInputs();
  useLayoutEffect(() => {
    if (displayMode !== DisplayMode.Details) {
      setStepHasInputs(props.id, hasInputs);
    }
  }, [hasInputs, displayMode, props.id, setStepHasInputs]);

  if(props.steps && props.steps.length > 0) {
    return null
  }

  const hidden = useInputHidden(props);
  if (hidden && props.autohide !== false) return <Fragment />;

  if (displayMode === DisplayMode.Details) {
    return (
      <Fragment>
        {props.children}
        {props.steps}
      </Fragment>
    );
  }
console.log("PROPSDAZ", props)
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
