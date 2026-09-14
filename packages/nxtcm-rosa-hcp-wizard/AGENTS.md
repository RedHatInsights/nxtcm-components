# nxtcm-rosa-hcp-wizard package

package-level context for `@redhat-cloud-services/nxtcm-rosa-hcp-wizard`. read the root [AGENTS.md](../../AGENTS.md) first — this file adds package-specific details.

## what this package is

multi-step wizard for creating ROSA HCP (Hosted Control Plane) clusters. PatternFly `Wizard` + `react-hook-form` (`FormProvider` + yup resolver). consumed by ACM console and OCM portal (uhc-portal).

## architecture overview

```text
RosaHcpWizardFormProvider
  ├─ useForm + createClusterValidationResolver (Yup)
  ├─ WizardConfigProvider
  └─ RosaHcpWizardValidationProvider   # step-gating UI state (attempted / unvisit / alerts)
       └─ ROSAHCPWizardBody
            ├─ useWizardFieldMetaChangeEffects(wizardData)   # change-dependencies
            ├─ Steps/* (BasicSetup, OptionalSetup, Review, YamlEditor)
            └─ Footer   # step-gating: Next / Submit via getFieldPathsByStepId
```

three concerns ultimately stay separate, so do not conflate them:

| Concern | What it answers | Where it lives |
|---------|-----------------|----------------|
| **validation** | is a field / form value valid? | Yup schemas + `createClusterValidationResolver` |
| **step-gating** | may the user leave this step / submit? | Footer + `RosaHcpWizardValidationProvider` |
| **change-dependencies** | when field A changes, what resets / refetches / syncs? | Yup `.meta()` + `fieldMetaChangeEffects` |

field behavior is schema-driven. Deep meta option catalog: [`src/yupSchemas/README.md`](./src/yupSchemas/README.md).

## package structure

```text
src/
  Steps/                    # step UI
  components/               # presentational controls
  fieldMetaChangeEffects/   # RHF-connected wrappers
  yupSchemas/               # validation rules + WizardFieldMeta
  stringsProvider/          # change-dependency runtime
  hooks/                    # step-gating on Next / Submit
  types/ and types.ts       # UI + validator strings
  utilities/                # resolver, helpers
  test/ and *.spec.tsx      # Resource<T> and domain contracts
```

## form state

`RosaHcpWizardFormProvider`: `useForm({ resolver: createClusterValidationResolver(...), mode: 'onTouched', defaultValues })`.

- read with `useFormContext()` / `useWatch()`
- write with `setValue()` — prefer meta-driven change-dependencies over inline `onChange` cascades

## 1. validation (field / form correctness)

**purpose:** decide whether values are valid. not navigation, not cascades.

- single schema: `clusterValidationSchema` (composed from `*Fields.ts`)
- resolver: `createClusterValidationResolver` — coerces untouched required fields, builds `ValidationSchemaContext` (localized messages, runtime values such as subnet lists) at validate time
- RHF `mode: 'onTouched'` — field errors after blur/touch

### conditional / interconnected rules

- mode-dependent requiredness uses Yup `.when()` (e.g. KMS ARN, public subnet when privacy is public)
- required asterisk for conditional branches uses `fieldRequiredUi` meta (`YUP_FIELD_REQUIRED_UI_META_KEY`) plus current values as `yupDescribeOptions` on `Wiz*` fields so `.when()` resolves for presentation
- runtime-only inputs (max disk, subnet lists, i18n messages) belong in `ValidationSchemaContext` at validate time — **not** in static `.meta()`

do **not** re-implement validation in step components. extend Yup schemas.

## 2. step-gating (Next / Submit / nav status)

**purpose:** decide whether the user can advance or submit, and how nav shows error state. uses validation results; does not define field rules.

footer flow:

1. `getFieldPathsByStepId()` groups top-level schema keys by `meta.stepId`
2. `validateWizardStepFields` runs `trigger(paths)` for the active step (full `trigger()` on review/submit)
3. failure → `markValidationAttempted(stepId)` so errors persist across nav
4. success / values becoming valid → `clearValidationAttempted` via reconcile helpers

