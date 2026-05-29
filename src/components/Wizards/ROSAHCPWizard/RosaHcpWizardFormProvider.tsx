import React, { useCallback } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { ClusterFormData } from '../types';

import { buildClusterValidationSchemaContext } from './buildClusterValidationSchemaContext';
import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import { RosaHcpWizardValidationProvider } from './rosaHcpWizardValidationContext';
import { useRosaHcpWizardValidators } from './stringsProvider/RosaHcpWizardStringsContext';
import type { RosaHCPWizardProps } from './types';
import type { ValidationSchemaContext } from './yupSchemas/types';
import { clusterValidationSchema, getClusterValidationSchemaDefaultValues } from './yupSchemas';

const clusterYupResolver = yupResolver(clusterValidationSchema) as Resolver<
  Partial<ClusterFormData>
>;

export function RosaHcpWizardFormProvider(props: RosaHCPWizardProps) {
  const msgs = useRosaHcpWizardValidators();
  const checkClusterNameUniqueness = props.wizardData?.checkClusterNameUniqueness;

  const resolver = useCallback<Resolver<Partial<ClusterFormData>>>(
    async (values, _rhfContext, options) => {
      const yupContext = buildClusterValidationSchemaContext(values, msgs, {
        checkClusterNameUniqueness: checkClusterNameUniqueness as
          | ValidationSchemaContext['checkClusterNameUniqueness']
          | undefined,
      });
      return clusterYupResolver(values, yupContext, options);
    },
    [msgs, checkClusterNameUniqueness]
  );

  const methods = useForm<Partial<ClusterFormData>>({
    defaultValues: getClusterValidationSchemaDefaultValues(),
    resolver,
    mode: 'onTouched',
  });

  return (
    <FormProvider {...methods}>
      <RosaHcpWizardValidationProvider>
        <ROSAHCPWizardBody {...props} />
      </RosaHcpWizardValidationProvider>
    </FormProvider>
  );
}
