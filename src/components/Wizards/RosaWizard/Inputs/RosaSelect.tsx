/* Derived from @patternfly-labs/react-form-wizard WizSelect (Apache-2.0). */
import { Button } from '@patternfly/react-core';
import get from 'get-value';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useController, useFormContext, useFormState, type FieldPath } from 'react-hook-form';
import { RedoIcon } from '@patternfly/react-icons';
import type { RosaWizardFormData } from '../../types';
import { useRosaShowFieldErrorsAfterStepNav } from '../rosaWizardStepValidation';
import { useWizardFooterStrings } from '../wizardFooterStrings';
import { fieldIdFromPath } from './fieldId';
import { TypeaheadSelectField } from './components/Select';
import {
  extractOptionValue,
  type Option,
  type OptionGroup,
  type OptionType,
  type NormalizedOptionGroup,
} from './RosaSelectTypes';

function lowercaseFirst(label: string) {
  if (label) {
    return label[0].toLowerCase() + label.substring(1);
  }
  return label;
}

export type RosaSelectProps<T = unknown> = {
  id?: string;
  path: FieldPath<RosaWizardFormData>;
  label: string;
  placeholder?: string;
  labelHelp?: React.ReactNode;
  labelHelpTitle?: string;
  helperText?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  validation?: (value: T, item?: RosaWizardFormData) => string | undefined;
  keyPath?: string;
  options?: (Option<T> | string | number)[];
  optionGroups?: OptionGroup<T>[];
  isFill?: boolean;
  refreshCallback?: () => void;
  isPending?: boolean;
  onValueChange?: (value: unknown, item?: RosaWizardFormData) => void;
  callbackFunction?: (value: unknown) => void;
};

