/**
 * Playwright component-test mount only. Not for Storybook.
 * Exports a wrapper so the spec can mount a component from a file other than the spec.
 */
import React from 'react';
import { TranslationProvider } from '@/context/TranslationContext';
import { RosaWizard } from './RosaWizard';
import { rosaWizardMockStepsData } from './rosaWizardTestMocks';

export const RosaWizardMount: React.FC = () => (
  <TranslationProvider>
    <RosaWizard
      title="Create cluster"
      onSubmit={async () => {}}
      onCancel={() => {}}
      wizardsStepsData={rosaWizardMockStepsData}
    />
  </TranslationProvider>
);
