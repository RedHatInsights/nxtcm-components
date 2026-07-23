import React from 'react';
import { Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import type { ROSAHCPCluster } from '../../../types';
import { withRosaCt } from '../../../components/WizFields/wizFieldCtSpecHelpers';
import { getClusterValidationSchemaDefaultValues } from '../../../yupSchemas';
import { RosaHcpWizardValidationProvider } from '../../../rosaHcpWizardValidationContext';
import { UpgradeScheduleFields } from './UpgradeScheduleFields';

export interface UpgradeScheduleFieldsMountProps {
  defaultValues?: Partial<ROSAHCPCluster>;
}

export const UpgradeScheduleFieldsMount: React.FC<UpgradeScheduleFieldsMountProps> = ({
  defaultValues = {},
}) => {
  const schemaDefaults = getClusterValidationSchemaDefaultValues();

  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...schemaDefaults,
      upgrade_schedule: undefined,
      ...defaultValues,
    },
    mode: 'onTouched',
  });

  return withRosaCt(
    <RosaHcpWizardValidationProvider>
      <FormProvider {...methods}>
        <Form>
          <UpgradeScheduleFields />
        </Form>
      </FormProvider>
    </RosaHcpWizardValidationProvider>
  );
};
