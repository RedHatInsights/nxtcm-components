import React from 'react';
import { Wizard, WizardStep } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import type { ROSAHCPCluster, VpcListResource } from '../../types';
import { STEP_IDS } from '../../constants';
import { makeVpcListResource } from '../../test/rosaHcpWizardCtSpecHelpers';
import { RosaHcpWizardStringsProvider } from '../../stringsProvider/RosaHcpWizardStringsContext';
import { getClusterValidationSchemaDefaultValues } from '../../yupSchemas';
import { Review } from './Review';

export interface ReviewHarnessProps {
  formOverrides?: Partial<ROSAHCPCluster>;
  vpcList?: VpcListResource;
}

/**
 * Minimal wizard + form context so `Review` can call `useWizardContext` and `useWatch`.
 * Lives outside the spec file so Playwright CT can mount it.
 */
export function ReviewHarness({ formOverrides = {}, vpcList }: ReviewHarnessProps) {
  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: { ...getClusterValidationSchemaDefaultValues(), ...formOverrides },
  });
  const vpcListProps = makeVpcListResource(vpcList);

  return (
    <RosaHcpWizardStringsProvider>
      <FormProvider {...methods}>
        <Wizard height={720}>
          <WizardStep name="Review" id={STEP_IDS.REVIEW} key="review">
            <Review vpcList={vpcListProps} />
          </WizardStep>
        </Wizard>
      </FormProvider>
    </RosaHcpWizardStringsProvider>
  );
}
