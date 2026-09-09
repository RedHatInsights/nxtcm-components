import * as yup from 'yup';

import { FIELD_NAME } from '../constants';
import { ClusterUpgrade } from '../types';
import type { WizardFieldMeta } from './types';
import { rosaCommonRequiredNonEmptyTest } from './helpers';
import { YUP_FIELD_REQUIRED_UI_META_KEY } from '../utilities/yupFieldRequired';
import { YUP } from './constants';

export const upgradePolicySchema = yup
  .string()
  .default(YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_POLICY_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_POLICY_SCHEMA.META.ID,
    labelKey: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_POLICY_SCHEMA.META.LABEL_KEY,
    reviewLabel: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_POLICY_SCHEMA.META.REVIEW_LABEL,
    stepId: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_POLICY_SCHEMA.META.STEP_ID,
    fieldType: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_POLICY_SCHEMA.META.FIELD_TYPE,
  } satisfies WizardFieldMeta);

export const upgradeScheduleSchema = yup
  .string()
  .default(YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_SCHEDULE_SCHEMA.DEFAULT)
  .meta({
    id: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_SCHEDULE_SCHEMA.META.ID,
    labelKey: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_SCHEDULE_SCHEMA.META.LABEL_KEY,
    reviewLabel: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_SCHEDULE_SCHEMA.META.REVIEW_LABEL,
    stepId: YUP.CLUSTER_UPDATES_FIELDS.UPGRADE_SCHEDULE_SCHEMA.META.STEP_ID,
  } satisfies WizardFieldMeta)
  .when(FIELD_NAME.UPGRADE_POLICY, {
    is: ClusterUpgrade.automatic,
    then: (schema) =>
      schema.test(rosaCommonRequiredNonEmptyTest).meta({ [YUP_FIELD_REQUIRED_UI_META_KEY]: true }),
    otherwise: (schema) => schema.optional(),
  });

export const clusterUpdatesFields = {
  upgrade_policy: upgradePolicySchema,
  upgrade_schedule: upgradeScheduleSchema,
};
