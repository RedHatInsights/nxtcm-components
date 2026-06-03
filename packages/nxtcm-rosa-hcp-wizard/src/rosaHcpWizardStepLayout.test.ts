import { STEP_IDS } from './constants';
import { buildRosaHcpWizardStepLayout, ROSA_HCP_LEAF_STEP_DEFS } from './rosaHcpWizardStepLayout';
import { getFieldPathsByStepId } from './yupSchemas/wizardFieldMetaChangeRegistry';

describe('buildRosaHcpWizardStepLayout', () => {
  it('orders basic setup children from ROSA_HCP_LEAF_STEP_DEFS when proxy is excluded', () => {
    const layout = buildRosaHcpWizardStepLayout({ includeClusterWideProxy: false });

    expect(layout.childStepIdsByParent[STEP_IDS.BASIC_SETUP]).toEqual([
      STEP_IDS.DETAILS,
      STEP_IDS.ROLES_AND_POLICIES,
      STEP_IDS.MACHINE_POOLS,
      STEP_IDS.NETWORKING,
    ]);
    expect(layout.childStepIdsByParent[STEP_IDS.OPTIONAL_SETUP]).toEqual([
      STEP_IDS.ENCRYPTION,
      STEP_IDS.CLUSTER_UPDATES,
    ]);
    expect(layout.orderedNavigableStepIds.at(-1)).toBe(STEP_IDS.REVIEW);
    expect(layout.orderedNavigableStepIds).not.toContain(STEP_IDS.CLUSTER_WIDE_PROXY);
  });

  it('includes cluster-wide proxy when requested', () => {
    const layout = buildRosaHcpWizardStepLayout({ includeClusterWideProxy: true });

    expect(layout.childStepIdsByParent[STEP_IDS.BASIC_SETUP]).toContain(
      STEP_IDS.CLUSTER_WIDE_PROXY
    );
    expect(layout.orderedNavigableStepIds).toContain(STEP_IDS.CLUSTER_WIDE_PROXY);
  });

  it('defines a leaf step for every Yup stepId registry bucket except review', () => {
    const fieldPathsByStepId = getFieldPathsByStepId();
    const layoutStepIds = new Set(
      ROSA_HCP_LEAF_STEP_DEFS.map((step) => step.id).filter((id) => id !== STEP_IDS.REVIEW)
    );

    for (const stepId of Object.keys(fieldPathsByStepId)) {
      expect(layoutStepIds.has(stepId)).toBe(true);
    }
  });
});
