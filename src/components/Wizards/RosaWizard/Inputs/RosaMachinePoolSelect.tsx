/* Derived from @patternfly-labs/react-form-wizard WizMachinePoolSelect (Apache-2.0). */
import { Button, Content, ContentVariants, Grid, GridItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Fragment, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useController, useFormContext, useFormState, type FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';
import { useRosaShowFieldErrorsAfterStepNav } from '../rosaWizardStepValidation';
import { useWizardFooterStrings } from '../wizardFooterStrings';
import { fieldIdFromPath } from './fieldId';
import { TypeaheadSelectField } from './components/Select';
import { extractOptionValue, type Option, type OptionType } from './RosaSelectTypes';

export type MachinePoolSubnet = {
  machine_pool_subnet?: string;
};

export type RosaMachinePoolSelectProps = {
  id?: string;
  path: FieldPath<RosaWizardFormData>;
  machinePoolLabel: string;
  selectPlaceholder: string;
  subnetLabel: string;
  addMachinePoolBtnLabel: string;
  subnetOptions?: Option<string>[];
  newValue?: MachinePoolSubnet;
  minItems?: number;
  required?: boolean;
};

interface MachinePoolRowProps {
  index: number;
  value: string;
  machinePoolLabel: string;
  subnetColumnLabel: string;
  /** Stable id prefix from {@link fieldIdFromPath} for the machine pool control. */
  baseFieldId: string;
  selectPlaceholder: string;
  subnetOptions?: Option<string>[];
  selectedSubnets?: string[];
  onChange: (value: string) => void;
  onRemove: () => void;
  required?: boolean;
  showErrorsAfterStepNav?: boolean;
  /** Align with {@link RosaSelect}: only show danger state when RHF has validated the list field. */
  listFieldHasRhfError: boolean;
}

function MachinePoolRow(props: MachinePoolRowProps) {
  const {
    index,
    value,
    machinePoolLabel,
    subnetColumnLabel,
    baseFieldId,
    selectPlaceholder,
    subnetOptions,
    selectedSubnets,
    onChange,
    onRemove,
    required,
    showErrorsAfterStepNav = false,
    listFieldHasRhfError,
  } = props;

  const [open, setOpen] = useState(false);
  const { required: requiredErrorMessage, noResults } = useWizardFooterStrings();
  const { isSubmitted } = useFormState();

  const rowFieldId = `${baseFieldId}-row-${index}-subnet`;
  const hasError = Boolean(required && !value);
  const showRowError = Boolean(
    hasError && listFieldHasRhfError && (isSubmitted || showErrorsAfterStepNav)
  );

  const selectOptionsTyped: OptionType<string>[] | undefined = useMemo(() => {
    if (!subnetOptions) return [];
    return subnetOptions
      .filter((option) => option.value === value || !selectedSubnets?.includes(option.value))
      .map((option) => ({
        id: option.id ?? option.value,
        label: option.label,
        value: option.value,
        keyedValue: option.value,
        description: option.description,
      }));
  }, [subnetOptions, selectedSubnets, value]);

  const selectedSubnetOptionId = useMemo(() => {
    if (!value) return '';
    const opt = selectOptionsTyped?.find((o) => o.value === value || o.keyedValue === value);
    return opt?.id ?? value;
  }, [selectOptionsTyped, value]);

  const subnetDisplayLabel = useMemo(() => {
    if (!value) return '';
    const opt = selectOptionsTyped?.find((o) => o.value === value || o.keyedValue === value);
    return opt?.label ?? value;
  }, [selectOptionsTyped, value]);

  const onSelect = useCallback(
    (selectOptionObject: string | undefined) => {
      onChange(selectOptionObject ?? '');
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Grid hasGutter>
      <GridItem span={3}>
        <Content component={ContentVariants.p} className="pf-v6-u-pt-sm">
          {machinePoolLabel} {index + 1}
        </Content>
      </GridItem>
      <GridItem span={5}>
        <TypeaheadSelectField
          id={rowFieldId}
          fieldId={rowFieldId}
          label={`${subnetColumnLabel} ${index + 1}`}
          isLabelVisuallyHidden
          isRequired={required}
          errorMessage={requiredErrorMessage}
          showError={showRowError}
          isFill
          open={open}
          setOpen={setOpen}
          allFlatOptions={selectOptionsTyped ?? []}
          hasGroups={false}
          committedDisplay={subnetDisplayLabel}
          selectedOptionId={selectedSubnetOptionId}
          onCommit={onSelect}
          noResultsLabel={noResults}
          disabled={false}
          validated={showRowError ? 'error' : undefined}
          placeholder={selectPlaceholder}
          listboxId={`${rowFieldId}-typeahead-listbox`}
          onMenuSelect={(_event, val) => onSelect(extractOptionValue(val) ?? '')}
        />
      </GridItem>
      <GridItem span={2}>
        <Button
          variant="plain"
          aria-label={`Remove machine pool ${index + 1}`}
          onClick={onRemove}
          className="pf-v6-u-pt-sm"
        >
          <MinusCircleIcon />
        </Button>
      </GridItem>
    </Grid>
  );
}

export function RosaMachinePoolSelect(props: RosaMachinePoolSelectProps) {
  const id = fieldIdFromPath(props);
  const afterStepNav = useRosaShowFieldErrorsAfterStepNav();
  const { control } = useFormContext<RosaWizardFormData>();
  const { required: requiredErrorMessage } = useWizardFooterStrings();
  const path = props.path;
  const minItems = props.minItems ?? 1;

  const { field, fieldState } = useController({
    control,
    name: path,
    rules: {
      validate: (val) => {
        if (!props.required) return true;
        const arr = (Array.isArray(val) ? val : []) as MachinePoolSubnet[];
        if (arr.length < minItems) return requiredErrorMessage;
        const hasEmpty = arr.some(
          (r) => !r?.machine_pool_subnet || String(r.machine_pool_subnet).trim() === ''
        );
        return hasEmpty ? requiredErrorMessage : true;
      },
    },
  });

  const values = useMemo(
    () => (Array.isArray(field.value) ? (field.value as MachinePoolSubnet[]) : []),
    [field.value]
  );

  const selectedSubnets = useMemo(() => {
    return values
      .map((pool) => pool.machine_pool_subnet)
      .filter((subnet): subnet is string => !!subnet);
  }, [values]);

  const setArrayValue = useCallback(
    (newArray: MachinePoolSubnet[]) => {
      field.onChange(newArray as never);
    },
    [field]
  );

  useLayoutEffect(() => {
    if (values.length < minItems && values.length === 0) {
      const initial: MachinePoolSubnet[] = [];
      for (let i = 0; i < minItems; i++) {
        initial.push(props.newValue ?? { machine_pool_subnet: '' });
      }
      setArrayValue(initial);
    }
  }, [values.length, minItems, props.newValue, setArrayValue]);

  const removeItem = useCallback(
    (index: number) => {
      if (values.length <= minItems) {
        const newArray = [...values];
        newArray[index] = { ...newArray[index], machine_pool_subnet: '' };
        setArrayValue(newArray);
        return;
      }
      const newArray = [...values];
      newArray.splice(index, 1);
      setArrayValue(newArray);
    },
    [setArrayValue, values, minItems]
  );

  const updateItem = useCallback(
    (index: number, newValue: string) => {
      const newArray = [...values];
      newArray[index] = { ...newArray[index], machine_pool_subnet: newValue };
      setArrayValue(newArray);
    },
    [setArrayValue, values]
  );

  return (
    <Grid hasGutter span={12} id={id}>
      <GridItem span={3}>
        <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
          {props.machinePoolLabel}
        </Content>
      </GridItem>
      <GridItem span={5}>
        <div className="pf-v6-c-form__label pf-v6-u-font-weight-bold">
          <span className="pf-v6-c-form__label-text">{props.subnetLabel}</span>
        </div>
      </GridItem>

      <GridItem>
        {values.map((pool, index) => (
          <Fragment key={`${pool?.machine_pool_subnet ?? 'unset'}-${index}`}>
            <MachinePoolRow
              index={index}
              value={pool.machine_pool_subnet ?? ''}
              machinePoolLabel={props.machinePoolLabel}
              subnetColumnLabel={props.subnetLabel}
              baseFieldId={id}
              selectPlaceholder={props.selectPlaceholder}
              subnetOptions={props.subnetOptions}
              selectedSubnets={selectedSubnets}
              required={props.required}
              showErrorsAfterStepNav={afterStepNav}
              listFieldHasRhfError={!!fieldState.error}
              onChange={(newValue) => updateItem(index, newValue)}
              onRemove={() => removeItem(index)}
            />
          </Fragment>
        ))}
      </GridItem>
    </Grid>
  );
}
