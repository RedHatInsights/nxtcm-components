import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { ROSAHCPCluster } from '../../types';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { OCMRole } from './OCMRole';

export type OCMRoleMountProps = {
  defaultValues?: Partial<ROSAHCPCluster>;
};

export const OCMRoleMount: React.FC<OCMRoleMountProps> = ({ defaultValues = {} }) => {
  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { cluster_version: '4.16.2', ...defaultValues },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <OCMRole />
    </FormProvider>
  );
};
