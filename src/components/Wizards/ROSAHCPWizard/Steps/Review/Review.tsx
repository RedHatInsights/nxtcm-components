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

import { Section } from '../../components/Section';
import { STEP_IDS } from '../../constants';
import { useRosaHcpWizardReviewSections } from '../../ROSAHCPWizardReviewSections';
import type { RosaHcpWizardStrings } from '../../stringsProvider/rosaHcpWizardStrings';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { getClusterValidationSchemaDefaultValues, wizardFieldMetaByPath } from '../../yupSchemas';
import { ReviewExpandSection } from './ReviewExpandSection';

/**
 * Dot-separated path lookup on plain form objects.
 * Only scalar leaves are formatted for display; objects and arrays become '' until review supports them.
 */
function readValueAtPath(source: unknown, path: string): string {
  if (source == null || path === '') return '';
  let current: unknown = source;
  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return '';
    current = (current as Record<string, unknown>)[key];
  }
  return formatScalarForReview(normalizeEmptyFormValue(current));
}

function normalizeEmptyFormValue(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return '';
  return value;
}

function formatScalarForReview(value: unknown): string {
  if (value === '' || value === null || value === undefined) return '';
  if (typeof value === 'object') return '';
  return String(value);
}

function sectionDiffersFromDefaults(
  fieldPaths: readonly string[],
  currentForm: Partial<ClusterFormData>,
  defaults: Partial<ClusterFormData>
): boolean {
  return fieldPaths.some(
    (path) => readValueAtPath(currentForm, path) !== readValueAtPath(defaults, path)
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

export const Review = () => {
  const { goToStepById } = useWizardContext();
  const watchedFormValues = useWatch();
  const defaultWizardFormValues = getClusterValidationSchemaDefaultValues();
  const formValues = {
    ...defaultWizardFormValues,
    ...(typeof watchedFormValues === 'object' && watchedFormValues !== null
      ? watchedFormValues
      : {}),
  } as Partial<ClusterFormData>;
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
                        return (
                          <ReviewFieldRow
                            key={path}
                            labelText={labelText}
                            hideInReview={meta?.hideInReview ?? false}
                            value={readValueAtPath(formValues, path)}
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
