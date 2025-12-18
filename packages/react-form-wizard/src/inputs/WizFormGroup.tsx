/* Copyright Contributors to the Open Cluster Management project */
import { PropsWithChildren } from 'react';
import { LabelHelp } from '../components/LabelHelp';
import { InputCommonProps, convertId } from './Input';
import { FormGroup } from '@patternfly/react-core';
import { WizHelperText } from '../components/WizHelperText';

type WizFormGroupProps = InputCommonProps & {
  noHelperText?: boolean;
  validatedOverride?: 'error' | undefined; // NEW
  errorOverride?: string;
};

export function WizFormGroup(props: PropsWithChildren<WizFormGroupProps>) {
  const { noHelperText } = props;
  const id = convertId(props);
  return (
    <FormGroup
      id={`${id}-form-group`}
      key={`${id}-form-group`}
      fieldId={id}
      label={props.label}
      isRequired={props.required}
      labelHelp={
        <LabelHelp id={id} labelHelp={props.labelHelp} labelHelpTitle={props.labelHelpTitle} />
      }
    >
      {props.children}
      {!noHelperText && (
        <WizHelperText
          {...props}
          validatedOverride={props.validatedOverride}
          errorOverride={props.errorOverride}
        />
      )}
    </FormGroup>
  );
}