`RosaHcpWizardValidationProvider` holds gating UI state only: attempted steps, async-validating steps, alert step, and nav unvisit requests after upstream resets/refetches.

review validates the whole form and marks invalid **sections**.

## 3. change-dependencies (reset / refetch / sync)

**purpose:** keep dependent values and resources coherent when a source field changes. not the same as validation; a reset may clear values that later fail validation.

declare on the **source** field’s Yup `.meta()`, not in JSX `onChange`:

| Meta key | Role |
|----------|------|
| `resetsFieldsToDefaultOnChange` | reset listed fields to schema defaults |
| `refetchesResourcesOnChange` | call `wizardData[resource].fetch` |
| `syncsFieldsOnChange` | mode toggles (`when` + set defaults / clear) |
| `derivedFieldsSyncOnChange` | custom handlers in `wizardFieldDerivedSyncs.ts` |

runtime: `wizardFieldMetaChangeRegistry` indexes sources → `useWizardFieldMetaChangeEffects` watches **sources only** → `applyWizardFieldMetaChangeEffects` runs **refetch → reset → sync → derived sync**.

loop safety: dependents are not watched as sources; equality skips no-op writes; reset/refetch sources can request nav unvisit for later steps (step-gating state, not validation).

example — declare in schema meta:

```ts
regionSchema.meta({
  id: 'region',
  stepId: STEP_IDS.DETAILS,
  fieldType: 'select',
  resetsFieldsToDefaultOnChange: [
    'selected_vpc',
    'machine_pools_subnets',
    'security_groups_worker',
    'cluster_privacy_public_subnet_id',
  ],
  refetchesResourcesOnChange: [
    { resource: 'vpcList' },
    { resource: 'machineTypes', argFromField: 'region' },
  ],
} satisfies WizardFieldMeta);
```

full option tables: [`src/yupSchemas/README.md`](./src/yupSchemas/README.md).

## Resource\<T\> integration

components do not own HTTP. consuming apps pass `ROSAHCPWizardData` resources; change-dependencies call `fetch` when meta says so. `optionsWizardDataResource` documents which resource feeds a select — it does not fetch by itself.

## fields architecture

1. **Fields** (`components/Fields/`) — presentational
2. **WizFields** (`components/WizFields/`) — `Controller` + meta-driven labels / errors / required UI

prefer `Wiz*` + `schema={clusterValidationSchema}`.

## agent guidance

when changing wizard behavior, pick the right layer:

- **invalid value / conditional required** → Yup schema (validation)
- **Next blocked / nav error / review section** → Footer + validation provider (step-gating)
- **parent change clears / refetches / syncs children** → source-field `.meta()` + `fieldMetaChangeEffects` (change-dependencies)

keep mechanical enforcement (forbidden imports, naming, exhaustive catalogs) in lint and tests — this file is architecture and routing for agents, not a style guide.

### adding a substep (architectural checklist)

1. step UI under `Steps/...`
2. Yup fields with `.meta({ id, stepId, ... })` so validation and step-gating both see them
3. change-dependencies on source meta when the field invalidates others
4. review coverage for new paths

### disabled / loading

disable until dependencies are selected; show `resource.isFetching` loading on selects; explain why disabled in helper text.

## testing / storybook

exercise the three concerns where relevant: schema validation, footer step-gating, and meta-driven cascades. CT specs live next to components; registry/effect unit tests live under `yupSchemas/` and `fieldMetaChangeEffects/`. story titles: `Wizards/RosaHCPWizard`, `Form Elements/*`, `Form Elements/Connected Form Elements/*`.

## domain terms

ROSA (Red Hat OpenShift Service on AWS), HCP (Hosted Control Plane), OIDC, KMS, STS, CAPA (Cluster API Provider AWS), machine pool (worker node group).
