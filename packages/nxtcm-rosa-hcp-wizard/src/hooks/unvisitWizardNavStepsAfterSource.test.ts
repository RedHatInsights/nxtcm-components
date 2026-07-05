import { unvisitWizardNavStepsAfterSourcePfIndex } from './unvisitWizardNavStepsAfterSource';

describe('unvisitWizardNavStepsAfterSourcePfIndex', () => {
  it('unvisits later steps in reverse PatternFly index order, including parent steps', () => {
    const wizardSteps = [
      { id: 'basic-setup', index: 1 },
      { id: 'details', index: 2 },
      { id: 'roles', index: 3 },
      { id: 'networking', index: 5 },
      { id: 'optional-setup', index: 6 },
      { id: 'review', index: 9 },
    ] as const;
    const unvisited: string[] = [];

    unvisitWizardNavStepsAfterSourcePfIndex(wizardSteps, 2, (stepId) => {
      unvisited.push(stepId);
    });

    expect(unvisited).toEqual(['review', 'optional-setup', 'networking', 'roles']);
  });

  it('does nothing when the source PatternFly index is unknown', () => {
    const unvisited: string[] = [];

    unvisitWizardNavStepsAfterSourcePfIndex([{ id: 'details', index: 2 }], 0, (stepId) => {
      unvisited.push(stepId);
    });

    expect(unvisited).toEqual([]);
  });
});
