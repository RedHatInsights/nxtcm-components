import * as yup from 'yup';

import { STEP_IDS } from '../constants';
import { ClusterUpgrade } from '../types';
import type { WizardFieldMeta } from './types';
import { rosaCommonRequiredNonEmptyIncludingAbsentTest } from './helpers';
import { YUP_FIELD_REQUIRED_UI_META_KEY } from '../utilities/yupFieldRequired';

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
  .meta({
    id: 'upgrade_schedule',
    labelKey: 'clusterUpdates.upgradeScheduleLabel',
    stepId: STEP_IDS.CLUSTER_UPDATES,
  } satisfies WizardFieldMeta)
  .when('upgrade_policy', {
    is: ClusterUpgrade.automatic,
    then: (schema) =>
      schema
        .test(rosaCommonRequiredNonEmptyIncludingAbsentTest)
        .meta({ [YUP_FIELD_REQUIRED_UI_META_KEY]: true }),
    otherwise: (schema) => schema.optional(),
  });

export const clusterUpdatesFields = {
  upgrade_policy: upgradePolicySchema,
  upgrade_schedule: upgradeScheduleSchema,
};
