import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import { getClusterValidationSchemaDefaultValues } from './yupSchemas';
import type { RosaHCPWizardProps, ROSAHCPCluster } from './types';

export function RosaHcpWizardFormProvider(props: RosaHCPWizardProps) {
  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: getClusterValidationSchemaDefaultValues() as Partial<ROSAHCPCluster>,
    mode: 'onTouched',
  });

  return (
    <FormProvider {...methods}>
      <ROSAHCPWizardBody {...props} />
    </FormProvider>
  );
}
