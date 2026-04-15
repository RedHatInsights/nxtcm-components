/* Derived from @patternfly-labs/react-form-wizard WizMachinePoolSelect (Apache-2.0). */
import {
  Button,
  Content,
  ContentVariants,
  FormHelperText,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Fragment, useCallback, useLayoutEffect, useMemo, useState, type Ref } from 'react';
import { useFormContext, useFormState, useWatch, type FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../../types';
import { useRosaShowFieldErrorsAfterStepNav } from '../rosaWizardStepValidation';
import { useWizardFooterStrings } from '../wizardFooterStrings';
import { fieldIdFromPath } from './fieldId';
import {
  RosaTypeaheadFieldProvider,
  RosaTypeaheadMenu,
  RosaTypeaheadPfSelect,
  RosaTypeaheadToggle,
} from './RosaInputSelect';
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
  selectPlaceholder: string;
  subnetOptions?: Option<string>[];
  selectedSubnets?: string[];
  onChange: (value: string) => void;
  onRemove: () => void;
  required?: boolean;
  showErrorsAfterStepNav?: boolean;
}

function MachinePoolRow(props: MachinePoolRowProps) {
  const {
    index,
    value,
    machinePoolLabel,
    selectPlaceholder,
    subnetOptions,
    selectedSubnets,
    onChange,
    onRemove,
    required,
    showErrorsAfterStepNav = false,
  } = props;

  const [open, setOpen] = useState(false);
  const { required: requiredErrorMessage } = useWizardFooterStrings();
  const { isSubmitted } = useFormState();

  const hasError = Boolean(required && !value);
  const validated =
    hasError && (isSubmitted || showErrorsAfterStepNav) ? 'error' : undefined;

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
      <GridItem span={5} rowSpan={2}>
        <InputGroup>
          <InputGroupItem isFill>
            <RosaTypeaheadFieldProvider
              open={open}
              setOpen={setOpen}
              allFlatOptions={selectOptionsTyped ?? []}
              hasGroups={false}
              committedDisplay={subnetDisplayLabel}
              selectedOptionId={selectedSubnetOptionId}
              onCommit={onSelect}
              disabled={false}
              validated={validated}
              placeholder={selectPlaceholder}
              listboxId={`rosa-machine-pool-subnet-${index}-listbox`}
            >
              <RosaTypeaheadPfSelect
                isOpen={open}
                selected={selectedSubnetOptionId}
                onSelect={(_event, val) => onSelect(extractOptionValue(val) ?? '')}
                toggle={(toggleRef: Ref<MenuToggleElement>) => (
                  <RosaTypeaheadToggle toggleRef={toggleRef} />
                )}
              >
                <RosaTypeaheadMenu listValue={selectedSubnetOptionId} />
              </RosaTypeaheadPfSelect>
            </RosaTypeaheadFieldProvider>
          </InputGroupItem>
        </InputGroup>
        {validated === 'error' && requiredErrorMessage && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error">{requiredErrorMessage}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
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
  const { setValue } = useFormContext<RosaWizardFormData>();
  const path = props.path;
  const minItems = props.minItems ?? 1;

  const watched = useWatch({ name: path }) as MachinePoolSubnet[] | undefined;
  const values: MachinePoolSubnet[] = Array.isArray(watched) ? watched : [];

  const selectedSubnets = useMemo(() => {
    return values
      .map((pool) => pool.machine_pool_subnet)
      .filter((subnet): subnet is string => !!subnet);
  }, [values]);

  const setArrayValue = useCallback(
    (newArray: MachinePoolSubnet[]) => {
      setValue(path, newArray as never, { shouldDirty: true, shouldValidate: true });
    },
    [path, setValue]
  );

  const addItem = useCallback(
    (newItem: MachinePoolSubnet) => {
      setArrayValue([...values, newItem]);
    },
    [setArrayValue, values]
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
        <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
          {props.subnetLabel}
        </Content>
      </GridItem>

      <GridItem>
        {values.map((pool, index) => (
          <Fragment key={`${pool?.machine_pool_subnet ?? 'unset'}-${index}`}>
            <MachinePoolRow
              index={index}
              value={pool.machine_pool_subnet ?? ''}
              machinePoolLabel={props.machinePoolLabel}
              selectPlaceholder={props.selectPlaceholder}
              subnetOptions={props.subnetOptions}
              selectedSubnets={selectedSubnets}
              required={props.required}
              showErrorsAfterStepNav={afterStepNav}
              onChange={(newValue) => updateItem(index, newValue)}
              onRemove={() => removeItem(index)}
            />
          </Fragment>
        ))}
      </GridItem>
    </Grid>
  );
}
