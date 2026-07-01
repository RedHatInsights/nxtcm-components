import {
  type FormEvent,
  type FocusEvent,
  type FocusEventHandler,
  type ReactNode,
  useMemo,
} from 'react';
import {
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type UseControllerReturn,
  type UseFormSetValue,
  type UseFormTrigger,
  useController,
  useFormContext,
  useFormState,
  type UseFormGetFieldState,
  type UseFormReturn,
} from 'react-hook-form';

import { requiredFromYup } from '../../../utilities/yupFieldRequired';
import { TextInput, type TextInputProps } from '../../Fields/TextInput';
import { wizardFieldMetaByPath } from '../../../yupSchemas';
import { useWizFieldPresentation } from '../wizFieldPresentation';
import { useWizStepValidationRevealed } from '../../../rosaHcpWizardValidationContext';
import {
  useWizRhfControl,
  wizFieldShowsErrorMessage,
  type WizRhfBoundFieldProps,
} from '../wizFieldRhf';
import { FieldWithAPIErrorAlert } from '../../FieldWithAPIErrorAlert';

type WizTextInputControlledKeys =
  | 'value'
  | 'onChange'
  | 'onBlur'
  | 'errorMessage'
  | 'isError'
  | 'name';

type WizTextInputSpreadProps = Omit<
  TextInputProps,
  | WizTextInputControlledKeys
  | 'id'
  | 'label'
  | 'isRequired'
  | 'required'
  | 'helperText'
  | 'labelHelp'
  | 'labelHelpTitle'
  | 'placeholder'
> &
  Partial<
    Pick<
      TextInputProps,
      | 'id'
      | 'label'
      | 'isRequired'
      | 'required'
      | 'helperText'
      | 'labelHelp'
      | 'labelHelpTitle'
      | 'placeholder'
    >
  >;

export type WizTextInputProps<TFieldValues extends FieldValues = FieldValues> =
  WizTextInputSpreadProps &
    WizRhfBoundFieldProps<TFieldValues> & {
      /**
       * Optional API/load failure content shown in `FieldWithAPIErrorAlert` when set.
       */
      apiError?: ReactNode | string;
      /** When true, refresh/retry UI in the alert reflects loading state. */
      isFetching?: boolean;
      /**
       * When true, Yup validation runs on blur only (not on each keystroke after touch).
       * When omitted and `schema` is set, reads {@link WizardFieldMeta.validateOnBlur} for `name`.
       */
      validateOnBlur?: boolean;
      /** Optional async validation message merged into field error display. */
      supplementalErrorMessage?: ReactNode | string;
      /** Fires after react-hook-form blur handling (e.g. async validation side effects). */
      onBlur?: FocusEventHandler<HTMLInputElement>;
    };

type WizTextInputResolvedPresentation = {
  id: string;
  label: string;
  helperText: ReactNode | undefined;
  labelHelp: ReactNode | undefined;
  labelHelpTitle: string | undefined;
  placeholder: string | undefined;
  isRequired: boolean | undefined;
};

type WizTextInputBoundFieldProps<TFieldValues extends FieldValues> = {
  rest: Omit<
    WizTextInputProps<TFieldValues>,
    | keyof WizRhfBoundFieldProps<TFieldValues>
    | 'validateOnBlur'
    | 'onBlur'
    | 'supplementalErrorMessage'
  >;
  name: FieldPath<TFieldValues>;
  requiredProp: boolean | undefined;
  presentation: WizTextInputResolvedPresentation;
  controller: UseControllerReturn<TFieldValues, FieldPath<TFieldValues>>;
  subscribedFieldState: ReturnType<UseFormGetFieldState<TFieldValues>>;
  supplementalErrorMessage?: ReactNode | string;
  apiError?: ReactNode | string;
  isFetching?: boolean;
  onBlurProp?: FocusEventHandler<HTMLInputElement>;
  validationRevealed?: boolean;
};

