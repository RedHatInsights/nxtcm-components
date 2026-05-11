import React, { useCallback } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { ClusterFormData } from '../types';

import { buildClusterValidationSchemaContext } from './buildClusterValidationSchemaContext';
import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import { useRosaHcpWizardValidators } from './stringsProvider/RosaHcpWizardStringsContext';
import type { RosaHCPWizardProps } from './types';
import type { ValidationSchemaContext } from './yupSchemas/types';
import { clusterValidationSchema, getClusterValidationSchemaDefaultValues } from './yupSchemas';

export function RosaHcpWizardFormProvider(props: RosaHCPWizardProps) {
  const msgs = useRosaHcpWizardValidators();
  const { wizardData } = props;

  const resolver = useCallback<Resolver<Partial<ClusterFormData>>>(
    async (values, context, options) => {
      const validate = yupResolver(clusterValidationSchema, {
        context: buildClusterValidationSchemaContext(values, msgs, {
          checkClusterNameUniqueness: wizardData.checkClusterNameUniqueness as
            | ValidationSchemaContext['checkClusterNameUniqueness']
            | undefined,
        }),
      }) as Resolver<Partial<ClusterFormData>>;
      return validate(values, context, options);
    },
    [msgs, wizardData.checkClusterNameUniqueness]
  );

  const methods = useForm<Partial<ClusterFormData>>({
    defaultValues: getClusterValidationSchemaDefaultValues(),
    resolver,
    mode: 'onTouched',
  });

  return (
    <FormProvider {...methods}>
      <ROSAHCPWizardBody {...props} />
    </FormProvider>
  );
}
