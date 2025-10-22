/* Copyright Contributors to the Open Cluster Management project */
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Gallery,
} from "@patternfly/react-core";
import {
  Children,
  Fragment,
  isValidElement,
  ReactNode,
  useContext,
} from "react";
import { IRadioGroupContextState, RadioGroupContext } from "..";
import { DisplayMode } from "../contexts/DisplayModeContext";
import { InputCommonProps, useInput } from "./Input";
import { WizFormGroup } from "./WizFormGroup";

type WizTilesProps = InputCommonProps & { children?: ReactNode };

export function WizCardGroup(props: WizTilesProps) {
  const { displayMode: mode, value, setValue, hidden, id } = useInput(props);

  const state: IRadioGroupContextState = {
    value: value,
    setValue: setValue,
    readonly: props.readonly,
    disabled: props.disabled,
  };

  if (hidden) return <Fragment />;

  if (mode === DisplayMode.Details) {
    let label: string | undefined;
    Children.forEach(props.children, (child) => {
      if (!isValidElement(child)) return;
      if (child.type !== CardGroup) return;
      if (child.props.value === value) {
        label = child.props.label;
      }
    });
    if (label)
      return (
        <DescriptionListGroup>
          <DescriptionListTerm>{props.label}</DescriptionListTerm>
          <DescriptionListDescription id={id}>
            {label}
          </DescriptionListDescription>
        </DescriptionListGroup>
      );
    return <Fragment />;
  }

  return (
    <RadioGroupContext.Provider value={state}>
      <WizFormGroup {...props} id={id}>
        <Gallery hasGutter>{props.children}</Gallery>
      </WizFormGroup>
    </RadioGroupContext.Provider>
  );
}

export function CardGroup(props: any) {
  const context = useContext(RadioGroupContext);
  return (
    <div
      onClick={() => !props.isHostedDisabled && context.setValue?.(props.value)}
    >
      {props.children}
    </div>
  );
}