function resolveValidateOnBlur<TFieldValues extends FieldValues>(
  schema: WizTextInputProps<TFieldValues>['schema'],
  name: FieldPath<TFieldValues>,
  validateOnBlur?: boolean
): boolean {
  const validateOnBlurFromMeta =
    schema === undefined ? undefined : wizardFieldMetaByPath(String(name))?.validateOnBlur;
  return validateOnBlur ?? validateOnBlurFromMeta ?? false;
}

const EMPTY_SUBSCRIBED_FIELD_STATE = {
  invalid: false,
  isDirty: false,
  isTouched: false,
  isValidating: false,
  error: undefined,
} as ReturnType<UseFormGetFieldState<FieldValues>>;

async function handleWizTextInputValidateOnBlur<TFieldValues extends FieldValues>(
  event: FocusEvent<HTMLInputElement>,
  name: FieldPath<TFieldValues>,
  setValue: UseFormSetValue<TFieldValues>,
  trigger: UseFormTrigger<TFieldValues>,
  onBlurProp?: FocusEventHandler<HTMLInputElement>
): Promise<void> {
  const value = event.target.value;
  setValue(name, value as FieldPathValue<TFieldValues, typeof name>, {
    shouldTouch: true,
  });
  await trigger(name);
  await Promise.resolve(onBlurProp?.(event));
}

function renderWizTextInputField<TFieldValues extends FieldValues>({
  rest,
  requiredProp,
  presentation,
  controller,
  subscribedFieldState,
  supplementalErrorMessage,
  validationRevealed,
  onChange,
  onBlur,
}: WizTextInputBoundFieldProps<TFieldValues> & {
  onChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  onBlur: FocusEventHandler<HTMLInputElement>;
}) {
  const { field, fieldState, formState } = controller;
  const errorMessage =
    supplementalErrorMessage ?? fieldState.error?.message ?? subscribedFieldState.error?.message;
  const isTouched = fieldState.isTouched || subscribedFieldState.isTouched;
  const showError = wizFieldShowsErrorMessage(
    errorMessage,
    isTouched,
    formState.isSubmitted || validationRevealed === true,
    supplementalErrorMessage ? { showWithoutTouch: true } : undefined
  );

  return (
    <TextInput
      {...rest}
      id={presentation.id}
      label={presentation.label}
      placeholder={presentation.placeholder}
      helperText={presentation.helperText}
      labelHelp={presentation.labelHelp}
      labelHelpTitle={presentation.labelHelpTitle}
      isRequired={presentation.isRequired}
      required={requiredProp}
      name={field.name}
      ref={field.ref}
      value={field.value ?? ''}
      onBlur={onBlur}
      onChange={onChange}
      errorMessage={errorMessage}
      isError={showError}
    />
  );
}

function WizTextInputStandard<TFieldValues extends FieldValues>(
  props: WizTextInputBoundFieldProps<TFieldValues>
) {
  const { controller, onBlurProp } = props;
  const { field } = controller;

  return renderWizTextInputField({
    ...props,
    onChange: (_event, value) => {
      field.onChange(value);
    },
    onBlur: (event) => {
      field.onBlur();
      onBlurProp?.(event);
    },
  });
}

const WIZ_TEXT_INPUT_VALIDATE_ON_BLUR_CONTROL_ONLY_ERROR =
  'WizTextInputBound: `validateOnBlur` requires FormProvider and cannot be used with control-only mounts (when only `control` is passed). Wrap the field with <FormProvider {...methods}> or omit `validateOnBlur`.';

function WizTextInputValidateOnBlur<TFieldValues extends FieldValues>(
  props: WizTextInputBoundFieldProps<TFieldValues> & {
    setValue: UseFormSetValue<TFieldValues>;
    trigger: UseFormTrigger<TFieldValues>;
  }
) {
  const { name, onBlurProp, setValue, trigger } = props;

  return renderWizTextInputField({
    ...props,
    onChange: (_event, value) => {
      setValue(name, value as FieldPathValue<TFieldValues, typeof name>, {
        shouldValidate: false,
        shouldDirty: true,
      });
    },
    onBlur: (event) => {
      void handleWizTextInputValidateOnBlur(event, name, setValue, trigger, onBlurProp);
    },
  });
}