export function RosaSelect<T = unknown>(props: RosaSelectProps<T>) {
  const { required: requiredMsg, noResults, moreInfo } = useWizardFooterStrings();
  const { control, getValues } = useFormContext<RosaWizardFormData>();
  const { isSubmitted } = useFormState({ control });
  const afterStepNav = useRosaShowFieldErrorsAfterStepNav();
  const id = fieldIdFromPath(props);
  const placeholder = props.placeholder ?? `Select the ${lowercaseFirst(props.label)}`;
  const keyPath = props.keyPath ?? 'value';
  const [open, setOpen] = useState(false);
  const [localSelection, setLocalSelection] = useState<string | number | null>(null);

  const { field, fieldState } = useController({
    control,
    name: props.path,
    rules: {
      validate: (value) => {
        if (
          props.required &&
          (value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0))
        ) {
          return requiredMsg;
        }
        const err = props.validation?.(value as T, getValues());
        return err ? err : true;
      },
    },
  });

  const value = field.value;

  function normalizeOption(option: Option<T> | string | number): OptionType<T> {
    let idPart: string;
    let label: string;
    let optValue: string | number | T;
    let keyedValue: string | number;
    let description: string | undefined;
    let disabled: boolean | undefined;
    let ariaDisabled: boolean | undefined;
    let tooltipProps: Option<T>['tooltipProps'];
    if (typeof option === 'string' || typeof option === 'number') {
      idPart = option.toString();
      label = option.toString();
      optValue = option;
      keyedValue = option;
    } else {
      idPart = option.id ?? option.label;
      label = option.label;
      optValue = option.value;
      description = option.description;
      disabled = option.disabled;
      ariaDisabled = option.ariaDisabled;
      tooltipProps = option.tooltipProps;
      let rawKeyed: unknown;
      if (typeof optValue === 'object' && optValue !== null && !Array.isArray(optValue)) {
        rawKeyed = get(optValue as object, keyPath);
      } else {
        rawKeyed = optValue;
      }
      if (rawKeyed === undefined || rawKeyed === null) {
        keyedValue = '';
      } else if (typeof rawKeyed === 'string' || typeof rawKeyed === 'number') {
        keyedValue = rawKeyed;
      } else {
        keyedValue = String(rawKeyed);
      }
    }
    return {
      id: idPart,
      label,
      value: optValue,
      keyedValue,
      description,
      disabled,
      ariaDisabled,
      tooltipProps,
    };
  }

  const selectOptions: OptionType<T>[] | undefined = useMemo(() => {
    if (props.optionGroups) {
      return props.optionGroups.flatMap((group) =>
        (group.options ?? []).map((opt) => normalizeOption(opt))
      );
    }
    return props.options?.map((opt) => normalizeOption(opt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options, props.optionGroups, keyPath]);

  const normalizedOptionGroups: NormalizedOptionGroup<T>[] | undefined = useMemo(() => {
    if (!props.optionGroups) return undefined;
    return props.optionGroups.map((group) => ({
      label: group.label,
      options: (group.options ?? []).map((opt) => normalizeOption(opt)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.optionGroups, keyPath]);

  const hasOptionGroups = normalizedOptionGroups != null && normalizedOptionGroups.length > 0;

  const selectedOptionId = useMemo(() => {
    const val = value === '' ? '' : value != null && value !== '' ? value : localSelection;
    if (val == null || val === '') return '';
    const opt = selectOptions?.find(
      (o) =>
        o.keyedValue === val ||
        o.value === val ||
        String(o.keyedValue) === String(val) ||
        o.id === String(val)
    );
    return opt?.id ?? '';
  }, [localSelection, selectOptions, value]);

  const displayValue = (() => {
    const val = value === '' ? '' : value != null && value !== '' ? value : localSelection;
    if (val == null || val === '') return '';
    if (typeof val === 'string' || typeof val === 'number') {
      const option = selectOptions?.find(
        (o) => o.keyedValue === val || o.value === val || String(o.keyedValue) === String(val)
      );
      const lbl = option?.label;
      return typeof lbl === 'string'
        ? lbl
        : typeof option?.value === 'string' || typeof option?.value === 'number'
          ? String(option.value)
          : String(val);
    }
    if (typeof val === 'object') {
      const o = val as Record<string, unknown>;
      if (typeof o.label === 'string') return o.label;
      if (typeof o.value === 'string' || typeof o.value === 'number') return String(o.value);
      return '';
    }
    return '';
  })();

  useEffect(() => {
    if (value != null && value !== '') {
      setLocalSelection(value as string | number);
    } else {
      setLocalSelection(null);
    }
  }, [value]);

  const onSelect = useCallback(
    (selectOptionObject: string | undefined) => {
      const idOption = selectOptions?.find((o) => o.id === selectOptionObject);
      if (idOption) {
        setLocalSelection(idOption.keyedValue);
        props.callbackFunction?.(idOption.value);
        field.onChange(idOption.value);
        props.onValueChange?.(idOption.value, getValues());
      } else {
        setLocalSelection(null);
        /** RHF often keeps the previous value when passed `undefined`; empty string clears the VPC id. */
        const cleared = selectOptionObject ?? '';
        field.onChange(cleared as typeof field.value);
        props.onValueChange?.(cleared, getValues());
      }
      setOpen(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field, selectOptions, getValues]
  );

  const showError = !!fieldState.error && (fieldState.isTouched || isSubmitted || afterStepNav);

  if (props.optionGroups && props.options) {
    throw new Error('Use either options or optionGroups, not both');
  }

  return (
    <TypeaheadSelectField
      id={id}
      fieldId={id}
      label={props.label}
      isRequired={props.required}
      labelHelp={props.labelHelp}
      labelHelpTitle={props.labelHelpTitle}
      labelHelpButtonAriaLabel={moreInfo}
      helperText={props.helperText}
      errorMessage={fieldState.error?.message}
      showError={showError}
      isFill={props.isFill}
      refreshSlot={
        props.refreshCallback ? (
          <Button
            variant="control"
            aria-label="Refresh"
            onClick={props.refreshCallback}
            icon={<RedoIcon />}
            isDisabled={props.isPending}
          />
        ) : undefined
      }
      open={open}
      setOpen={setOpen}
      allFlatOptions={selectOptions ?? []}
      allGroups={normalizedOptionGroups}
      hasGroups={hasOptionGroups}
      committedDisplay={displayValue}
      selectedOptionId={selectedOptionId}
      onCommit={onSelect}
      noResultsLabel={noResults}
      disabled={!!props.disabled}
      validated={showError ? 'error' : undefined}
      placeholder={placeholder}
      isPending={props.isPending}
      listboxId={`${id}-typeahead-listbox`}
      onMenuSelect={(_event, val) => onSelect(extractOptionValue(val) ?? '')}
    />
  );
}
