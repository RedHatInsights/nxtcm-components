import type { CIDRSubnet, ROSAHCPCluster, ROSAHCPWizardData } from '../types';
import type { RosaHcpWizardValidatorStrings } from '../stringsProvider/rosaHcpWizardStrings';

/** Top-level {@link ROSAHCPCluster} keys used in form reset metadata. */
export type WizardFormFieldName = keyof ROSAHCPCluster;

/** {@link ROSAHCPWizardData} entries that expose an optional `fetch` callback. */
export type WizardDataResourceKey = {
  [K in keyof ROSAHCPWizardData]: 'fetch' extends keyof NonNullable<ROSAHCPWizardData[K]>
    ? NonNullable<NonNullable<ROSAHCPWizardData[K]>['fetch']> extends (...args: never[]) => unknown
      ? K
      : never
    : never;
}[keyof ROSAHCPWizardData];

type WizardResourceFetchArgs<K extends WizardDataResourceKey> = K extends keyof ROSAHCPWizardData
  ? NonNullable<ROSAHCPWizardData[K]> extends {
      fetch?: (...args: infer Args) => unknown;
    }
    ? Args extends unknown[]
      ? Args
      : never
    : never
  : never;

type WizardFormFieldNameMatchingValue<V> = {
  [F in WizardFormFieldName]: NonNullable<ROSAHCPCluster[F]> extends V ? F : never;
}[WizardFormFieldName];

type WizardResourceRefetchOnChangeForResource<K extends WizardDataResourceKey> =
  K extends keyof ROSAHCPWizardData
    ? WizardResourceFetchArgs<K> extends readonly []
      ? { readonly resource: K; readonly argFromField?: undefined }
      : WizardResourceFetchArgs<K> extends readonly [infer Arg, ...unknown[]]
        ? {
            readonly resource: K;
            readonly argFromField: WizardFormFieldNameMatchingValue<Arg>;
          }
        : never
    : never;

/** Single-arg or no-arg refetch derived from the resource's fetch signature. */
export type WizardResourceSimpleRefetchOnChange =
  WizardResourceRefetchOnChangeForResource<WizardDataResourceKey>;

/**
 * Composed-arg refetch: builds a `Record<string, string>` from multiple form field values
 * and passes it to the resource's `fetch`. All referenced fields must have non-empty string
 * values for the refetch to fire.
 */
export type WizardResourceComposedRefetchOnChange = {
  readonly resource: WizardDataResourceKey;
  readonly argsFromFields: Readonly<Record<string, WizardFormFieldName>>;
};

/** Describes a {@link ROSAHCPWizardData} resource reload when a form field changes. */
export type WizardResourceRefetchOnChange =
  | WizardResourceSimpleRefetchOnChange
  | WizardResourceComposedRefetchOnChange;

/**
 * When a source field changes to `when`, apply `setDefaults` and/or `clear` on dependent fields.
 * Used for mode toggles (e.g. autoscaling) where some fields should be cleared, not reset globally.
 */
export type WizardFieldSyncOnChange = {
  /** Source-field value that selects this branch (boolean mode toggles today). */
  when: boolean;
  /** Fields set to their individual Yup schema defaults. */
  setDefaults?: readonly WizardFormFieldName[];
  /** Fields set to `undefined` (hidden / inactive in the current mode). */
  clear?: readonly WizardFormFieldName[];
};

/**
 * Identifies a handler in {@link wizardFieldDerivedSyncHandlers} for resource-driven dependent fields.
 * Declared on the source field's Yup `.meta()` via `derivedFieldsSyncOnChange`.
 */
export type WizardFieldDerivedSyncKey =
  | 'installerRoleDependentRoles'
  | 'vpcSecurityGroupsWorkerSelection';

/**
 * Static metadata attached to each field via `.meta()`.
 *
 * When `resetsFieldsToDefaultOnChange` is set, changing this field's value should reset the
 * listed fields to their Yup schema defaults (see {@link resetFieldsToDefaultValues}).
 */
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
  /**
   * When true, {@link WizTextInput} validates only on blur (not on each keystroke after touch).
   * Useful for fields with async validation such as cluster name uniqueness.
   */
  validateOnBlur?: boolean;
  /** Whether the field lives behind an "Advanced" toggle. */
  advanced?: boolean;
  /** Display unit for the review step. */
  unit?: string;
  /** Display checkbox title */
  title?: string;
  /** Display or hide fieldset legend example: Label on radio buttons group */
  fieldSetLegend?: boolean;
  /** Whether the field should be collapsed when required. */
  collapseOnRequired?: boolean;
  /**
   * Other form fields reset to schema defaults when this field's value changes.
   * Wired by {@link useWizardFieldMetaChangeEffects} via {@link getWizardFieldResetsForSourceField}.
   */
  resetsFieldsToDefaultOnChange?: readonly WizardFormFieldName[];
  /**
   * {@link ROSAHCPWizardData} resources whose `fetch` should run when this field changes.
   * Wired by {@link useWizardFieldMetaChangeEffects} via {@link getWizardResourceRefetchesForSourceField}.
   */
  refetchesResourcesOnChange?: readonly WizardResourceRefetchOnChange[];
  /**
   * Conditional dependent-field updates when this field changes to a matching `when` value.
   * Wired by {@link useWizardFieldMetaChangeEffects} via {@link getWizardFieldSyncsForSourceField}.
   */
  syncsFieldsOnChange?: readonly WizardFieldSyncOnChange[];
  /**
   * Custom dependent-field updates using wizard data (see {@link wizardFieldDerivedSyncHandlers}).
   * Wired by {@link useWizardFieldMetaChangeEffects} via {@link getWizardFieldDerivedSyncKeyForSourceField}.
   */
  derivedFieldsSyncOnChange?: WizardFieldDerivedSyncKey;
  /**
   * When true (default for `fieldType: 'select'`), {@link WizSelect} clears this field if the
   * current value is absent from the rendered options list (e.g. after a resource refetch).
   * Set to `false` for selects with static options or fields reconciled elsewhere (e.g. derived sync).
   */
  reconcileValueWithOptions?: boolean;
  /**
   * Primary {@link ROSAHCPWizardData} entry feeding this select's options. Documents the
   * refetch → invalidate chain for reviewers; execution stays in {@link WizSelect}.
   */
  optionsWizardDataResource?: Exclude<
    keyof ROSAHCPWizardData,
    'clusterNameValidation' | 'checkClusterNameUniqueness'
  >;
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
