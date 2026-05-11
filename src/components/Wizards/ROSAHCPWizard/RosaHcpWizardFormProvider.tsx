import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getDefaultRosaHcpWizardFormValues } from './rosaHcpWizardDefaultFormValues';
import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import type { RosaHCPWizardProps, ROSAHCPCluster } from './types';

export function RosaHcpWizardFormProvider(props: RosaHCPWizardProps) {
  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: getDefaultRosaHcpWizardFormValues(),
    mode: 'onTouched',
  });

  return (
    <FormProvider {...methods}>
      <ROSAHCPWizardBody {...props} />
    </FormProvider>
  );
}
