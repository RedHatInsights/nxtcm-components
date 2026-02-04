import {
  Button,
  MenuToggleElement,
  Select as PfSelect,
  Content,
  ContentVariants,
  InputGroup,
  InputGroupItem,
  Grid,
  GridItem,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import get from 'get-value';
import { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ItemContext } from '../contexts/ItemContext';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { InputCommonProps, useInput } from './Input';
import { InputSelect, SelectListOptions } from './InputSelect';
import { ValidationProvider, useSetHasValidationError, useValidate } from '../contexts/ValidationProvider';
import { Option, OptionType } from './WizSelect';
import { useShowValidation } from '../contexts/ShowValidationProvider';
import { useStringContext } from '../contexts/StringContext';

import './Select.css';

export type MachinePoolSubnet = {
  availability_zone?: string;
  machine_pool_subnet?: string;
  publicSubnetId?: string;
};

export type WizMachinePoolSelectProps = Omit<InputCommonProps, 'path'> & {
  path: string;
  machinePoolLabel: string;
  selectPlaceholder: string;
  subnetLabel: string;
  addMachinePoolBtnLabel: string;
  subnetOptions?: Option<string>[];
  selectedSubnets?: string[];
  viewUsedSubnetsLabel?: string;
  onViewUsedSubnets?: () => void;
  newValue?: MachinePoolSubnet;
  minItems?: number;
  filterAvailabilityZone?: (az: string) => boolean;
  isSection?: boolean;
  labelHelp?: string;
  labelHelpTitle?: string;
  labelHelpId?: string;
  labelHelpAriaLabel?: string;
  labelHelpAriaLabelledby?: string;
  labelHelpAriaDescribedby?: string;
};

function wizardMachinePoolItems(props: { path: string }, item: any): MachinePoolSubnet[] {
  const path = props.path;
  let sourceArray = get(item, path) as MachinePoolSubnet[];
  if (!Array.isArray(sourceArray)) sourceArray = [];
  return sourceArray;
}

export function WizMachinePoolSelect(props: WizMachinePoolSelectProps) {
  const { displayMode: mode, setValue, hidden, id } = useInput(props as InputCommonProps);

  const { update } = useData();
  const item = useContext(ItemContext);
  const values = wizardMachinePoolItems(props, item);

  const minItems = props.minItems ?? 1;

  const selectedSubnets = useMemo(() => {
    return values
      .map((pool) => pool.machine_pool_subnet)
      .filter((subnet): subnet is string => !!subnet);
  }, [values]);

  const addItem = useCallback(
    (newItem: MachinePoolSubnet) => {
      const newArray = [...values, newItem];
      setValue(newArray);
      update();
    },
    [setValue, update, values]
  );

  if (values.length < minItems && values.length === 0) {
    for (let i = 0; i < minItems; i++) {
      addItem(props.newValue ?? { machine_pool_subnet: '' });
    }
  }

  const removeItem = useCallback(
    (index: number) => {
      if (values.length <= minItems) {
        const newArray = [...values];
        newArray[index] = { ...newArray[index], machine_pool_subnet: '' };
        setValue(newArray);
        update();
        return;
      }

      const newArray = [...values];
      newArray.splice(index, 1);
      setValue(newArray);
      update();
    },
    [setValue, update, values, minItems]
  );

  const updateItem = useCallback(
    (index: number, newValue: string) => {
      const newArray = [...values];
      newArray[index] = { ...newArray[index], machine_pool_subnet: newValue };
      setValue(newArray);
      update();
    },
    [setValue, update, values]
  );

  if (hidden) return <Fragment />;

  if (mode === DisplayMode.Details) {
    if (values.length === 0) return <Fragment />;
    return (
      <Fragment>
        <div className="pf-v6-c-description-list__term">{props.label}</div>
        <div>
          {values.map((pool, index) => (
            <div key={index}>
              {props.machinePoolLabel} {index + 1}:{' '}
              {props.subnetOptions?.find((opt) => opt.value === pool.machine_pool_subnet)?.label ||
                pool.machine_pool_subnet}
            </div>
          ))}
        </div>
      </Fragment>
    );
  }

  return (
    <Grid hasGutter span={6} id={id}>
      <GridItem span={2}>
        <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
          {props.machinePoolLabel}
        </Content>
      </GridItem>
      <GridItem>
        <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
          {props.subnetLabel}
        </Content>
      </GridItem>

      <GridItem>
        {values.map((pool, index) => (
          <ValidationProvider key={`${pool?.machine_pool_subnet ?? 'unset'}-${index}`}>
            <MachinePoolRow
              index={index}
              value={pool.machine_pool_subnet ?? ''}
              machinePoolLabel={props.machinePoolLabel}
              selectPlaceholder={props.selectPlaceholder}
              subnetOptions={props.subnetOptions}
              selectedSubnets={selectedSubnets}
              required={props.required}
              onChange={(newValue) => updateItem(index, newValue)}
              onRemove={() => removeItem(index)}
            />
          </ValidationProvider>
        ))}
      </GridItem>

      <GridItem span={12}>
        <Button
          variant="link"
          size="sm"
          icon={<PlusCircleIcon />}
          onClick={() => addItem(props.newValue ?? { machine_pool_subnet: '' })}
        >
          {props.addMachinePoolBtnLabel}
        </Button>
      </GridItem>
    </Grid>
  );
}

interface MachinePoolRowProps {
  index: number;
  value: string;
  machinePoolLabel: string;
  selectPlaceholder: string;
  subnetOptions?: Option<string>[];
  selectedSubnets?: string[];
  viewUsedSubnetsLabel?: string;
  onViewUsedSubnets?: () => void;
  onChange: (value: string) => void;
  onRemove: () => void;
  required?: boolean;
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
  } = props;

  const [open, setOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<(string | OptionType<string>)[]>([]);

  const showValidation = useShowValidation();
  const { required: requiredErrorMessage } = useStringContext();

  const setHasValidationError = useSetHasValidationError();
  const validate = useValidate();

  const hasError = required && !value;

  const [previousHasError, setPreviousHasError] = useState(hasError);

  if (hasError !== previousHasError) {
    setPreviousHasError(hasError);
    validate();
  }

  if (hasError) {
    setHasValidationError();
  }

  const validated = showValidation && hasError ? 'error' : undefined;
  const errorMessage = hasError ? requiredErrorMessage : undefined;

  const selectOptionsTyped: OptionType<string>[] | undefined = useMemo(() => {
    return subnetOptions
      ?.filter((option) => {
        return option.value === value || !selectedSubnets?.includes(option.value);
      })
      .map((option) => ({
        id: option.id ?? option.value,
        label: option.label,
        value: option.value,
        keyedValue: option.value,
        description: option.description,
      }));
  }, [subnetOptions, selectedSubnets, value]);

  const onSelect = useCallback(
    (selectOptionObject: string | undefined) => {
      if (selectOptionObject) {
        onChange(selectOptionObject);
      }
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Grid hasGutter>
      <GridItem span={3}>
        <Content component={ContentVariants.p} style={{ paddingTop: '6px' }}>
          {machinePoolLabel} {index + 1}
        </Content>
      </GridItem>
      <GridItem span={6} rowSpan={2}>
        <InputGroup>
          <InputGroupItem isFill>
            <PfSelect
              onOpenChange={(isOpen) => !isOpen && setOpen(false)}
              isOpen={open}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <InputSelect
                  required={required}
                  disabled={false}
                  validated={validated}
                  placeholder={selectPlaceholder}
                  options={selectOptionsTyped ?? []}
                  setOptions={setFilteredOptions}
                  toggleRef={toggleRef}
                  value={value}
                  onSelect={onSelect}
                  open={open}
                  setOpen={setOpen}
                />
              )}
              selected={value}
              onSelect={(_event, val) => onSelect(val?.toString() ?? '')}
            >
              <SelectListOptions
                value={value}
                options={filteredOptions}
                isCreatable={false}
                isMultiSelect={false}
              />
            </PfSelect>
          </InputGroupItem>
        </InputGroup>
        {validated === 'error' && errorMessage && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error">{errorMessage}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </GridItem>
      <GridItem span={2}>
        <Button
          variant="plain"
          aria-label={`Remove machine pool ${index + 1}`}
          onClick={onRemove}
          style={{ paddingTop: '6px' }}
        >
          <MinusCircleIcon />
        </Button>
      </GridItem>
    </Grid>
  );
};