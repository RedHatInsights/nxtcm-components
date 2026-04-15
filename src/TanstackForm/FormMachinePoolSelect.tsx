import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  FormGroup,
  MenuToggle,
  type MenuToggleElement,
  Select as PfSelect,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { type AnyFieldApi } from '@tanstack/react-form';

export interface MachinePoolSelectOption {
  label: string;
  value: string;
}

export interface FormMachinePoolSelectProps {
  /** TanStack Form field API for the array field (e.g. cluster.machine_pools_subnets) */
  field: AnyFieldApi;
  /** Label shown for each machine pool row (e.g. "Machine pool") */
  machinePoolLabel: string;
  /** Label for the subnet dropdown (e.g. "Subnet") */
  subnetLabel: string;
  /** Text for the "Add machine pool" button */
  addButtonLabel: string;
  /** Placeholder text inside the subnet select */
  selectPlaceholder?: string;
  /** Available subnet options */
  subnetOptions?: MachinePoolSelectOption[];
  /** Minimum number of rows (prevents removing below this count) */
  minItems?: number;
  /** Marks the field as required */
  isRequired?: boolean;
}

interface PoolRowProps {
  index: number;
  value: string;
  subnetLabel: string;
  selectPlaceholder: string;
  subnetOptions: MachinePoolSelectOption[];
  canRemove: boolean;
  onSelect: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

function PoolRow({
  index,
  value,
  subnetLabel,
  selectPlaceholder,
  subnetOptions,
  canRemove,
  onSelect,
  onRemove,
}: PoolRowProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const opt = subnetOptions.find((o) => o.value === value);
    return opt?.label ?? value;
  }, [value, subnetOptions]);

  const handleSelect = useCallback(
    (_event: React.MouseEvent | undefined, val: string | number | undefined): void => {
      onSelect(index, val != null ? String(val) : '');
      setIsOpen(false);
    },
    [index, onSelect]
  );

  const toggle = useCallback(
    (toggleRef: React.Ref<MenuToggleElement>): JSX.Element => (
      <MenuToggle
        ref={toggleRef}
        onClick={() => setIsOpen((prev) => !prev)}
        isExpanded={isOpen}
        isFullWidth
      >
        {value ? selectedLabel : selectPlaceholder}
      </MenuToggle>
    ),
    [isOpen, value, selectedLabel, selectPlaceholder]
  );

  return (
    <Split hasGutter>
      <SplitItem isFilled>
        <FormGroup label={`${subnetLabel} ${index + 1}`} fieldId={`machine-pool-subnet-${index}`}>
          <PfSelect
            id={`machine-pool-subnet-select-${index}`}
            isOpen={isOpen}
            selected={value}
            onSelect={handleSelect}
            onOpenChange={setIsOpen}
            toggle={toggle}
          >
            <SelectList>
              {subnetOptions.map((opt) => (
                <SelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectOption>
              ))}
            </SelectList>
          </PfSelect>
        </FormGroup>
      </SplitItem>
      {canRemove && (
        <SplitItem>
          <Button
            variant="plain"
            aria-label={`Remove pool ${index + 1}`}
            onClick={() => onRemove(index)}
            style={{ marginTop: '2rem' }}
          >
            <MinusCircleIcon />
          </Button>
        </SplitItem>
      )}
    </Split>
  );
}

/**
 * Array field component for managing machine pool subnet entries.
 * Provides add/remove controls for a list of subnet selects,
 * mirroring the old WizMachinePoolSelect behavior.
 */
export function FormMachinePoolSelect(props: FormMachinePoolSelectProps): JSX.Element {
  const {
    field,
    machinePoolLabel,
    subnetLabel,
    addButtonLabel,
    selectPlaceholder = 'Select a subnet',
    subnetOptions = [],
    minItems = 1,
    isRequired,
  } = props;

  type PoolEntry = { machine_pool_subnet: string };
  const entries: PoolEntry[] = useMemo(
    () => (field.state.value as PoolEntry[] | undefined) ?? [],
    [field.state.value]
  );
  const canRemove = entries.length > minItems;

  const handleSelect = useCallback(
    (index: number, value: string) => {
      const updated = entries.map((entry, i) =>
        i === index ? { ...entry, machine_pool_subnet: value } : entry
      );
      field.handleChange(updated);
    },
    [entries, field]
  );

  const handleRemove = useCallback(
    (index: number) => {
      field.handleChange(entries.filter((_, i) => i !== index));
    },
    [entries, field]
  );

  const handleAdd = useCallback(() => {
    field.handleChange([...entries, { machine_pool_subnet: '' }]);
  }, [entries, field]);

  return (
    <div>
      <FormGroup label={machinePoolLabel} isRequired={isRequired}>
        {entries.map((entry, index) => (
          <PoolRow
            key={index}
            index={index}
            value={entry.machine_pool_subnet}
            subnetLabel={subnetLabel}
            selectPlaceholder={selectPlaceholder}
            subnetOptions={subnetOptions}
            canRemove={canRemove}
            onSelect={handleSelect}
            onRemove={handleRemove}
          />
        ))}
        <Button variant="link" icon={<PlusCircleIcon />} onClick={handleAdd}>
          {addButtonLabel}
        </Button>
      </FormGroup>
    </div>
  );
}
