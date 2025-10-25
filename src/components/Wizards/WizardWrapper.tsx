import { WizardCancel, WizardSubmit } from '@patternfly-labs/react-form-wizard';
import { ProductName } from './constants';
import { RosaWizard } from './RosaWizard/RosaWizard';

interface BaseProductProps {
  type: ProductName;
  onSubmit: WizardSubmit;
  onCancel: WizardCancel;
  history: any;
  title: string;
  defaultData: any;
  stepProps: any;
}

type WizardWrapperProps<T extends BaseProductProps> = {
  product: T;
};

export const WizardWrapper = <T extends BaseProductProps>({ product }: WizardWrapperProps<T>) => {
  switch (product.type) {
    case ProductName.RosaClassic:
      return (
        <RosaWizard
          stepsProps={product.stepProps}
          defaultData={product.defaultData}
          onSubmit={product.onSubmit}
          onCancel={product.onCancel}
          history={product.history}
          title={product.title}
        />
      );
  }
};

export default WizardWrapper;
