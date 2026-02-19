import React, { useState } from 'react';
import { Section, WizRadioGroup, Radio } from '@patternfly-labs/react-form-wizard';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';
import { useData } from '@patternfly-labs/react-form-wizard';
import {
  Content,
  ContentVariants,
  FormGroup,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { useTranslation } from '../../../../../../context/TranslationContext';
import parseUpdateSchedule from './parseUpdateSchedule';

const daysOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hoursOptions = Array.from(Array(24).keys());

export const ClusterUpdatesSubstep = (props: any) => {
  const { t } = useTranslation();
  const { value } = useInput(props);
  const { update } = useData();
  const { cluster } = value;

  const [daySelectOpen, setDaySelectOpen] = useState(false);
  const [timeSelectOpen, setTimeSelectOpen] = useState(false);

  const upgradeSchedule = cluster?.upgrade_schedule || '';

  const parseCurrentValue = (): [string, string] => {
    if (!upgradeSchedule) {
      return ['', ''];
    }
    return parseUpdateSchedule(upgradeSchedule);
  };

  const onDaySelect = (selection: string | number | undefined) => {
    const selectedHour = parseCurrentValue()[0] || '0';
    const cronValue = `00 ${selectedHour} * * ${selection}`;
    update({ cluster: { ...cluster, upgrade_schedule: cronValue } });
    setDaySelectOpen(false);
  };

  const onHourSelect = (selection: string | number | undefined) => {
    const selectedDay = parseCurrentValue()[1] || '0';
    const cronValue = `00 ${selection} * * ${selectedDay}`;
    update({ cluster: { ...cluster, upgrade_schedule: cronValue } });
    setTimeSelectOpen(false);
  };

  const formatHourLabel = (hour: number) => `${hour.toString().padStart(2, '0')}:00 UTC`;

  const [selectedHour, selectedDay] = parseCurrentValue();

  const dayToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setDaySelectOpen(!daySelectOpen)}
      isExpanded={daySelectOpen}
      isFullWidth
    >
      {daysOptions[Number(selectedDay)] ?? t('Select day')}
    </MenuToggle>
  );

  const hourToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setTimeSelectOpen(!timeSelectOpen)}
      isExpanded={timeSelectOpen}
      isFullWidth
    >
      {formatHourLabel(Number(selectedHour) || 0)}
    </MenuToggle>
  );

  return (
    <Section
      id="cluster-updates-substep-section"
      key="cluster-updates-substep-section-key"
      label={t('Cluster update strategy')}
    >
      <Content component={ContentVariants.p}>
        {t(`The OpenShift version [4.14.6] that you selected in the "HERE GOES LINK: Details
        step" will apply to the managed control plane and the machine pools configured in the
        "HERE GOES LINK: Networking and subnets step". After cluster creation, you can
        update the managed control plane and machine pools independently.`)}
      </Content>

      <Content component={ContentVariants.p}>
        {t(`In the event of "HERE GOES LINK WITH EXTERNAL ICON: Critical security concerns"
        (CVEs) that significantly impact the security or stability of the cluster, updates may be
        automatically scheduled by Red Hat SRE to the latest z-stream version not impacted by the
        CVE within 2 business days after customer notifications.`)}
      </Content>

      <WizRadioGroup path="cluster.upgrade_policy">
        <Radio
          id="cluster-upgrade-strategy-individual-radio-btn"
          label={t('Individual updates')}
          value="manual"
          description={t(
            'Schedule each update individually. When planning updates, make sure to consider the end of life dates from the {HERE GOES LINK WITH EXTERNAL ICON: lifecycle policy}'
          )}
        />
        <Radio
          id="cluster-upgrade-strategy-recurring-radio-btn"
          label={t('Recurring updates')}
          value="automatic"
          description={t(
            "The cluster control plan will be automatically updated based on your preferred day and start time when new patch updates ({HERE GOES LINK WITH EXTERNAL ICON: z-stream}) are available. When a new minor version is available, you'll be notified and must manually allow the cluster to update the next minor version. The compute nodes will need to be manually updated."
          )}
        />
      </WizRadioGroup>

      {cluster?.upgrade_policy === 'automatic' && (
        <FormGroup label={t('Select a day and start time')} style={{ marginLeft: '1.5rem' }}>
          <Grid hasGutter>
            <GridItem sm={6} md={6}>
              <Select
                isOpen={daySelectOpen}
                selected={selectedDay}
                onOpenChange={(isOpen) => setDaySelectOpen(isOpen)}
                onSelect={(_, value) => onDaySelect(value)}
                shouldFocusToggleOnSelect
                toggle={dayToggle}
              >
                <SelectList>
                  {daysOptions.map((day, idx) => (
                    <SelectOption key={day} value={idx.toString()}>
                      {day}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </GridItem>
            <GridItem sm={6} md={6}>
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
            </GridItem>
          </Grid>
        </FormGroup>
      )}
    </Section>
  );
};
