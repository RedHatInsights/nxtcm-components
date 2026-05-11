import { RosaHcpWizardStringsProvider } from './stringsProvider/RosaHcpWizardStringsContext';
import { RosaHcpWizardFormProvider } from './RosaHcpWizardFormProvider';
import { RosaHcpWizardStringsInput } from './stringsProvider/rosaHcpWizardStrings';
import { ROSAHCPCluster, RosaHCPWizardProps } from './types';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { clusterValidationSchema } from './yupSchemas';

type ROSAHCPWrapperProps = RosaHCPWizardProps & {
  strings?: RosaHcpWizardStringsInput;
};

export const RosaHCPWizard = ({ strings, ...wizardProps }: ROSAHCPWrapperProps) => (
  <RosaHcpWizardStringsProvider strings={strings}>
    <RosaHcpWizardFormProvider {...wizardProps} />
  </RosaHcpWizardStringsProvider>
);

export default RosaHCPWizard;
