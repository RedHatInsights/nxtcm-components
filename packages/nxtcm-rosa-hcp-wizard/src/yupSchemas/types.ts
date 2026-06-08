import type { CIDRSubnet } from '../types';
import type { RosaHcpWizardValidatorStrings } from '../stringsProvider/rosaHcpWizardStrings';

/** Static metadata attached to each field via `.meta()`. */
export type WizardFieldMeta = {
  /** Unique field identifier (matches the schema path). */
  id: string;
  /** Dot-path key into the strings provider for resolving label, placeholder, and helper text at runtime. */
  labelKey?: string;
  /** Dot-path for `helperText` when not inlined in `.meta()`. */
  helperTextKey?: string;
  /** Dot-path for `labelHelp` when not inlined in `.meta()`. */
  labelHelpKey?: string;
  /** Dot-path for `labelHelpTitle` when not inlined in `.meta()`. */
  labelHelpTitleKey?: string;
  /** Dot-path for placeholder when not inlined in `.meta()`. */
  placeholderKey?: string;
  /** Which wizard step this field belongs to. */
  stepId: string;
  /** If true, field is read-only after the cluster is created / submitted. */
  noEditAfterSubmit?: boolean;
  /** If true, field does not appear in the review summary. */
  hideInReview?: boolean;
  /** Override label for the review step (when different from form label). */
  reviewLabel?: string;
  /** Hint for which component type to render. */
  fieldType?: 'text' | 'select' | 'radio' | 'checkbox' | 'number' | 'textarea' | 'typeahead';
  /** Whether the field lives behind an "Advanced" toggle. */
  advanced?: boolean;
  /** Display unit for the review step. */
  unit?: string;
  /** Display checkbox title */
  title?: string;
  /** Display or hide fieldset legend example: Label on radio buttons group */
  fieldSetLegend?: boolean;
};

/**
 * Context object passed at validation time via `schema.validate(data, { context })`.
 * All runtime-dependent values live here instead of in a factory closure.
 */
export type ValidationSchemaContext = {
  /** Localized validation error messages. */
  msgs: RosaHcpWizardValidatorStrings;
  /** Maximum root disk size in GiB (version-dependent: 1024 or 16384). */
  maxRootDiskSize: number;
  /** Maximum autoscaling node count (version-dependent: 90 or 500). */
  maxAutoscalingNodes: number;
  /** Number of machine pools currently configured (affects min-replica lower bound). */
  machinePoolsNumber: number;
  /** VPC subnets currently selected (for CIDR containment checks). */
  selectedSubnets?: CIDRSubnet[];
  /**
   * Async callback that checks whether a cluster name is already in use.
   * Returns `null` when the name is available, or an error message string
   * when it is taken / the check fails.
   */
  checkClusterNameUniqueness?: (name: string, region?: string) => Promise<string | null>;
};
