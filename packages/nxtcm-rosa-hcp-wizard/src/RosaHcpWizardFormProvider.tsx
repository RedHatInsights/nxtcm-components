import React, { useCallback } from 'react';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { ROSAHCPCluster, RosaHCPWizardProps } from './types';
import { buildClusterValidationSchemaContext } from './buildClusterValidationSchemaContext';
import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import { RosaHcpWizardValidationProvider } from './rosaHcpWizardValidationContext';
import { useRosaHcpWizardValidators } from './stringsProvider/RosaHcpWizardStringsContext';
import type { ValidationSchemaContext } from './yupSchemas/types';
import { clusterValidationSchema, getClusterValidationSchemaDefaultValues } from './yupSchemas';

const clusterYupResolver = yupResolver(clusterValidationSchema) as Resolver<
  Partial<ROSAHCPCluster>
>;

export function RosaHcpWizardFormProvider(props: RosaHCPWizardProps) {
  const msgs = useRosaHcpWizardValidators();
  const checkClusterNameUniqueness = props.wizardData?.checkClusterNameUniqueness;

  const resolver = useCallback<Resolver<Partial<ROSAHCPCluster>>>(
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

  const methods = useForm<Partial<ROSAHCPCluster>>({
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
