import { FormProvider, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';

import { RosaHcpWizardStringsProvider } from '../../stringsProvider/RosaHcpWizardStringsContext';
import type { ROSAHCPCluster } from '../../types';

// Test wrapper that provides required context
export function YamlEditorTestWrapper({ children }: { children: ReactNode }) {
  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      name: 'test-cluster',
      cluster_version: '4.12.0',
      region: 'us-east-1',
    },
  });

  return (
    <RosaHcpWizardStringsProvider>
      <FormProvider {...methods}>{children}</FormProvider>
    </RosaHcpWizardStringsProvider>
  );
}
