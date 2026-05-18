import * as yup from 'yup';

import { STEP_IDS } from '../constants';
import { ClusterUpgrade } from '../../types';
import type { WizardFieldMeta } from './types';

export const upgradePolicySchema = yup
  .string()
  .default(ClusterUpgrade.automatic)
  .optional()
  .meta({
    id: 'upgrade_policy',
    labelKey: 'clusterUpdates.upgradePolicyLabel',
    reviewLabel: 'review.updateStrategy',
    stepId: STEP_IDS.CLUSTER_UPDATES,
    fieldType: 'radio',
  } satisfies WizardFieldMeta);

export const upgradeScheduleSchema = yup
  .string()
  .optional()
  .meta({
    id: 'upgrade_schedule',
    labelKey: 'clusterUpdates.upgradeScheduleLabel',
    stepId: STEP_IDS.CLUSTER_UPDATES,
    hideInReview: true,
  } satisfies WizardFieldMeta);

export const clusterUpdatesFields = {
  upgrade_policy: upgradePolicySchema,
  upgrade_schedule: upgradeScheduleSchema,
};
