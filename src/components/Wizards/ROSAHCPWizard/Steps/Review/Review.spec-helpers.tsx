import React from 'react';
import { Wizard, WizardStep } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';

import type { ClusterFormData } from '@/components/Wizards/types';
import { STEP_IDS } from '../../constants';
import { RosaHcpWizardStringsProvider } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { getClusterValidationSchemaDefaultValues } from '../../yupSchemas';
import { Review } from './Review';

export interface ReviewHarnessProps {
  formOverrides?: Partial<ClusterFormData>;
}

/**
 * Minimal wizard + form context so `Review` can call `useWizardContext` and `useWatch`.
 * Lives outside the spec file so Playwright CT can mount it.
 */
export function ReviewHarness({ formOverrides = {} }: ReviewHarnessProps) {
  const methods = useForm<Partial<ClusterFormData>>({
    defaultValues: { ...getClusterValidationSchemaDefaultValues(), ...formOverrides },
  });

  return (
    <RosaHcpWizardStringsProvider>
      <FormProvider {...methods}>
        <Wizard height={720}>
          <WizardStep name="Review" id={STEP_IDS.REVIEW} key="review">
            <Review />
          </WizardStep>
        </Wizard>
      </FormProvider>
    </RosaHcpWizardStringsProvider>
  );
}
