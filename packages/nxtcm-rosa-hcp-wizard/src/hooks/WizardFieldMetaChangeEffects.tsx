import type { ROSAHCPWizardData } from '../types';
import { useWizardFieldMetaChangeEffects } from './useWizardFieldMetaChangeEffects';

type WizardFieldMetaChangeEffectsProps = {
  wizardData: ROSAHCPWizardData;
};

/** CT helper: runs {@link useWizardFieldMetaChangeEffects} without rendering UI. */
export function WizardFieldMetaChangeEffects({
  wizardData,
}: WizardFieldMetaChangeEffectsProps): null {
  useWizardFieldMetaChangeEffects(wizardData);
  return null;
}
