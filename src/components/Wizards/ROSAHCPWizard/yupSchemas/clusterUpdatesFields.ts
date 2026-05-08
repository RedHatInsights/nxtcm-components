import * as yup from 'yup';

import { STEP_IDS } from '../constants';
import type { WizardFieldMeta } from './types';

export const upgradePolicySchema = yup
  .string()
  .optional()
  .meta({
    id: 'upgrade_policy',
    labelKey: 'clusterUpdates.upgradePolicyLabel',
    stepId: STEP_IDS.CLUSTER_UPDATES,
    fieldType: 'radio',
    showInReview: true,
  } satisfies WizardFieldMeta);

export const upgradeScheduleSchema = yup
  .string()
  .optional()
  .meta({
    id: 'upgrade_schedule',
    labelKey: 'clusterUpdates.upgradeScheduleLabel',
    stepId: STEP_IDS.CLUSTER_UPDATES,
  } satisfies WizardFieldMeta);

export const clusterUpdatesFields = {
  upgrade_policy: upgradePolicySchema,
  upgrade_schedule: upgradeScheduleSchema,
};
