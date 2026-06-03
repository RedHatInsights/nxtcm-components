import { STEP_IDS } from './constants';

/** Keys on {@link RosaHcpWizardReviewStepLabels} — one entry per leaf wizard step. */
export type RosaHcpWizardLeafStepLabelKey =
  | 'details'
  | 'rolesAndPolicies'
  | 'machinePools'
  | 'networking'
  | 'clusterWideProxy'
  | 'encryptionOptional'
  | 'clusterUpdatesOptional';

const ROSA_HCP_EXPANDABLE_PARENT_STEP_IDS = [
  STEP_IDS.BASIC_SETUP,
  STEP_IDS.OPTIONAL_SETUP,
] as const;

export type RosaHcpWizardExpandableParentStepId =
  (typeof ROSA_HCP_EXPANDABLE_PARENT_STEP_IDS)[number];

export type RosaHcpWizardLeafStepDef = {
  id: string;
  parentId: RosaHcpWizardExpandableParentStepId;
  labelKey: RosaHcpWizardLeafStepLabelKey;
  /** Omitted from nav/review when `includeClusterWideProxy` is false. */
  requiresClusterWideProxy?: boolean;
  hideInReviewIfUnchanged?: boolean;
};

/**
 * Leaf wizard steps in nav order. Parent grouping and optional proxy gating are derived here;
 * field paths per step come from Yup `.meta({ stepId })` via {@link getFieldPathsByStepId}.
 *
 * Keep {@link ROSAHCPWizardBody} JSX in sync when adding or reordering steps.
 */
export const ROSA_HCP_LEAF_STEP_DEFS: readonly RosaHcpWizardLeafStepDef[] = [
  { id: STEP_IDS.DETAILS, parentId: STEP_IDS.BASIC_SETUP, labelKey: 'details' },
  { id: STEP_IDS.ROLES_AND_POLICIES, parentId: STEP_IDS.BASIC_SETUP, labelKey: 'rolesAndPolicies' },
  { id: STEP_IDS.MACHINE_POOLS, parentId: STEP_IDS.BASIC_SETUP, labelKey: 'machinePools' },
  { id: STEP_IDS.NETWORKING, parentId: STEP_IDS.BASIC_SETUP, labelKey: 'networking' },
  {
    id: STEP_IDS.CLUSTER_WIDE_PROXY,
    parentId: STEP_IDS.BASIC_SETUP,
    labelKey: 'clusterWideProxy',
    requiresClusterWideProxy: true,
    hideInReviewIfUnchanged: true,
  },
  { id: STEP_IDS.ENCRYPTION, parentId: STEP_IDS.OPTIONAL_SETUP, labelKey: 'encryptionOptional' },
  {
    id: STEP_IDS.CLUSTER_UPDATES,
    parentId: STEP_IDS.OPTIONAL_SETUP,
    labelKey: 'clusterUpdatesOptional',
  },
];

export type RosaHcpWizardChildStepIdsByParent = Readonly<
  Record<string, readonly string[] | undefined>
>;

export type RosaHcpWizardStepLayoutOptions = {
  includeClusterWideProxy: boolean;
};

export type RosaHcpWizardStepLayout = {
  leafSteps: readonly RosaHcpWizardLeafStepDef[];
  leafStepIds: readonly string[];
  childStepIdsByParent: RosaHcpWizardChildStepIdsByParent;
  orderedNavigableStepIds: readonly string[];
};

function groupChildStepIdsByParent(
  leafSteps: readonly RosaHcpWizardLeafStepDef[]
): RosaHcpWizardChildStepIdsByParent {
  const basicSetup: string[] = [];
  const optionalSetup: string[] = [];

  for (const step of leafSteps) {
    if (step.parentId === STEP_IDS.BASIC_SETUP) {
      basicSetup.push(step.id);
    } else {
      optionalSetup.push(step.id);
    }
  }

  return {
    [STEP_IDS.BASIC_SETUP]: basicSetup,
    [STEP_IDS.OPTIONAL_SETUP]: optionalSetup,
  };
}

/** Derives nav child lists and leaf step order from {@link ROSA_HCP_LEAF_STEP_DEFS}. */
export function buildRosaHcpWizardStepLayout(
  options: RosaHcpWizardStepLayoutOptions
): RosaHcpWizardStepLayout {
  const leafSteps = ROSA_HCP_LEAF_STEP_DEFS.filter(
    (step) => !step.requiresClusterWideProxy || options.includeClusterWideProxy
  );
  const leafStepIds = leafSteps.map((step) => step.id);

  return {
    leafSteps,
    leafStepIds,
    childStepIdsByParent: groupChildStepIdsByParent(leafSteps),
    orderedNavigableStepIds: [...leafStepIds, STEP_IDS.REVIEW],
  };
}
