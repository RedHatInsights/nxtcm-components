import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { ROSAHCPCluster } from '../../types';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { DetailsStepDrawer } from './DetailsStepDrawer';
import type { RosaLoginProduct } from '../rosaLoginCommand';

export interface DetailsStepDrawerMountProps {
  initiallyExpanded?: boolean;
  product?: RosaLoginProduct;
  defaultValues?: Partial<ROSAHCPCluster>;
}

export const DetailsStepDrawerMount: React.FC<DetailsStepDrawerMountProps> = ({
  initiallyExpanded = false,
  product = 'acm',
  defaultValues = {},
}) => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(initiallyExpanded);
  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { cluster_version: '4.16.2', ...defaultValues },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <DetailsStepDrawer
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        onWizardExpand={() => setIsDrawerExpanded(true)}
        product={product}
      >
        <div data-testid="drawer-main-content">Main wizard content</div>
      </DetailsStepDrawer>
    </FormProvider>
  );
};
