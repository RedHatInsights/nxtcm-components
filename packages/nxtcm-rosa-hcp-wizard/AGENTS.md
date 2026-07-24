# nxtcm-rosa-hcp-wizard package

package-level context for `@redhat-cloud-services/nxtcm-rosa-hcp-wizard`. read the root [AGENTS.md](../../AGENTS.md) first — this file adds package-specific details.

## what this package is

multi-step wizard for creating ROSA HCP (Hosted Control Plane) clusters. uses PatternFly `Wizard` + `react-hook-form` (`FormProvider` + yup resolver). consumed by ACM console and OCM portal (uhc-portal).

## package structure

```text
src/
  Steps/                    # wizard step implementations (basic setup, optional setup, review, yaml editor)
  components/               # shared form/field building blocks
  fieldMetaChangeEffects/   # cascade reset + dependency side effects
  yupSchemas/               # validation schemas
  stringsProvider/          # UI/validator string bundles and context
  hooks/                    # package hooks
  types/ and types.ts       # domain/resource contract types
  utilities/                # helpers
  test/ and *.spec.tsx      # fixtures and component tests
```

## key types

all in `src/types.ts`:

- `ROSAHCPWizardData` — async resources + validation resources passed into the wizard
- `ROSAHCPCluster` — wizard submit payload shape
- `Resource<TData, TArgs>` — async data container passed by consuming apps
- `VPC`, `Subnet`, `SecurityGroup`, `Role`, `OIDCConfig` — AWS resource types

## form state management

uses `react-hook-form` directly (FormProvider + yupResolver in `RosaHcpWizardFormProvider`):

- `useFormContext()` / `useWatch()` for reading form values
- `setValue()` for writing form values and cascade resets
- cascade logic lives in `src/fieldMetaChangeEffects/` (not inline `onValueChange` callbacks)
- yup schemas in `src/yupSchemas/` for per-step validation
- cascade reset: changing region → clears VPC → clears subnets → clears SGs

## Resource<T> integration

components do not own API calls. consuming apps own backend communication and pass resource callbacks.
substeps call `resource.fetch?.()` on selection changes:

```tsx
// fieldMetaChangeEffects: when region changes, reset dependents and refetch
setValue('selected_vpc', '');
setValue('machine_pools_subnets', [{ machine_pool_subnet: '' }]);
setValue('security_groups_worker', []);
setValue('cluster_privacy_public_subnet_id', '');

vpcList.fetch?.({
  account_id: getValues('associated_aws_id'),
  role_arn: getValues('installer_role_arn'),
  region: newRegion,
});
```

consuming apps provide the `fetch` implementation. this package only calls it via the injected resource.

## fields architecture

two layers of form field components:

1. **Base fields** (`src/components/Fields/`) — presentational, no form awareness
   - `Select`, `TextInput`, `NumberInput`, `Radio`, `Checkbox`, `MultiSelect`, `FileUpload`

2. **Wiz fields** (`src/components/WizFields/`) — form-connected wrappers
   - `WizSelect`, `WizTextInput`, `WizNumberInput`, `WizRadioGroup`, `WizMultiSelect`, `WizFileUpload`, `WizCheckbox`
   - use `useFormContext()` + `Controller` to bind to form state
   - handle validation display, helper text, label help

## patterns to follow

### adding a new substep

1. create directory under the appropriate step: `Steps/BasicSetup/NewSubstep/`
2. create the component, barrel export (`index.ts`), CT spec, spec-helpers, story, and unit test together in the component directory
3. wire into the step's layout component
4. add yup schema fields in `src/yupSchemas/`
5. add review row in `Steps/Review/`

### cascade reset

when a parent field changes, `fieldMetaChangeEffects` clears transitive dependents via `resetFieldsToDefaultValues` and refetches downstream resources:

```tsx
// src/fieldMetaChangeEffects/ — region change effect
resetFieldsToDefaultValues(setValue, [
  'selected_vpc',
  'machine_pools_subnets',
  'security_groups_worker',
  'cluster_privacy_public_subnet_id',
]);

vpcList.fetch?.({
  account_id: getValues('associated_aws_id'),
  role_arn: getValues('installer_role_arn'),
  region: newRegion,
});
machineTypes.fetch?.({
  role_arn: getValues('installer_role_arn'),
  region: newRegion,
  availability_zones: [],
});
```

### disabled/loading states

- show loading spinner in select when `resource.isFetching === true`
- disable fields when their dependency hasn't been selected yet
- show helper text explaining why a field is disabled

## testing

- CT specs per component, using spec-helpers for form context wrappers
- spec-helpers provide `FormWrapper` that wraps component in `FormProvider` with default values
- test: rendering, validation messages, field interactions, cascade behavior

## storybook

stories currently use these title groups:

- `Wizards/RosaHCPWizard` for full wizard flows
- `Form Elements/*` for base field components
- `Form Elements/Connected Form Elements/*` for wiz field wrappers

```tsx
const meta: Meta<typeof ROSAHCPWizard> = {
  title: 'Wizards/RosaHCPWizard',
  // ...
};
```

## known domain terms

- ROSA = Red Hat OpenShift Service on AWS
- HCP = Hosted Control Plane
- OIDC = OpenID Connect (operator auth)
- KMS = AWS Key Management Service
- STS = Security Token Service
- CAPA = Cluster API Provider AWS (CRD model)
- machine pool = worker node group
