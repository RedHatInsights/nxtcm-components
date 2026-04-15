import React, { useState } from 'react';
import {
  Button,
  Content,
  ContentVariants,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  useWizardContext,
} from '@patternfly/react-core';
import parseUpdateSchedule from './parseUpdateSchedule';
import { ClusterUpgrade } from '../../../../types';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { useClusterValues, useRosaForm } from '../../../RosaFormContext';
import { FormRadioGroup } from '../../../../../../TanstackForm';

const hoursOptions = Array.from(Array(24).keys());

export const ClusterUpdatesSubstep = (): JSX.Element => {
  const cu = useRosaWizardStrings().clusterUpdates;
  const form = useRosaForm();
  const cluster = useClusterValues();
  const wizardContext = useWizardContext();

  const [daySelectOpen, setDaySelectOpen] = useState(false);
  const [timeSelectOpen, setTimeSelectOpen] = useState(false);

  const upgradeSchedule = cluster.upgrade_schedule ?? '';

  const parseCurrentValue = (): [string, string] =>
    upgradeSchedule ? parseUpdateSchedule(upgradeSchedule) : ['', ''];

  const onDaySelect = (selection: string | number | undefined): void => {
    const selectedHour = parseCurrentValue()[0] || '0';
    const cronValue = `00 ${selectedHour} * * ${selection}`;
    form.setFieldValue('cluster.upgrade_schedule', cronValue);
    setDaySelectOpen(false);
  };

  const onHourSelect = (selection: string | number | undefined): void => {
    const selectedDay = parseCurrentValue()[1] || '0';
    const cronValue = `00 ${selection} * * ${selectedDay}`;
    form.setFieldValue('cluster.upgrade_schedule', cronValue);
    setTimeSelectOpen(false);
  };

  const formatHourLabel = (hour: number): string => `${hour.toString().padStart(2, '0')}:00 UTC`;

  const [selectedHour, selectedDay] = parseCurrentValue();
  const selectedDayIndex = Number(selectedDay);
  const dayToggleLabel =
    selectedDay === '' || Number.isNaN(selectedDayIndex)
      ? cu.selectDayPlaceholder
      : (cu.daysOfWeek[selectedDayIndex] ?? cu.selectDayPlaceholder);

  const dayToggle = (toggleRef: React.Ref<MenuToggleElement>): JSX.Element => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setDaySelectOpen(!daySelectOpen)}
      isExpanded={daySelectOpen}
      isFullWidth
    >
      {dayToggleLabel}
    </MenuToggle>
  );

  const hourToggle = (toggleRef: React.Ref<MenuToggleElement>): JSX.Element => (
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
    <FormSection id="cluster-updates-substep-section" title={cu.sectionLabel}>
      <Content component={ContentVariants.p}>
        {cu.versionIntroPrefix} {cluster.cluster_version} {cu.versionIntroSuffix}{' '}
        <Button
          onClick={() => wizardContext.goToStepById('basic-setup-step-details')}
          variant="link"
          isInline
        >
          {cu.detailsStepLink}
        </Button>{' '}
        {cu.midSentence}{' '}
        <Button
          onClick={() => wizardContext.goToStepById('networking-sub-step')}
          variant="link"
          isInline
        >
          {cu.networkingStepLink}
        </Button>{' '}
        {cu.afterCreation}
      </Content>

      <Content component={ContentVariants.p}>
        {cu.cveLead}{' '}
        <ExternalLink href={links.SECURITY_CLASSIFICATION_CRITICAL}>
          {cu.criticalConcernsLink}
        </ExternalLink>{' '}
        {cu.cveTail}
      </Content>

      <form.Field name="cluster.upgrade_policy">
        {(field) => (
          <FormRadioGroup
            field={field}
            label=""
            options={[
              {
                value: 'automatic',
                label: cu.individualLabel,
                description: (
                  <>
                    {cu.individualDescriptionLead}{' '}
                    <ExternalLink href={links.ROSA_LIFE_CYCLE}>{cu.lifecycleLink}</ExternalLink>
                  </>
                ),
              },
              {
                value: 'manual',
                label: cu.recurringLabel,
                description: (
                  <>
                    {cu.recurringDescriptionBeforeZStream}
                    <ExternalLink href={links.ROSA_Z_STREAM}>{cu.zStreamLinkText}</ExternalLink>
                    {cu.recurringDescriptionAfterZStream}
                  </>
                ),
              },
            ]}
          />
        )}
      </form.Field>

      {cluster.upgrade_policy === ClusterUpgrade.automatic && (
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
    </FormSection>
  );
};
