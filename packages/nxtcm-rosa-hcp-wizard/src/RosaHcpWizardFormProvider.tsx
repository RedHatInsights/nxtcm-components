import React, { useMemo } from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import { DocsVersionProvider } from './ROSAHCPWizardDocsVersionProvider';
import { RosaHcpWizardValidationProvider } from './rosaHcpWizardValidationContext';
import { useRosaHcpWizardValidators } from './stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster, RosaHCPWizardProps } from './types';
import { createClusterValidationResolver } from './utilities/clusterValidationResolver';
import { WizardConfigProvider } from './WizardConfigContext';
import { getClusterValidationSchemaDefaultValues } from './yupSchemas';

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
    <DocsVersionProvider docsVersions={props?.docsVersions}>
      <WizardConfigProvider config={config}>
        <FormProvider {...methods}>
          <RosaHcpWizardValidationProvider>
            <ROSAHCPWizardBody {...restProps} />
          </RosaHcpWizardValidationProvider>
        </FormProvider>
      </WizardConfigProvider>
    </DocsVersionProvider>
  );
}
