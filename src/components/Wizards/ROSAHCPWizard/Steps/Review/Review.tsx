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
import get from 'get-value';
import { useWatch } from 'react-hook-form';

import type { ClusterFormData } from '@/components/Wizards/types';

import {
  buildMachinePoolsReviewSelectOptions,
  getNestedValue,
  resolveSelectedVpc,
} from '../../helpers';
import { Section } from '../../components/Section';
import { STEP_IDS } from '../../constants';
import { useRosaHcpWizardReviewSections } from '../../ROSAHCPWizardReviewSections';
import type { RosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPWizardData } from '../../types';
import { getClusterValidationSchemaDefaultValues, wizardFieldMetaByPath } from '../../yupSchemas';
import { ReviewExpandSection } from './ReviewExpandSection';
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
  currentForm: Partial<ClusterFormData>,
  defaults: Partial<ClusterFormData>
): boolean {
  return fieldPaths.some(
    (path) =>
      serializeValueForSectionDiff(getNestedValue(currentForm, path)) !==
      serializeValueForSectionDiff(getNestedValue(defaults, path))
  );
}

/** Resolves a dot path (e.g. `details.clusterNameLabel`) on the wizard strings root. */
function resolveStringByDotPath(strings: RosaHcpWizardStrings, path: string): string {
  if (path === '') return '';
  const resolved = get(strings, path);
  return typeof resolved === 'string' ? resolved : path;
}

function resolveReviewFieldLabelText(
  strings: RosaHcpWizardStrings,
  labelKey: string,
  reviewLabelKeyOrLiteral?: string
): string {
  return reviewLabelKeyOrLiteral
    ? resolveStringByDotPath(strings, reviewLabelKeyOrLiteral)
    : resolveStringByDotPath(strings, labelKey);
}

const ReviewFieldRow = ({
  labelText,
  value,
  hideInReview,
  noEditAfterStep,
  lockedSettingsScreenReaderText,
}: {
  labelText: string;
  value: string;
  hideInReview?: boolean;
  noEditAfterStep?: boolean;
  lockedSettingsScreenReaderText: string;
}) => {
  if (hideInReview) {
    return null;
  }

  return (
    <StackItem>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <FlexItem>{labelText}</FlexItem>
        <FlexItem>
          {value}
          {noEditAfterStep && (
            <>
              {' '}
              <span className="pf-v6-screen-reader">{lockedSettingsScreenReaderText}</span>
              <LockIcon />
            </>
          )}
        </FlexItem>
      </Flex>
    </StackItem>
  );
};

type ReviewProps = Pick<ROSAHCPWizardData, 'vpcList'>;

export const Review = ({ vpcList }: ReviewProps) => {
  const { goToStepById } = useWizardContext();
  const watchedFormValues = useWatch();
  const defaultWizardFormValues = getClusterValidationSchemaDefaultValues();
  const formValues = {
    ...defaultWizardFormValues,
    ...(typeof watchedFormValues === 'object' && watchedFormValues !== null
      ? watchedFormValues
      : {}),
  } as Partial<ClusterFormData>;

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
