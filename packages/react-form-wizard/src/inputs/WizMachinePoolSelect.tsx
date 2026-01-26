import {
  Button,
  MenuToggleElement,
  Select as PfSelect,
  Content,
  ContentVariants,
  InputGroup,
  InputGroupItem,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import get from 'get-value';
import { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ItemContext } from '../contexts/ItemContext';
import { DisplayMode } from '../contexts/DisplayModeContext';
import { InputCommonProps, useInput } from './Input';
import { InputSelect, SelectListOptions } from './InputSelect';
import { ValidationProvider } from '../contexts/ValidationProvider';
import { Option, OptionType } from './WizSelect';

import './Select.css';

export type MachinePoolSubnet = {
  availability_zone?: string;
  machine_pool_subnet?: string;
  publicSubnetId?: string;
};

export type WizMachinePoolSelectProps = Omit<InputCommonProps, 'path'> & {
  path: string;
  machinePoolLabel?: string;
  subnetLabel?: string;
  placeholder?: string;
  selectPlaceholder?: string;
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
              {props.machinePoolLabel ?? 'Machine pool'} {index + 1}:{' '}
              {props.subnetOptions?.find((opt) => opt.value === pool.machine_pool_subnet)?.label ||
                pool.machine_pool_subnet}
            </div>
          ))}
        </div>
      </Fragment>
    );
  }

  return (
    <div id={id}>
      {/* Column Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr auto',
          gap: '16px',
          alignItems: 'center',
          paddingBottom: '8px',
        }}
      >
        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>
          {props.machinePoolLabel ?? 'Machine pools'}
        </Content>
        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>
          {props.subnetLabel ?? 'Private subnet name'}
        </Content>
        <div style={{ width: '32px' }} /> {/* Spacer for remove button column */}
      </div>

      {/* Machine Pool Rows */}
      {values.map((pool, index) => (
        <ValidationProvider key={`${pool?.machine_pool_subnet ?? 'unset'}-${index}`}>
          <MachinePoolRow
            index={index}
            value={pool.machine_pool_subnet ?? ''}
            machinePoolLabel={props.machinePoolLabel ?? 'Machine pool'}
            selectPlaceholder={props.selectPlaceholder ?? 'Select private subnet'}
            subnetOptions={props.subnetOptions}
            selectedSubnets={selectedSubnets}
            onChange={(newValue) => updateItem(index, newValue)}
            onRemove={() => removeItem(index)}
          />
        </ValidationProvider>
      ))}

      {/* Add Machine Pool Button */}
      <div style={{ paddingTop: '8px' }}>
        <Button
          variant="link"
          size="sm"
          icon={<PlusCircleIcon />}
          onClick={() => addItem(props.newValue ?? { machine_pool_subnet: '' })}
        >
          {props.placeholder ?? 'Add machine pool'}
        </Button>
      </div>
    </div>
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
  } = props;

  const [open, setOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<(string | OptionType<string>)[]>([]);

  const selectOptionsTyped: OptionType<string>[] | undefined = useMemo(() => {
    return subnetOptions
      ?.filter((option) => {
        // Keep the option if:
        // 1. It's the currently selected value for this row, OR
        // 2. It's not selected by any other machine pool
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

  const hasValidationError = !value;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr auto',
        gap: '16px',
        alignItems: 'center',
        paddingBottom: '8px',
      }}
    >
      {/* Machine Pool Label */}
      <Content component={ContentVariants.p}>
        {machinePoolLabel} {index + 1}
      </Content>

      {/* Subnet Dropdown */}
      <InputGroup>
        <InputGroupItem isFill>
          <PfSelect
            onOpenChange={(isOpen) => !isOpen && setOpen(false)}
            isOpen={open}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <InputSelect
                required
                disabled={false}
                validated={hasValidationError ? 'error' : undefined}
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

      {/* Remove Button */}
      <Button variant="plain" aria-label={`Remove machine pool ${index + 1}`} onClick={onRemove}>
        <MinusCircleIcon />
      </Button>
    </div>
  );
}
