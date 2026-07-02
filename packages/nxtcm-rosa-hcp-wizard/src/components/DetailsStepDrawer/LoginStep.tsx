import { RosaLoginInstruction } from '../RosaLoginInstruction';
import type { RosaLoginProduct } from '../rosaLoginCommand';

type LoginStepProps = {
  product?: RosaLoginProduct;
};

export const LoginStep = ({ product }: LoginStepProps) => (
  <RosaLoginInstruction product={product} />
);
