import React from 'react';
import { FormGroup, Split, SplitItem } from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { HelperText } from '../../../components/Fields/HelperText';
import { Select } from '../../../components/Fields/Select';
import { wizFieldShowsError } from '../../../components/WizFields/wizFieldRhf';
import { parseUpdateSchedule } from '../../../utilities/helpers';
import { useWizStepValidationRevealed } from '../../../rosaHcpWizardValidationContext';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../../../types';
import { FIELD_NAME, UPGRADE_SCHEDULE_FIELDS_ID } from '../../../constants';

const hoursOptions = Array.from(Array(24).keys());

const formatHourLabel = (hour: number) => `${hour.toString().padStart(2, '0')}:00 UTC`;

const hourSelectOptions = hoursOptions.map((hour) => ({
  label: formatHourLabel(hour),
  value: hour.toString(),
}));

const buildUpgradeScheduleCron = (day: string, hour: string): string => `00 ${hour} * * ${day}`;

const parseScheduleParts = (cron: string): [hour: string, day: string] => {
  if (!cron) {
    return ['', ''];
  }
  return parseUpdateSchedule(cron);
};

export const UpgradeScheduleFields = () => {
  const cu = useRosaHcpWizardStrings().clusterUpdates;
  const { setValue, formState, getFieldState } = useFormContext<ROSAHCPCluster>();
  const upgradeSchedule =
    useWatch<ROSAHCPCluster, 'upgrade_schedule'>({ name: FIELD_NAME.UPGRADE_SCHEDULE.NAME }) ?? '';
  const scheduleFieldState = getFieldState(FIELD_NAME.UPGRADE_SCHEDULE.NAME, formState);
  const stepValidationRevealed = useWizStepValidationRevealed(FIELD_NAME.UPGRADE_SCHEDULE.NAME);
  const showError = wizFieldShowsError(
    scheduleFieldState.invalid,
    scheduleFieldState.isTouched,
    formState.isSubmitted || stepValidationRevealed
  );

  const dayOptions = React.useMemo(
    () => cu.daysOfWeek.map((day, idx) => ({ label: day, value: idx.toString() })),
    [cu.daysOfWeek]
  );

  const [selectedHour, setSelectedHour] = React.useState(
    () => parseScheduleParts(upgradeSchedule)[0]
  );
  const [selectedDay, setSelectedDay] = React.useState(
    () => parseScheduleParts(upgradeSchedule)[1]
  );

  const syncUpgradeSchedule = (day: string, hour: string) => {
    if (day !== '' && hour !== '') {
      setValue(FIELD_NAME.UPGRADE_SCHEDULE.NAME, buildUpgradeScheduleCron(day, hour), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      return;
    }

    if (upgradeSchedule) {
      setValue(FIELD_NAME.UPGRADE_SCHEDULE.NAME, undefined, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  };

  const onDayChange = (selection: string | number | undefined) => {
    const day = selection === undefined ? '' : String(selection);
    setSelectedDay(day);
    syncUpgradeSchedule(day, selectedHour);
  };

  const onHourChange = (selection: string | number | undefined) => {
    const hour = selection === undefined ? '' : String(selection);
    setSelectedHour(hour);
    syncUpgradeSchedule(selectedDay, hour);
  };

  return (
    <FormGroup label={cu.dayTimeLabel} fieldId={UPGRADE_SCHEDULE_FIELDS_ID} isRequired>
      <Split hasGutter isWrappable>
        <SplitItem>
          <Select
            id={FIELD_NAME.UPGRADE_SCHEDULE.DAY}
            placeholder={cu.selectDayPlaceholder}
            value={selectedDay}
            onChange={onDayChange}
            options={dayOptions}
            isFill
            isError={showError}
          />
        </SplitItem>
        <SplitItem>
          <Select
            id={FIELD_NAME.UPGRADE_SCHEDULE.HOUR}
            placeholder={cu.selectTimePlaceholder}
            value={selectedHour}
            onChange={onHourChange}
            options={hourSelectOptions}
            isFill
            maxMenuHeight="20em"
            isScrollable
            isError={showError}
          />
        </SplitItem>
      </Split>

      <HelperText
        id={UPGRADE_SCHEDULE_FIELDS_ID}
        errorMessage={scheduleFieldState.error?.message}
        isError={showError}
      />
    </FormGroup>
  );
};
