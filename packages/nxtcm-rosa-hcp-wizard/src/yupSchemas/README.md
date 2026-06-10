# Yup schema field metadata (`.meta()`)

Each field in `clusterValidationSchema` carries a **`WizardFieldMeta`** payload on its Yup schema via `.meta({ ... })`. That metadata drives form presentation, review-step rendering, select reconciliation, and cross-field side effects when a value changes.

Type definitions live in [`types.ts`](./types.ts). Read meta at runtime with [`readWizardFieldMeta`](./readWizardFieldMeta.ts) or [`wizardFieldMetaByPath`](./index.ts).

---

## Declaring metadata

Attach metadata to a field schema and type-check it with `satisfies WizardFieldMeta`:

```ts
import { STEP_IDS } from '../constants';
import type { WizardFieldMeta } from './types';

export const regionSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'region',
    labelKey: 'details.regionLabel',
    placeholderKey: 'details.regionPlaceholder',
    labelHelpKey: 'details.regionHelp',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
    optionsWizardDataResource: 'regions',
    reconcileValueWithOptions: true,
    noEditAfterSubmit: true,
    resetsFieldsToDefaultOnChange: ['selected_vpc', 'machine_pools_subnets'],
    refetchesResourcesOnChange: [
      { resource: 'vpcList' },
      { resource: 'machineTypes', argFromField: 'region' },
    ],
  } satisfies WizardFieldMeta);
```

**Conventions**

- `id` should match the top-level form field name (schema key in `clusterValidationSchema`).
- Prefer `*Key` string paths (e.g. `labelKey`) over inlined copy so labels resolve from `RosaHcpWizardStringsProvider`.
- Use `satisfies WizardFieldMeta` so new options are caught by TypeScript when the type grows.

Nested fields (e.g. `machine_pools_subnets.0.machine_pool_subnet`) may also declare meta; top-level fields are what the change-effect registry scans.

---

## Option reference

### Required on every field

| Option | Type | Purpose |
|--------|------|---------|
| `id` | `string` | Field identifier; used as DOM id fallback and in review. Should match the schema path. |
| `stepId` | `string` | Wizard step this field belongs to. Groups fields for review sections and Next-step validation via [`getFieldPathsByStepId`](./wizardFieldMetaChangeRegistry.ts). Values are defined in [`constants.ts`](../constants.ts) (`STEP_IDS`). |

### Presentation (form UI)

Resolved by `Wiz*` fields through [`useWizFieldPresentation`](../components/WizFields/wizFieldPresentation.ts) and [`getYupFieldPresentationMeta`](../../../../src/utilities/yupFieldPresentationMeta.ts). Explicit props on a `Wiz*` component always win over meta.

| Option | Type | Purpose |
|--------|------|---------|
| `labelKey` | `string` | Dot-path into `RosaHcpWizardStrings` for the field label (e.g. `details.regionLabel`). |
| `label` | `string \| ReactNode` | Inline label when not using `labelKey`. Rare in production schemas; supported in CT/stories. |
| `placeholderKey` | `string` | Dot-path for placeholder text (`WizTextInput`, `WizSelect`). |
| `placeholder` | `string` | Inline placeholder. |
| `helperTextKey` | `string` | Dot-path for helper text below the control. |
| `helperText` | `string \| ReactNode` | Inline helper text. |
| `labelHelpKey` | `string` | Dot-path for popover/help content beside the label. |
| `labelHelp` | `string \| ReactNode` | Inline label help body. |
| `labelHelpTitleKey` | `string` | Dot-path for popover title. |
| `labelHelpTitle` | `string` | Inline popover title. |
| `title` | `string` | Checkbox group heading (`WizCheckbox`). |
| `fieldSetLegend` | `boolean` | When `false`, `WizRadioGroup` hides the fieldset legend (e.g. when step layout already provides a heading). Default: legend shown when label resolves. |

**Resolution order** for each string: explicit `Wiz*` prop → `*Key` lookup in strings provider → inline value from `.meta()`.

### Review step

Consumed by [`Review`](../Steps/Review/Review.tsx) and [`formatReviewValueDisplay`](../Steps/Review/formatReviewValueDisplay.ts).

| Option | Type | Purpose |
|--------|------|---------|
| `hideInReview` | `boolean` | Omit this field from the review summary (e.g. mode toggles, advanced-only controls). |
| `reviewLabel` | `string` | Override the review row label. May be a **literal** string (`'AWS billing account'`) or a **strings dot-path** (`'review.updateStrategy'`) resolved like `labelKey`. |
| `noEditAfterSubmit` | `boolean` | Show a lock icon on the review row; field is not editable after cluster creation. |
| `unit` | `string` | Suffix appended to the formatted review value (e.g. `'GiB'` → `100 GiB`). |

