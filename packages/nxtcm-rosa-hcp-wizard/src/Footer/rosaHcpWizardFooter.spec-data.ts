import { STEP_IDS } from '../constants';
import type { CheckClusterNameUniqueness } from '../types';

/** Never resolves — keeps cluster name async validation in flight for footer CT. */
export const ROSA_HCP_PENDING_CLUSTER_NAME_UNIQUENESS_CHECK: CheckClusterNameUniqueness = () =>
  new Promise(() => {});

/** Leaf steps visited through Roles in footer CT (includes skipped Machine Pools / Networking). */
export const ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ROLES: readonly string[] = [
  STEP_IDS.DETAILS,
  STEP_IDS.ROLES_AND_POLICIES,
  STEP_IDS.MACHINE_POOLS,
  STEP_IDS.NETWORKING,
];

/** Leaf steps visited through Encryption in footer CT. */
export const ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION: readonly string[] = [
  ...ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ROLES,
  STEP_IDS.ENCRYPTION,
];

/** Leaf steps visited through Review in footer CT. */
export const ROSA_HCP_FOOTER_CT_VISITED_THROUGH_REVIEW: readonly string[] = [
  ...ROSA_HCP_FOOTER_CT_VISITED_THROUGH_ENCRYPTION,
  STEP_IDS.CLUSTER_UPDATES,
  STEP_IDS.REVIEW,
];

/**
 * PatternFly Wizard flat step index for the footer CT mount tree
 * (Basic setup parent + 2 subs, Optional parent + 2 subs, Review).
 */
const ROSA_HCP_FOOTER_CT_START_INDEX_BY_STEP_ID: Readonly<Record<string, number>> = {
  [STEP_IDS.DETAILS]: 2,
  [STEP_IDS.ROLES_AND_POLICIES]: 3,
  [STEP_IDS.ENCRYPTION]: 5,
  [STEP_IDS.CLUSTER_UPDATES]: 6,
  [STEP_IDS.REVIEW]: 7,
};

/** Resolves `Wizard` `startIndex` for footer CT mid-wizard mounts. */
export function getRosaHcpFooterCtStartIndex(stepId?: string): number {
  if (stepId === undefined) {
    return ROSA_HCP_FOOTER_CT_START_INDEX_BY_STEP_ID[STEP_IDS.DETAILS];
  }
  return ROSA_HCP_FOOTER_CT_START_INDEX_BY_STEP_ID[stepId] ?? 2;
}
