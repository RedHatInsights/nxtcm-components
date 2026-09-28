import type { RosaLoginProduct } from '../rosaLoginCommand';
import { RosaLoginInstruction } from '../RosaLoginInstruction';

type LoginStepProps = {
  product?: RosaLoginProduct;
};

export const LoginStep = ({ product }: LoginStepProps) => (
  <RosaLoginInstruction product={product} />
);
