import React, { useState } from 'react';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { DetailsStepDrawer } from './DetailsStepDrawer';
import type { RosaLoginProduct } from '../rosaLoginCommand';

export interface DetailsStepDrawerMountProps {
  initiallyExpanded?: boolean;
  product?: RosaLoginProduct;
}

export const DetailsStepDrawerMount: React.FC<DetailsStepDrawerMountProps> = ({
  initiallyExpanded = false,
  product = 'acm',
}) => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(initiallyExpanded);

  return withRosaCt(
    <DetailsStepDrawer
      isDrawerExpanded={isDrawerExpanded}
      setIsDrawerExpanded={setIsDrawerExpanded}
      onWizardExpand={() => setIsDrawerExpanded(true)}
      product={product}
    >
      <div data-testid="drawer-main-content">Main wizard content</div>
    </DetailsStepDrawer>
  );
};
