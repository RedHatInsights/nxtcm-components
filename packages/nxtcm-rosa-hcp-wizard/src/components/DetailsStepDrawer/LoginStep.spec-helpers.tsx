import React from 'react';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { LoginStep } from './LoginStep';
import type { RosaLoginProduct } from '../rosaLoginCommand';

export interface LoginStepMountProps {
  product?: RosaLoginProduct;
}

export const LoginStepMount: React.FC<LoginStepMountProps> = ({ product = 'acm' }) => {
  return withRosaCt(<LoginStep product={product} />);
};
