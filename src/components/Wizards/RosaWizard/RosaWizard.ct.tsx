/**
 * Playwright component-test mount only. Not for Storybook.
 * Exports a wrapper so the spec can mount a component from a file other than the spec.
 */
import React from 'react';
import { RosaWizard } from './RosaWizard';
import { rosaWizardMockStepsData } from './rosaWizardTestMocks';

/**
 * Full wizard mount for CT using shared `rosaWizardMockStepsData` and minimal handlers.
 * Import from this module so specs avoid defining mount components in the test file.
 */
export const RosaWizardMount: React.FC = () => (
  <RosaWizard
    title="Create cluster"
    onSubmit={async () => {}}
    onCancel={() => {}}
    wizardsStepsData={rosaWizardMockStepsData}
  />
);
