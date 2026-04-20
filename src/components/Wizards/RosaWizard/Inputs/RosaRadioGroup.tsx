import {
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Radio as PfRadio,
} from '@patternfly/react-core';
import {
  createContext,
  Fragment,
  type ReactNode,
  useCallback,
  useContext,
  useId,
} from 'react';
import { useController, useFormContext, useFormState, type FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';
import { useRosaShowFieldErrorsAfterStepNav } from '../rosaWizardStepValidation';
import { fieldIdFromPath } from './fieldId';
import { Indented } from './Indented';
import { LabelHelp } from './components/LabelHelp';

export type RosaRadioGroupProps = {
  id?: string;
  path: FieldPath<RosaWizardFormData>;
  label?: string;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
  helperText?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  children?: ReactNode;
  onValueChange?: (value: unknown) => void;
};

type RadioGroupContextState = {
  value?: unknown;
  setValue?: (value: unknown) => void;
  readonly?: boolean;
  disabled?: boolean;
  radioGroup?: string;
};

const RadioGroupContext = createContext<RadioGroupContextState>({});
RadioGroupContext.displayName = 'RosaRadioGroupContext';

export function RosaRadioGroup(props: RosaRadioGroupProps) {
  const { control } = useFormContext<RosaWizardFormData>();
  const { isSubmitted } = useFormState({ control });
  const afterStepNav = useRosaShowFieldErrorsAfterStepNav();
  const id = fieldIdFromPath(props);
  const radioGroup = useId();

  const { field, fieldState } = useController({
    control,
    name: props.path,
  });

  const showError =
    !!fieldState.error && (fieldState.isTouched || isSubmitted || afterStepNav);

  const setGroupValue = useCallback(
    (value: unknown) => {
      field.onChange(value);
      props.onValueChange?.(value);
    },
    [field, props]
  );

  const state: RadioGroupContextState = {
    value: field.value,
    setValue: setGroupValue,
    readonly: props.readonly,
    disabled: props.disabled,
    radioGroup,
  };

  return (
    <RadioGroupContext.Provider value={state}>
      <div id={id}>
        <FormGroup
          fieldId={id}
          label={props.label}
          isRequired={props.required}
          labelHelp={
            <LabelHelp id={id} labelHelp={props.labelHelp} labelHelpTitle={props.labelHelpTitle} />
          }
        >
          {showError && fieldState.error?.message && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant="error">{fieldState.error.message}</HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
          {props.helperText && (
            <Content component={ContentVariants.small} style={{ paddingBottom: 8 }}>
              {props.helperText}
            </Content>
          )}
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            className="pf-v6-u-pt-xs"
          >
            {props.children}
          </Flex>
        </FormGroup>
      </div>
    </RadioGroupContext.Provider>
  );
}

export function Radio(props: {
  id: string;
  label: string;
  value: string | number | boolean | undefined;
  description?: string | React.ReactNode;
  children?: ReactNode;
  popover?: ReactNode;
}) {
  const radioGroupContext = useContext(RadioGroupContext);
  return (
    <Fragment>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsXs' }}
        flexWrap={{ default: 'nowrap' }}
      >
        <FlexItem>
          <PfRadio
            id={
              radioGroupContext.radioGroup
                ? props.id + '-' + radioGroupContext.radioGroup
                : props.id
            }
            label={props.label}
            isChecked={
              radioGroupContext.value === props.value ||
              (props.value === undefined && !radioGroupContext.value)
            }
            onChange={() => radioGroupContext.setValue?.(props.value)}
            isDisabled={radioGroupContext.disabled}
            readOnly={radioGroupContext.readonly}
            name={radioGroupContext.radioGroup ?? ''}
            description={props.description}
          />
        </FlexItem>
        {props.popover && <FlexItem className="pf-v6-u-pt-xs">{props.popover}</FlexItem>}
      </Flex>
      {radioGroupContext.value === props.value && (
        <Indented paddingBottom={8}>{props.children}</Indented>
      )}
    </Fragment>
  );
}
