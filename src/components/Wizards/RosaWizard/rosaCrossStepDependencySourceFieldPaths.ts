import type { FieldPath } from 'react-hook-form';
import type { RosaWizardFormData } from '../types';

/** Fields that, if edited after the user has moved ahead in the wizard, invalidate later steps' nav. */
export const rosaCrossStepDependencySourceFieldPaths = [
  'cluster.associated_aws_id',
  'cluster.cluster_version',
  'cluster.region',
  'cluster.configure_proxy',
] as const satisfies readonly FieldPath<RosaWizardFormData>[];

export type RosaCrossStepDependencySourceFieldPath =
  (typeof rosaCrossStepDependencySourceFieldPaths)[number];