### Form behavior

| Option | Type | Purpose |
|--------|------|---------|
| `fieldType` | `'text' \| 'select' \| 'radio' \| 'checkbox' \| 'number' \| 'textarea' \| 'typeahead'` | Hint for which control renders the field. The step JSX still chooses the actual `Wiz*` component; this documents intent and affects select reconciliation defaults. |
| `validateOnBlur` | `boolean` | When `true`, `WizTextInput` validates on blur instead of on every keystroke. Use for async checks (e.g. cluster name uniqueness). |
| `advanced` | `boolean` | Documents that the field lives in an expandable “Advanced …” section. Step layout is still manual in step components; this flag is for reviewers and tests. |

### Select-specific

| Option | Type | Purpose |
|--------|------|---------|
| `optionsWizardDataResource` | `keyof ROSAHCPWizardData` | Documents which wizard-data resource feeds this select’s options (e.g. `'regions'`, `'roles'`, `'vpcList'`). Does not fetch by itself — the step wires `WizSelect` to the resource. |
| `reconcileValueWithOptions` | `boolean` | When `true`, `WizSelect` clears or resets the value if it is missing from the current options list (after refetch). Default: `true` when `fieldType` is `'select'`. Set `false` for static options or when a derived sync handles reconciliation. |

### Field change effects

When a **source field** changes, [`useWizardFieldMetaChangeEffects`](../fieldMetaChangeEffects/useWizardFieldMetaChangeEffects.ts) reads these options from the registry built in [`wizardFieldMetaChangeRegistry.ts`](./wizardFieldMetaChangeRegistry.ts) and runs [`applyWizardFieldMetaChangeEffects`](../fieldMetaChangeEffects/applyWizardFieldMetaChangeEffects.ts).

| Option | Type | Purpose |
|--------|------|---------|
| `resetsFieldsToDefaultOnChange` | `readonly WizardFormFieldName[]` | Reset listed fields to their Yup schema defaults when this field changes (skipped on initial mount). Example: changing `region` resets VPC and subnet selections. |
| `refetchesResourcesOnChange` | `readonly WizardResourceRefetchOnChange[]` | Call `fetch` on listed `ROSAHCPWizardData` resources. See shape below. |
| `syncsFieldsOnChange` | `readonly WizardFieldSyncOnChange[]` | Conditional updates for mode toggles. See shape below. |
| `derivedFieldsSyncOnChange` | `WizardFieldDerivedSyncKey` | Run a custom handler from [`wizardFieldDerivedSyncHandlers`](../fieldMetaChangeEffects/wizardFieldDerivedSyncs.ts) when this field (or its wizard-data deps) change. |

**`refetchesResourcesOnChange` entry**

```ts
// No-arg fetch (e.g. reload VPC list after region change)
{ resource: 'vpcList' }

// Fetch with an argument taken from another form field
{ resource: 'machineTypes', argFromField: 'region' }
{ resource: 'roles', argFromField: 'associated_aws_id' }
```

Refetch runs when the source value changes to a non-empty string (or on any change after the first value). If `argFromField` is set, refetch is skipped until that argument field has a usable string value.

**`syncsFieldsOnChange` entry**

```ts
{
  when: true,                              // source field value that selects this branch
  setDefaults: ['min_replicas', 'max_replicas'], // apply Yup defaults
  clear: ['nodes_compute'],                // set to undefined (inactive mode)
}
```

Used for boolean toggles such as autoscaling: enabling autoscaling sets replica defaults and clears fixed node count, and vice versa. On initial mount, only `clear` runs (not `setDefaults`) so hydrated form data is preserved.

**`derivedFieldsSyncOnChange` keys**

| Key | Source field | Behavior |
|-----|--------------|----------|
| `'installerRoleDependentRoles'` | `installer_role_arn` | Syncs support/worker role selections from installer role + `roles` resource data. |
| `'vpcSecurityGroupsWorkerSelection'` | `selected_vpc` | Syncs worker security group selection from VPC + `vpcList` data. |

Add new keys in [`types.ts`](./types.ts) and implement the handler in [`wizardFieldDerivedSyncs.ts`](../fieldMetaChangeEffects/wizardFieldDerivedSyncs.ts).

**Effect order** when a source field changes: refetch → reset → sync → derived sync.

