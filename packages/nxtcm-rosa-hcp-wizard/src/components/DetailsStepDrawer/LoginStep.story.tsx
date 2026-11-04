import React from 'react';

import type { RosaLoginProduct } from '../rosaLoginCommand';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { LoginStep } from './LoginStep';

export interface LoginStepMountProps {
  product?: RosaLoginProduct;
}

export const LoginStepMount: React.FC<LoginStepMountProps> = ({ product = 'acm' }) => {
  return withRosaCt(<LoginStep product={product} />);
};
