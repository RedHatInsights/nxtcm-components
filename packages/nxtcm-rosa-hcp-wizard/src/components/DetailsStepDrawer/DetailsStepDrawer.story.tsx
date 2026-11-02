import React, { useRef, useState } from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { FormProvider, useForm } from 'react-hook-form';

import type { ROSAHCPCluster } from '../../types';
import type { RosaLoginProduct } from '../rosaLoginCommand';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { DetailsStepDrawer } from './DetailsStepDrawer';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { cluster_version: '4.16.2', ...defaultValues },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <DetailsStepDrawer
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        triggerRef={triggerRef}
        product={product}
      >
        <div data-testid="drawer-main-content">Main wizard content</div>
        <Button ref={triggerRef} onClick={() => setIsDrawerExpanded(true)}>
          Associate a new AWS account
        </Button>
      </DetailsStepDrawer>
    </FormProvider>
  );
};
