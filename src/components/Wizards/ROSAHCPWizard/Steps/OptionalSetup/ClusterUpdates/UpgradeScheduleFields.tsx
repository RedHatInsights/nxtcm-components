import React from 'react';
import {
  FormGroup,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useController } from 'react-hook-form';

import { parseUpdateSchedule } from '../../../helpers';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../../../types';

const hoursOptions = Array.from(Array(24).keys());

export const UpgradeScheduleFields = () => {
  const cu = useRosaHcpWizardStrings().clusterUpdates;
  const { field } = useController<ROSAHCPCluster, 'upgrade_schedule'>({ name: 'upgrade_schedule' });

  const [daySelectOpen, setDaySelectOpen] = React.useState(false);
  const [timeSelectOpen, setTimeSelectOpen] = React.useState(false);

  const upgradeSchedule = field.value ?? '';

  const parseCurrentValue = (): [string, string] => {
    if (!upgradeSchedule) {
      return ['', ''];
    }
    return parseUpdateSchedule(upgradeSchedule);
  };

  const onDaySelect = (selection: string | number | undefined) => {
    const selectedHour = parseCurrentValue()[0] || '0';
    field.onChange(`00 ${selectedHour} * * ${selection}`);
    field.onBlur();
    setDaySelectOpen(false);
  };

  const onHourSelect = (selection: string | number | undefined) => {
    const selectedDay = parseCurrentValue()[1] || '0';
    field.onChange(`00 ${selection} * * ${selectedDay}`);
    field.onBlur();
    setTimeSelectOpen(false);
  };

  const formatHourLabel = (hour: number) => `${hour.toString().padStart(2, '0')}:00 UTC`;

  const [selectedHour, selectedDay] = parseCurrentValue();
  const selectedDayIndex = Number(selectedDay);
  const dayToggleLabel =
    selectedDay === '' || Number.isNaN(selectedDayIndex)
      ? cu.selectDayPlaceholder
      : (cu.daysOfWeek[selectedDayIndex] ?? cu.selectDayPlaceholder);

  const dayToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setDaySelectOpen(!daySelectOpen)}
      isExpanded={daySelectOpen}
      isFullWidth
    >
      {dayToggleLabel}
    </MenuToggle>
  );

  const hourToggleLabel =
    selectedHour === '' ? cu.selectTimePlaceholder : formatHourLabel(Number(selectedHour));

  const hourToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setTimeSelectOpen(!timeSelectOpen)}
      isExpanded={timeSelectOpen}
      isFullWidth
    >
      {hourToggleLabel}
    </MenuToggle>
  );

  return (
    <FormGroup label={cu.dayTimeLabel} className="pf-v6-u-ml-xl">
      <Grid>
        <GridItem span={7}>
          <Split hasGutter isWrappable>
            <SplitItem>
              <Select
                isOpen={daySelectOpen}
                selected={selectedDay}
                onOpenChange={(isOpen) => setDaySelectOpen(isOpen)}
                onSelect={(_, value) => onDaySelect(value)}
                shouldFocusToggleOnSelect
                toggle={dayToggle}
              >
                <SelectList>
                  {cu.daysOfWeek.map((day, idx) => (
                    <SelectOption key={day} value={idx.toString()}>
                      {day}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </SplitItem>
            <SplitItem>
              <Select
                isOpen={timeSelectOpen}
                selected={selectedHour}
                onOpenChange={(isOpen) => setTimeSelectOpen(isOpen)}
                onSelect={(_, value) => onHourSelect(value)}
                shouldFocusToggleOnSelect
                toggle={hourToggle}
                maxMenuHeight="20em"
                isScrollable
              >
                <SelectList>
                  {hoursOptions.map((hour) => (
                    <SelectOption key={hour} value={hour.toString()}>
                      {formatHourLabel(hour)}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </SplitItem>
          </Split>
        </GridItem>
      </Grid>
    </FormGroup>
  );
};
