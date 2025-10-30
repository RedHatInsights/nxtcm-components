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
  wizardsStepsData: T;
};

export const WizardWrapper = <T extends BaseProductProps>({
  product,
  wizardsStepsData
}: WizardWrapperProps<T>) => {
  switch (product.type) {
    case ProductName.RosaClassic:
      return (
        <RosaWizard
          wizardsStepsData={wizardsStepsData}
          onSubmit={product.onSubmit}
          onCancel={product.onCancel}
          title={product.title}
        />
      );
  }
};
