import React from 'react';
import { FormGroup, Grid, GridItem, Split, SplitItem } from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';

import { Select } from '../../../components/Fields/Select';
import { parseUpdateSchedule } from '../../../helpers';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../../../types';

const hoursOptions = Array.from(Array(24).keys());

const formatHourLabel = (hour: number) => `${hour.toString().padStart(2, '0')}:00 UTC`;

const hourSelectOptions = hoursOptions.map((hour) => ({
  label: formatHourLabel(hour),
  value: hour.toString(),
}));

export const UpgradeScheduleFields = () => {
  const cu = useRosaHcpWizardStrings().clusterUpdates;
  const { setValue } = useFormContext<ROSAHCPCluster>();
  const upgradeSchedule =
    useWatch<ROSAHCPCluster, 'upgrade_schedule'>({ name: 'upgrade_schedule' }) ?? '';

  const dayOptions = React.useMemo(
    () => cu.daysOfWeek.map((day, idx) => ({ label: day, value: idx.toString() })),
    [cu.daysOfWeek]
  );

  const parseCurrentValue = (): [string, string] => {
    if (!upgradeSchedule) {
      return ['', ''];
    }
    return parseUpdateSchedule(upgradeSchedule);
  };

  const [selectedHour, selectedDay] = parseCurrentValue();

  const onDayChange = (selection: string | number | undefined) => {
    const hour = parseCurrentValue()[0] || '0';
    setValue('upgrade_schedule', `00 ${hour} * * ${selection}`, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onHourChange = (selection: string | number | undefined) => {
    const day = parseCurrentValue()[1] || '0';
    setValue('upgrade_schedule', `00 ${selection} * * ${day}`, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <FormGroup label={cu.dayTimeLabel} className="pf-v6-u-ml-xl">
      <Grid>
        <GridItem span={7}>
          <Split hasGutter isWrappable>
            <SplitItem>
              <Select
                id="upgrade-schedule-day"
                placeholder={cu.selectDayPlaceholder}
                value={selectedDay}
                onChange={onDayChange}
                options={dayOptions}
                isFill
              />
            </SplitItem>
            <SplitItem>
              <Select
                id="upgrade-schedule-hour"
                placeholder={cu.selectTimePlaceholder}
                value={selectedHour}
                onChange={onHourChange}
                options={hourSelectOptions}
                isFill
                maxMenuHeight="20em"
                isScrollable
              />
            </SplitItem>
          </Split>
        </GridItem>
      </Grid>
    </FormGroup>
  );
};
