import { useMemo } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  Flex,
  FlexItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
  useWizardContext,
} from '@patternfly/react-core';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';
import { useWatch } from 'react-hook-form';

import type { ROSAHCPCluster, ROSAHCPWizardData } from '../../types';

import {
  buildMachinePoolsReviewSelectOptions,
  getNestedValue,
  resolveSelectedVpc,
} from '../../helpers';
import { Section } from '../../components/Section';
import { STEP_IDS } from '../../constants';
import { useRosaHcpWizardReviewSections } from './ROSAHCPWizardReviewSections';
import type { RosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings';
import { getRosaHcpWizardStringByLabelKey } from '../../stringsProvider/getRosaHcpWizardStringByLabelKey';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { getClusterValidationSchemaDefaultValues, wizardFieldMetaByPath } from '../../yupSchemas';
import { ReviewExpandSection } from './ReviewExpandSection';
import { ReviewFieldRow } from './ReviewFieldRow';
import { formatReviewFieldValue, normalizeEmptyFormValue } from './formatReviewValueDisplay';
import { shouldHideReviewRow } from './shouldHideReviewRow';

/** Stable string for comparing a field to defaults (includes arrays/objects). */
function serializeValueForSectionDiff(value: unknown): string {
  const normalized = normalizeEmptyFormValue(value);
  if (normalized === '') return '';
  if (typeof normalized === 'object') return JSON.stringify(normalized);
  return String(normalized);
}

function sectionDiffersFromDefaults(
  fieldPaths: readonly string[],
  currentForm: Partial<ROSAHCPCluster>,
  defaults: Partial<ROSAHCPCluster>
): boolean {
  return fieldPaths.some(
    (path) =>
      serializeValueForSectionDiff(getNestedValue(currentForm, path)) !==
      serializeValueForSectionDiff(getNestedValue(defaults, path))
  );
}

function resolveReviewFieldLabelText(
  strings: RosaHcpWizardStrings,
  labelKey: string,
  reviewLabelKeyOrLiteral?: string
): string {
  const key = reviewLabelKeyOrLiteral ?? labelKey;
  return getRosaHcpWizardStringByLabelKey(strings, key) ?? key;
}

export type ReviewProps = Pick<ROSAHCPWizardData, 'vpcList'> & {
  onOpenYamlEditor?: () => void;
};

export const Review = ({ vpcList, onOpenYamlEditor }: ReviewProps) => {
  const { goToStepById } = useWizardContext();
  const watchedFormValues = useWatch();
  const defaultWizardFormValues = getClusterValidationSchemaDefaultValues();
  const formValues = {
    ...defaultWizardFormValues,
    ...(typeof watchedFormValues === 'object' && watchedFormValues !== null
      ? watchedFormValues
      : {}),
  } as Partial<ROSAHCPCluster>;

  const selectedVPC = useMemo(
    () => resolveSelectedVpc(formValues.selected_vpc, vpcList.data),
    [formValues.selected_vpc, vpcList.data]
  );

  const reviewSelectOptions = useMemo(
    () => buildMachinePoolsReviewSelectOptions(selectedVPC, vpcList.data),
    [selectedVPC, vpcList.data]
  );
  const reviewSections = useRosaHcpWizardReviewSections();
  const rosaStrings = useRosaHcpWizardStrings();
  const { review } = rosaStrings;

  return (
    <Section label={review.sectionLabel} id={STEP_IDS.REVIEW}>
      {onOpenYamlEditor && (
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} className="pf-v6-u-mb-md">
          <FlexItem>
            <Button variant="secondary" icon={<PencilAltIcon />} onClick={onOpenYamlEditor}>
              {review.editInYaml}
            </Button>
          </FlexItem>
        </Flex>
      )}
      <Alert
        variant={AlertVariant.info}
        title={
          <>
            {review.alertTitle} {review.lockedSettings} <LockIcon />
          </>
        }
        ouiaId="reviewStepAlert"
        className="pf-v6-u-mb-md"
      />
      <Stack hasGutter>
        {reviewSections.map((section) => {
          const sectionHasChanges = sectionDiffersFromDefaults(
            section.fieldPaths,
            formValues,
            defaultWizardFormValues
          );
          if (section.hideIfUnchanged && !sectionHasChanges) {
            return null;
          }
          return (
            <StackItem key={section.id}>
              <Split hasGutter>
                <SplitItem isFilled>
                  <ReviewExpandSection label={section.label} initialExpanded={sectionHasChanges}>
                    <Stack hasGutter>
                      {section.fieldPaths.map((path) => {
                        const meta = wizardFieldMetaByPath(path);
                        const labelKey = meta?.labelKey ?? path;
                        const labelText = resolveReviewFieldLabelText(
                          rosaStrings,
                          labelKey,
                          meta?.reviewLabel
                        );
                        const hideInReview = shouldHideReviewRow({
                          path,
                          formValues,
                          metaShouldHideInReview: meta?.hideInReview ?? false,
                        });
                        const collapseOnRequired = meta?.collapseOnRequired ?? false;
                        return (
                          <ReviewFieldRow
                            key={path}
                            labelText={labelText}
                            hideInReview={hideInReview}
                            value={formatReviewFieldValue(
                              path,
                              formValues,
                              rosaStrings,
                              reviewSelectOptions
                            )}
                            noEditAfterStep={meta?.noEditAfterSubmit ?? false}
                            lockedSettingsScreenReaderText={review.lockedSettings}
                            collapseOnRequired={collapseOnRequired}
                          />
                        );
                      })}
                    </Stack>
                  </ReviewExpandSection>
                </SplitItem>
                <SplitItem>
                  <Button isInline variant="link" onClick={() => goToStepById?.(section.id)}>
                    {review.editStep}
                  </Button>
                </SplitItem>
              </Split>
            </StackItem>
          );
        })}
      </Stack>
    </Section>
  );
};
