import React, { useState } from 'react';
import { Section, WizRadioGroup, Radio, useItem } from '@patternfly-labs/react-form-wizard';
import { useData } from '@patternfly-labs/react-form-wizard';
import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import parseUpdateSchedule from './parseUpdateSchedule';
import { RosaWizardFormData, WizardNavigationContext } from '../../../../types';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';

const hoursOptions = Array.from(Array(24).keys());

type ClusterUpdatesSubstepProps = {
  goToStepId?: WizardNavigationContext;
};

export const ClusterUpdatesSubstep = (props: ClusterUpdatesSubstepProps) => {
  const cu = useRosaWizardStrings().clusterUpdates;
  const { cluster } = useItem<RosaWizardFormData>();
  const { update } = useData();

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
    <Section
      id="cluster-updates-substep-section"
      key="cluster-updates-substep-section-key"
      label={cu.sectionLabel}
    >
      <Content component={ContentVariants.p}>
        {cu.versionIntroPrefix} {cluster.cluster_version} {cu.versionIntroSuffix}{' '}
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

      <WizRadioGroup path="cluster.upgrade_policy">
        <Radio
          id="cluster-upgrade-strategy-individual-radio-btn"
          label={cu.individualLabel}
          value="automatic"
          description={
            <>
              {cu.individualDescriptionLead}{' '}
              <ExternalLink href={links.ROSA_LIFE_CYCLE}>{cu.lifecycleLink}</ExternalLink>
            </>
          }
        />
        <Radio
          id="cluster-upgrade-strategy-recurring-radio-btn"
          label={cu.recurringLabel}
          value="manual"
          description={
            <>
              {cu.recurringDescriptionBeforeZStream}
              <ExternalLink href={links.ROSA_Z_STREAM}>{cu.zStreamLinkText}</ExternalLink>
              {cu.recurringDescriptionAfterZStream}
            </>
          }
        />
      </WizRadioGroup>

      {cluster?.upgrade_policy === 'automatic' && (
        <FormGroup label={cu.dayTimeLabel} style={{ marginLeft: '1.5rem' }}>
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
        </FormGroup>
      )}
    </Section>
  );
};
