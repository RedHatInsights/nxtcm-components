import React from 'react';
import { withRosaCt } from '../../components/WizFields/wizFieldCtSpecHelpers';
import { WizardConfigProvider } from '../../WizardConfigContext';
import { useRosaHcpWizardReviewSections } from './ROSAHCPWizardReviewSections';
import type { HideableWizardStepId } from '../../types';

export interface ROSAHCPWizardReviewSectionsMountProps {
  hiddenSteps?: readonly HideableWizardStepId[];
}

const ReviewSectionsDisplay: React.FC = () => {
  const sections = useRosaHcpWizardReviewSections();

  return (
    <div>
      <div data-testid="sections-count">{sections.length}</div>
      {sections.map((section) => (
        <div key={section.id} data-testid={`section-${section.id}`}>
          {section.label}
        </div>
      ))}
    </div>
  );
};

export const ROSAHCPWizardReviewSectionsMount: React.FC<ROSAHCPWizardReviewSectionsMountProps> = ({
  hiddenSteps = [],
}) => {
  return withRosaCt(
    <WizardConfigProvider config={{ hiddenSteps }}>
      <ReviewSectionsDisplay />
    </WizardConfigProvider>
  );
};