**Loop safety:** `useWizardFieldMetaChangeEffects` watches **source fields only** (not array dependents like `security_groups_worker` or `machine_pools_subnets`). Source changes are compared with [`wizardFormFieldValuesEqual`](../fieldMetaChangeEffects/wizardFormFieldValuesEqual.ts) (semantic equality for arrays and select ids), and [`resetFieldsToDefaultValues`](../fieldMetaChangeEffects/resetFieldsToDefaultValues.ts) skips `setValue` when the form already matches Yup defaults — so dependent `setValue` writes do not re-trigger source-field effects.

---

## Conditional schemas and required UI

Some fields are required only in certain modes (e.g. KMS ARN when custom encryption is selected). Validation uses Yup `.when()` branches; the UI asterisk uses a separate meta flag on the **active branch**:

```ts
import { YUP_FIELD_REQUIRED_UI_META_KEY } from '@/utilities/yupFieldRequired';

.when('encryption_keys', {
  is: ClusterEncryptionKeys.custom,
  then: (schema) =>
    schema
      .test(rosaCommonRequiredNonEmptyIncludingAbsentTest)
      .meta({ [YUP_FIELD_REQUIRED_UI_META_KEY]: true }),
  otherwise: (schema) => schema.optional(),
});
```

`fieldRequiredUi: true` tells `Wiz*` fields to show as required without relying on `.required()` alone. Pass the same `yupDescribeOptions` / form values to presentation and required helpers so `.when()` branches resolve consistently.

---

## How meta is consumed

| Consumer | Meta used |
|----------|-----------|
| `WizTextInput`, `WizSelect`, `WizNumberInput`, `WizCheckbox`, `WizRadioGroup`, `WizFileUpload` | Presentation keys, `fieldSetLegend`, `title`; `validateOnBlur` on text inputs |
| `Review` / `formatReviewValueDisplay` | `stepId` (via section paths), `hideInReview`, `reviewLabel`, `noEditAfterSubmit`, `unit`, `labelKey` |
| `getFieldPathsByStepId` | `stepId` — review sections and Next validation |
| `useWizardFieldMetaChangeEffects` | `resetsFieldsToDefaultOnChange`, `refetchesResourcesOnChange`, `syncsFieldsOnChange`, `derivedFieldsSyncOnChange` |
| `WizSelect` / `useReconcileWizSelectValueWithOptions` | `reconcileValueWithOptions`, `fieldType` |
| Step authors (documentation) | `fieldType`, `advanced`, `optionsWizardDataResource` |

---

## Utilities

```ts
import {
  wizardFieldMetaByPath,
  getFieldPathsByStepId,
  listWizardFieldMetaChangeSourceFields,
  listWizardFieldResetEntries,
  listWizardFieldRefetchEntries,
  listWizardFieldSyncEntries,
  listWizardFieldDerivedSyncEntries,
} from '../yupSchemas';

// Meta for one field
const meta = wizardFieldMetaByPath('region');

// All field paths grouped by step (review + validation)
const byStep = getFieldPathsByStepId();

// Fields that trigger change effects
listWizardFieldMetaChangeSourceFields();
```

[`yupSchemas.test.ts`](./yupSchemas.test.ts) and [`wizardFieldMetaChangeRegistry.test.ts`](./wizardFieldMetaChangeRegistry.test.ts) assert registry behavior for representative fields.

---

## Validation context (not in `.meta()`)

Runtime validation values (max disk size, subnet list, localized error messages) are **not** stored in `.meta()`. Pass them at validate time:

```ts
clusterValidationSchema.validate(formData, { context });
```

See [`ValidationSchemaContext`](./types.ts) for the context shape.

---

## Adding a new field checklist

1. Create or extend a field schema in the appropriate `*Fields.ts` file with `.meta({ ... } satisfies WizardFieldMeta)`.
2. Register the field on `clusterValidationSchema` (via its `*Fields` export).
3. Set `id`, `stepId`, and `labelKey` (plus `fieldType` as documentation).
4. Wire the field in the step JSX with the matching `Wiz*` component and `schema={clusterValidationSchema}`.
5. If the field depends on or invalidates others, add `resetsFieldsToDefaultOnChange`, `refetchesResourcesOnChange`, `syncsFieldsOnChange`, or `derivedFieldsSyncOnChange` as needed.
6. For selects backed by wizard data, set `optionsWizardDataResource` and `reconcileValueWithOptions`.
7. For review behavior, set `hideInReview`, `reviewLabel`, `noEditAfterSubmit`, or `unit` as appropriate.
8. Run `npm run type-check` and `npm run test:all` from the repo root.
