import React from 'react';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import {
  Button,
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
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { parseUpdateSchedule } from '../../../helpers';
import { Section } from '../../../components/Section';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';
import { WizardNavigationContext } from '../../../types';

type ClusterUpdatesSubstepProps = {
  goToStepId?: WizardNavigationContext;
};

export const ClusterUpdates = (props: ClusterUpdatesSubstepProps) => {
  const cu = useRosaHcpWizardStrings().clusterUpdates;

  const [daySelectOpen, setDaySelectOpen] = React.useState(false);
  const [timeSelectOpen, setTimeSelectOpen] = React.useState(false);

  const hoursOptions = Array.from(Array(24).keys());
  const upgradeSchedule = '';

  const parseCurrentValue = (): [string, string] => {
    if (!upgradeSchedule) {
      return ['', ''];
    }
    return parseUpdateSchedule(upgradeSchedule);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onDaySelect = (selection: string | number | undefined) => {
    //const selectedHour = parseCurrentValue()[0] || '0';
    //const cronValue = `00 ${selectedHour} * * ${selection}`;
    // update({ cluster: { ...cluster, upgrade_schedule: cronValue } });
    setDaySelectOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onHourSelect = (selection: string | number | undefined) => {
    //const selectedDay = parseCurrentValue()[1] || '0';
    //const cronValue = `00 ${selection} * * ${selectedDay}`;
    // update({ cluster: { ...cluster, upgrade_schedule: cronValue } });
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
    <Section label={cu.sectionLabel}>
      <Content component={ContentVariants.p}>
        {cu.versionIntroPrefix} {'cluster.version'} {cu.versionIntroSuffix}{' '}
        {
          <Button
            onClick={() => props.goToStepId?.goToStepById('basic-setup-step-details')}
            variant="link"
            isInline
          >
            {cu.detailsStepLink}
          </Button>
        }{' '}
        {cu.midSentence}{' '}
        {
          <Button
            onClick={() => props.goToStepId?.goToStepById('networking-sub-step')}
            variant="link"
            isInline
          >
            {cu.networkingStepLink}
          </Button>
        }{' '}
        {cu.afterCreation}
      </Content>
      <Content component={ContentVariants.p}>
        {cu.cveLead}{' '}
        <ExternalLink href={links.SECURITY_CLASSIFICATION_CRITICAL}>
          {cu.criticalConcernsLink}
        </ExternalLink>{' '}
        {cu.cveTail}
      </Content>
      cluster-upgrade_policy
      {/**
       * {cluster?.upgrade_policy === ClusterUpgrade.automatic &&
       */}
      {false && (
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
      )}
    </Section>
  );
};