/**
 * Prefer wrapping the form with `FormProvider` so you can omit `control`.
 * Optional `schema` pulls UI defaults and required state from Yup `.meta()` / optionality.
 * You may set `id`, `label`, `placeholder`, `helperText`, `labelHelp`, and `labelHelpTitle` via props. When omitted, Yup `.meta()` may supply inline copy or `*Key` paths resolved from `RosaHcpWizardStringsProvider`.
 * Pass `isRequired` (and optionally native `required`) to override; when `isRequired` is omitted and `schema` is set, required UI follows Yup for this path. `TextInput` applies `required={isRequired || required}` on the input.
 */
export function WizTextInput<TFieldValues extends FieldValues = FieldValues>(
  props: WizTextInputProps<TFieldValues>
) {
  const {
    name,
    control: controlProp,
    schema,
    yupDescribeOptions,
    isRequired: isRequiredProp,
    required: requiredProp,
    id: idProp,
    label: labelProp,
    helperText: helperTextProp,
    labelHelp: labelHelpProp,
    labelHelpTitle: labelHelpTitleProp,
    placeholder: placeholderProp,
    apiError,
    isFetching,
    validateOnBlur: validateOnBlurProp,
    supplementalErrorMessage,
    onBlur: onBlurProp,
    ...rest
  } = props;

  const validateOnBlur = useMemo(
    () => resolveValidateOnBlur(schema, name, validateOnBlurProp),
    [name, schema, validateOnBlurProp]
  );

  const control = useWizRhfControl<TFieldValues>('WizTextInput', controlProp);
  /** RHF default context is `null` when `FormProvider` is not used (control-only harness). */
  const formContext = useFormContext<TFieldValues>() as UseFormReturn<TFieldValues> | null;

  if (validateOnBlur && formContext == null) {
    throw new Error(WIZ_TEXT_INPUT_VALIDATE_ON_BLUR_CONTROL_ONLY_ERROR);
  }

  const formState = useFormState({ control });
  const subscribedFieldState =
    formContext?.getFieldState(name, formState) ?? EMPTY_SUBSCRIBED_FIELD_STATE;
  const presentationProps = useWizFieldPresentation({
    name,
    schema,
    yupDescribeOptions,
    idProp,
    labelProp,
    helperTextProp,
    labelHelpProp,
    labelHelpTitleProp,
    placeholderProp,
    labelMode: 'stringField',
    includePlaceholder: true,
  });
  const isRequired = isRequiredProp ?? requiredFromYup(schema, name, yupDescribeOptions);
  const stepValidationRevealed = useWizStepValidationRevealed(String(name));
  const controller = useController({ name, control });
  const boundProps: WizTextInputBoundFieldProps<TFieldValues> = {
    rest,
    name,
    requiredProp,
    presentation: {
      ...presentationProps,
      isRequired,
    },
    controller,
    subscribedFieldState,
    supplementalErrorMessage,
    apiError,
    isFetching,
    onBlurProp,
    validationRevealed: stepValidationRevealed,
  };

  const textInput = validateOnBlur ? (
    <WizTextInputValidateOnBlur
      {...boundProps}
      setValue={formContext!.setValue}
      trigger={formContext!.trigger}
    />
  ) : (
    <WizTextInputStandard {...boundProps} />
  );

  if (apiError) {
    return (
      <FieldWithAPIErrorAlert
        error={apiError}
        isFetching={isFetching ?? false}
        fieldName={presentationProps.label}
      >
        {textInput}
      </FieldWithAPIErrorAlert>
    );
  }

  return textInput;
}
