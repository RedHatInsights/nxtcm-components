import React, { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { ROSAHCPCluster, RosaHCPWizardProps } from './types';
import { createClusterValidationResolver } from './utilities/clusterValidationResolver';
import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import { RosaHcpWizardValidationProvider } from './rosaHcpWizardValidationContext';
import { useRosaHcpWizardValidators } from './stringsProvider/RosaHcpWizardStringsContext';
import { getClusterValidationSchemaDefaultValues } from './yupSchemas';
import { WizardConfigProvider } from './WizardConfigContext';

export function RosaHcpWizardFormProvider(props: RosaHCPWizardProps) {
  const { config = {}, ...restProps } = props;
  const msgs = useRosaHcpWizardValidators();

  const resolver = useMemo(() => createClusterValidationResolver(msgs), [msgs]);

  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: getClusterValidationSchemaDefaultValues(),
    resolver,
    mode: 'onTouched',
  });

  return (
    <WizardConfigProvider config={config}>
      <FormProvider {...methods}>
        <RosaHcpWizardValidationProvider>
          <ROSAHCPWizardBody {...restProps} />
        </RosaHcpWizardValidationProvider>
      </FormProvider>
    </WizardConfigProvider>
  );
}
