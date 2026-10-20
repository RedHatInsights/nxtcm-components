# Playwright suite audit — 2026-10-20

Base: `FCN-343-refactor-tests` at `3ce3a366`. Installed the branch lockfile with `npm ci` before collecting the baseline. Scope: test specs, test helpers and this audit only. Production code, dependencies and configuration remain unchanged.

## Verification

| Check | Baseline | After cleanup |
| --- | --- | --- |
| Unit tests | 418 passed in 31 suites | 423 passed in 32 suites |
| Component tests | 811 passed, 1 skipped (812 collected) | 694 passed, 1 skipped (695 collected) |
| E2E | 25 passed | 23 passed |
| Build | Pass | Pass |
| Lint | Pass | Pass |
| Type-check | Pass | Pass |

Commands: `npm run build`, `npm run lint`, `npm run type-check`, `npm run test:all:quiet`, `npm run test:e2e`, using Node 26.8.1. Counts below are source test declarations, not collected cases: loops can expand declarations into several cases.

## Disposition of all 64 specs

No deletion is based solely on assertion count. Independent data inputs, loading with existing data versus no data, validation paths, callbacks and accessibility states stay separate. Repeated assertions using the same mount are combined when they describe one initial state.

| Spec | Declarations before → after | Decision and retained behavior |
| --- | --- | --- |
| [AdvisorCategories](../../packages/nxtcm-dashboard/src/AdvisorRecommendations/AdvisorCategories.spec.tsx) | 9 → 6 | Consolidate default chart/title/legend and identical loading mounts; retain custom title, zero/large counts and accessibility. |
| [AdvisorSeverity](../../packages/nxtcm-dashboard/src/AdvisorRecommendations/AdvisorSeverity.spec.tsx) | 15 → 13 | Consolidate labels/counts and identical loading mounts; retain explicit severity-icon IDs, badge/title configuration, callback, counts and accessibility. |
| [CVECard](../../packages/nxtcm-dashboard/src/CVECard/CVECard.spec.tsx) | 36 → 32 | Remove duplicate role/class cases and arbitrary SVG claims; preserve className forwarding, severity/count/order/input variants, callbacks and existing accessibility skip. |
| [ClusterRecommendations](../../packages/nxtcm-dashboard/src/ClusterRecommendations/ClusterRecommendations.spec.tsx) | 14 → 13 | Remove arbitrary SVG count; retain category/critical metrics, configuration, loading, callbacks and accessibility. |
| [ClustersWithIssues](../../packages/nxtcm-dashboard/src/ClustersWithIssues/ClustersWithIssues.spec.tsx) | 30 → 27 | Use grid/row/button/navigation roles and retrying counts; remove fake divider/SVG assertions and identical loading mount; retain pagination, empty/data/loading and console cases. |
| [CostManagement](../../packages/nxtcm-dashboard/src/CostManagement/CostManagement.spec.tsx) | 17 → 12 | Consolidate default summary/list and identical loading mounts; verify callback calls and arguments; retain currency, zero/large totals and empty list contracts. |
| [ExpiredTrials](../../packages/nxtcm-dashboard/src/ExpiredTrials/ExpiredTrials.spec.tsx) | 16 → 16 | Use named kebab/page controls and retrying counts; retain row actions, callbacks, empty/loading and pagination inputs. |
| [NotificationsPanel](../../packages/nxtcm-dashboard/src/NotificationsPanel/NotificationsPanel.spec.tsx) | 30 → 29 | Use existing count ID and grid/row roles; remove arbitrary bell SVG assertion; retain item variants, callback priority, pagination, loading and empty states. |
| [ResourceUtilization](../../packages/nxtcm-dashboard/src/ResourceUtilization/ResourceUtilization.spec.tsx) | 22 → 14 | Consolidate each metric outcome and identical loading mounts; retain zero/large/high utilization, optional storage/title and callback states. |
| [StorageCard](../../packages/nxtcm-dashboard/src/StorageCard/StorageCard.spec.tsx) | 16 → 10 | Consolidate default summary/breakdown using existing metric IDs and fixed expected values; retain chart accessibility, precision, high/low usage, callback and loading states. |
| [Subscriptions](../../packages/nxtcm-dashboard/src/Subscriptions/Subscriptions.spec.tsx) | 26 → 16 | Consolidate labels/counts and action-presence checks into callback tests; replace tag names with absent actions; retain mixed callbacks, isolation and count/loading variants. |
| [Telemetry](../../packages/nxtcm-dashboard/src/Telemetry/Telemetry.spec.tsx) | 13 → 7 | Consolidate status summaries and identical loading mounts; remove generic icons and framework divider; retain zero/large counts and accessibility. |
| [ClusterProviders](../../packages/nxtcm-dashboard/src/TotalClusters/ClusterProviders.spec.tsx) | 10 → 7 | Consolidate default chart/legend and identical loading mounts; retain single/multiple providers, zero counts, custom title and accessibility. |
| [TotalClusters](../../packages/nxtcm-dashboard/src/TotalClusters/TotalClusters.spec.tsx) | 12 → 6 | Consolidate default and loading outcomes; action interaction protects callback-provided case; retain zero/large values and accessibility. |
| [UpdateStatus](../../packages/nxtcm-dashboard/src/UpdateStatus/UpdateStatus.spec.tsx) | 17 → 9 | Consolidate status summaries and identical loading mounts; remove generic icons/dividers; retain updating/omitted/zero/large/accessibility states. |
| [UpgradeRisks](../../packages/nxtcm-dashboard/src/UpgradeRisks/UpgradeRisks.spec.tsx) | 10 → 8 | Consolidate default values and duplicate callback interaction; use existing count IDs; retain unequal/zero/loading/no-action/accessibility cases. |
| [RosaHcpWizardFooter](../../packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.spec.tsx) | 21 → 21 | Retain validation timing, step error state, dependent data, navigation, and exact submission callback contracts. |
| [RosaHcpYamlEditorFooter](../../packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpYamlEditorFooter.spec.tsx) | 8 → 8 | Retain confirmation/cancel/submission behavior, exact YAML callback payload, schema-error guard and accessibility. |
| [ROSAHCPWizard](../../packages/nxtcm-rosa-hcp-wizard/src/ROSAHCPWizard.spec.tsx) | 7 → 4 | Consolidate initial UI; verify configured removal of a particular navigation step while retaining another; retain custom strings/accessibility. |
| [ROSAHCPWizardBody](../../packages/nxtcm-rosa-hcp-wizard/src/ROSAHCPWizardBody.spec.tsx) | 8 → 8 | Retain error/wizard boundary, callbacks, error clearing and accessibility states. |
| [RosaWizardSubmitError](../../packages/nxtcm-rosa-hcp-wizard/src/RosaWizardSubmitError/RosaWizardSubmitError.spec.tsx) | 9 → 9 | Retain string/boolean error inputs, absent/present/back-loading states, callbacks and error clearing. |
| [ClusterWideProxy](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy.spec.tsx) | 28 → 22 | Consolidate initial guidance and fields; retain each URL/domain validation, dependency/reset and prepopulated input case. |
| [Details](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/Details/Details.spec.tsx) | 45 → 39 | Consolidate initial fields with semantic controls; retain separate empty/loading/validation/async uniqueness/version grouping and refetch cases. |
| [MachinePools](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/MachinePools/MachinePools.spec.tsx) | 19 → 19 | Retain VPC/subnet/security-group dependencies, ordering, autoscaling limits/reset, hidden config, refresh and loading cases. |
| [MachinePoolsAdvancedSection](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/MachinePools/MachinePoolsAdvancedSection.spec.tsx) | 11 → 11 | Retain version/VPC-specific visibility, IMDS state writes/reset, disk input and expanded accessibility. |
| [Networking](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/Networking/Networking.spec.tsx) | 48 → 46 | Remove two exact duplicate expansion assertions; retain separate empty-config, CIDR, privacy, proxy and validation inputs. |
| [RolesAndPolicies](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/RolesAndPolicies/RolesAndPolicies.spec.tsx) | 42 → 39 | Consolidate initial section/selector display; retain loading/refresh, role version restrictions, error precedence, credentials, OIDC and expansion cases. |
| [ClusterUpdates](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/OptionalSetup/ClusterUpdates/ClusterUpdates.spec.tsx) | 8 → 8 | Retain manual/automatic strategy, schedule state updates, visibility and required validation. |
| [Encryption](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/OptionalSetup/Encryption/Encryption.spec.tsx) | 29 → 23 | Consolidate default KMS choices/guidance; retain preselected and user-selected custom/etcd states, validation and reset cases. |
| [ROSAHCPWizardReviewSections](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/Review/ROSAHCPWizardReviewSections.spec.tsx) | 4 → 3 | Replace nonzero/first-section checks with exact seven labels/order; assert which configured section disappears and which remains. |
| [Review](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/Review/Review.spec.tsx) | 12 → 12 | Retain human-readable summaries and configuration-dependent proxy/autoscaling/encryption/update visibility. |
| [ReviewExpandSection](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/Review/ReviewExpandSection.spec.tsx) | 2 → 2 | Retain both public initialExpanded values; separate initial-state contracts. |
| [ReviewFieldRow](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/Review/ReviewFieldRow.spec.tsx) | 14 → 13 | Prefer locked-setting explanation and actual content expansion over SVG/pre tags; retain hideInReview, lock, collapse and accessibility variants. |
| [ReviewFieldRowShared](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/Review/ReviewFieldRowShared.spec.tsx) | 7 → 6 | Remove generic lock SVG assertion; retain custom locked explanation, unlocked absence, ReactNode children and accessibility in both states. |
| [RosaHcpSchemaPanel](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/RosaHcpSchemaPanel.spec.tsx) | 10 → 10 | Retain schema fields, search/filter/clear, nested expansion/collapse, close callback and accessibility. |
| [RosaHcpYamlEditorStep](../../packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/RosaHcpYamlEditorStep.spec.tsx) | 10 → 1 | One semantic initialization smoke test replaces repeated class-based mounts and misleading language/callback claims; real editing lives in E2E. |
| [AccountRoles](../../packages/nxtcm-rosa-hcp-wizard/src/components/DetailsStepDrawer/AccountRoles.spec.tsx) | 4 → 4 | Assert explanatory manual-instructions content instead of PatternFly alert classes; retain command, external link and accessibility. |
| [AssociateAWSAccountInfo](../../packages/nxtcm-rosa-hcp-wizard/src/components/DetailsStepDrawer/AssociateAWSAccountInfo.spec.tsx) | 8 → 8 | Retain title/ReactNode content, initial expanded/collapsed, both interaction directions and accessibility states. |
| [DetailsStepDrawer](../../packages/nxtcm-rosa-hcp-wizard/src/components/DetailsStepDrawer/DetailsStepDrawer.spec.tsx) | 13 → 10 | Remove redundant close-button/panel-presence checks; assert OCM command forwarding; retain both close interactions, expanded/collapsed content and accessibility. |
| [LoginStep](../../packages/nxtcm-rosa-hcp-wizard/src/components/DetailsStepDrawer/LoginStep.spec.tsx) | 4 → 3 | Use textbox value to check default ACM and OCM commands; remove duplicate wrapper-only test; retain accessibility. |
| [OCMRole](../../packages/nxtcm-rosa-hcp-wizard/src/components/DetailsStepDrawer/OCMRole.spec.tsx) | 10 → 10 | Assert linked-role guidance instead of PatternFly classes; retain create/admin/link commands, tabs, external link and accessibility. |
| [TabGroup](../../packages/nxtcm-rosa-hcp-wizard/src/components/DetailsStepDrawer/TabGroup.spec.tsx) | 10 → 8 | Consolidate initial tabs/content/selected state; retain each navigation/return path, custom IDs, complex content and accessibility. |
| [UserRole](../../packages/nxtcm-rosa-hcp-wizard/src/components/DetailsStepDrawer/UserRole.spec.tsx) | 8 → 8 | Assert linked-role guidance instead of PatternFly classes; retain create/link commands, tabs, popover and accessibility. |
| [FieldWithAPIErrorAlert](../../packages/nxtcm-rosa-hcp-wizard/src/components/FieldWithAPIErrorAlert.spec.tsx) | 3 → 3 | Retain string versus boolean error behavior, popover and fetching suppression. |
| [FieldWrapper](../../packages/nxtcm-rosa-hcp-wizard/src/components/FieldWrapper.spec.tsx) | 4 → 4 | Retain parameterized public size/max-width behavior; remove implementation class-name assertion. |
| [Checkbox](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/Checkbox/Checkbox.spec.tsx) | 3 → 3 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [FileUpload](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/FileUpload/FileUpload.spec.tsx) | 2 → 2 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [HelperText](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/HelperText/HelperText.spec.tsx) | 9 → 4 | Keep four browser rendering states; move five pure getValidated/helperTextId tests unchanged to Jest. |
| [LabelHelp](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/LabelHelp/LabelHelp.spec.tsx) | 3 → 3 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [MultiSelect](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/MultiSelect/MultiSelect.spec.tsx) | 6 → 6 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [NumberInput](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/NumberInput/NumberInput.spec.tsx) | 3 → 3 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [Radio](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/Radio/Radio.spec.tsx) | 2 → 2 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [RadioGroup](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/RadioGroup/RadioGroup.spec.tsx) | 4 → 4 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [Select](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/Select/Select.spec.tsx) | 6 → 6 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [TextInput](../../packages/nxtcm-rosa-hcp-wizard/src/components/Fields/TextInput/TextInput.spec.tsx) | 3 → 3 | Retain public label/help/default behavior and user-driven value/error/selection contracts; distinct from form-connected wrappers. |
| [WizCheckbox](../../packages/nxtcm-rosa-hcp-wizard/src/components/WizFields/WizCheckbox/WizCheckbox.spec.tsx) | 8 → 8 | Retain form binding, explicit/Yup/fallback metadata, validation reveal/clear and control-only contracts; distinct from base field rendering. |
| [WizFileUpload](../../packages/nxtcm-rosa-hcp-wizard/src/components/WizFields/WizFileUpload/WizFileUpload.spec.tsx) | 8 → 8 | Retain form binding, explicit/Yup/fallback metadata, validation reveal/clear and control-only contracts; distinct from base field rendering. |
| [WizMultiSelect](../../packages/nxtcm-rosa-hcp-wizard/src/components/WizFields/WizMultiSelect/WizMultiSelect.spec.tsx) | 7 → 7 | Retain form binding, explicit/Yup/fallback metadata, validation reveal/clear and control-only contracts; distinct from base field rendering. |
| [WizNumberInput](../../packages/nxtcm-rosa-hcp-wizard/src/components/WizFields/WizNumberInput/WizNumberInput.spec.tsx) | 8 → 8 | Retain form binding, explicit/Yup/fallback metadata, validation reveal/clear and control-only contracts; distinct from base field rendering. |
| [WizRadioGroup](../../packages/nxtcm-rosa-hcp-wizard/src/components/WizFields/WizRadioGroup/WizRadioGroup.spec.tsx) | 10 → 10 | Retain form binding, explicit/Yup/fallback metadata, validation reveal/clear and control-only contracts; distinct from base field rendering. |
| [WizSelect](../../packages/nxtcm-rosa-hcp-wizard/src/components/WizFields/WizSelect/WizSelect.spec.tsx) | 12 → 12 | Retain form binding, explicit/Yup/fallback metadata, validation reveal/clear and control-only contracts; distinct from base field rendering. |
| [WizTextInput](../../packages/nxtcm-rosa-hcp-wizard/src/components/WizFields/WizTextInput/WizTextInput.spec.tsx) | 12 → 12 | Retain form binding, explicit/Yup/fallback metadata, validation reveal/clear and control-only contracts; distinct from base field rendering. |
| [rosa-wizard-yaml-editor](../../playwright/e2e/rosa-wizard-yaml-editor.spec.ts) | 8 → 6 | Consolidate initial actions; exercise keyboard editing, discard/cancel retention and schema visibility; replace fixed delay with observable readiness. |
| [rosa-wizard](../../playwright/e2e/rosa-wizard.spec.ts) | 17 → 17 | Retain full form-to-review integration and each independent invalid input; overlap with CT protects integration boundaries. |

## Removal and consolidation mapping

Original test titles are listed below so a reviewer can locate every removed or renamed case at the base commit. Existing tests strengthened without a title change are described in the disposition table.

### TotalClusters.spec.tsx

- **should display the total cluster count** → Consolidated into should display the default cluster summary without a count action.
- **should render the default title** → Covered by should display the default cluster summary without a count action.
- **should display the total label** → Covered by should display the default cluster summary without a count action.
- **should render count as plain text when onViewMore is not provided** → Covered by should display the default cluster summary without a count action.
- **should render skeleton when isLoading is true** → Consolidated into should show loading status and title without the count.
- **should still show title when loading** → Covered by should show loading status and title without the count.
- **should render skeleton when isLoading is true without data** → loading status and title test (identical no-data mount).
- **should render count as clickable link when onViewMore is provided** → onViewMore click callback test.

### ResourceUtilization.spec.tsx

- **should render skeleton when isLoading is true without data** → loading test (identical no-data mount).
- **should show View more button when onViewMore is provided** → onViewMore click callback test.
- **should render vCPU metric section** → One metric outcome protects heading, percentage, total and unit.
- **should display vCPU title** → Covered by vCPU usage, total and unit test.
- **should calculate and display vCPU percentage (25%)** → Covered by vCPU usage, total and unit test.
- **should display vCPU subtitle with total and unit** → Covered by vCPU usage, total and unit test.
- **should render Memory metric section** → One metric outcome protects heading, percentage, total and unit.
- **should display Memory title** → Covered by Memory usage, total and unit test.
- **should calculate and display Memory percentage (19%)** → Covered by Memory usage, total and unit test.
- **should display Memory subtitle with total and unit** → Covered by Memory usage, total and unit test.

### UpgradeRisks.spec.tsx

- **should render View upgrade risks link when onViewRisks is provided** → onViewRisks click callback test (exact duplicate).
- **should render correctly with all props** → Assert all risk values via existing ids and visible severity labels.
- **should display zero counts correctly** → Assert all risk values via existing ids and visible severity labels.
- **should display different counts for each risk type** → Assert all risk values via existing ids and visible severity labels.
- **should display correct risk counts** → default all-props test covers all four values and severity labels.

### CVECard.spec.tsx

- **should render links as buttons with correct role** → view links callback-provided test (exact duplicate).
- **should render icons for different severity levels** → severity labels and counts; arbitrary SVG presence does not identify severity.
- **should display correct icon colors for severity levels** → severity labels and counts; old assertion never checked color.
- **should apply custom className when provided** → Custom class forwarding is covered by the earlier className test.
- **should apply custom className when provided** → Verify public className forwarding on mount root without a CSS selector.

### ClusterRecommendations.spec.tsx

- **should render critical icons** → critical count and category labels; arbitrary SVG count is a framework detail.

### Subscriptions.spec.tsx

- **should render icons correctly** → subscription and instance counts/labels; arbitrary SVG does not identify icon.
- **should render the component with correct counts** → Consolidated into should display subscription and instance summaries.
- **should display description text** → Covered by should display subscription and instance summaries.
- **should display "Subscriptions" label** → Covered by should display subscription and instance summaries.
- **should display "Instances" label** → Covered by should display subscription and instance summaries.
- **should display subscription count** → default summary test.
- **should display instance count** → default summary test.
- **should show View subscriptions button when onViewSubscriptions is provided** → View subscriptions callback interaction test.
- **should render subscription count as button when onSubscriptionsClick is provided** → subscription callback interaction test.
- **should render instance count as button when onInstancesClick is provided** → instance callback interaction test.
- **should render both counts as clickable when both callbacks are provided** → multiple-clickable-count callback isolation test.
- **should render subscription count as span when onSubscriptionsClick is not provided** → Assert displayed value and absent action instead of HTML tag.
- **should render instance count as span when onInstancesClick is not provided** → Assert displayed value and absent action instead of HTML tag.

### Telemetry.spec.tsx

- **should render icons for both statuses** → connected/disconnected labels and counts.
- **should render the connected count** → Consolidated into should display connected and disconnected cluster summaries.
- **should render the disconnected count** → Covered by should display connected and disconnected cluster summaries.
- **should render the connected label** → Covered by should display connected and disconnected cluster summaries.
- **should render the disconnected label** → Covered by should display connected and disconnected cluster summaries.
- **should render a vertical divider** → status summaries cover content grouping; divider is framework layout.
- **should render skeleton when isLoading is true without data** → identical no-data loading mount already covered.

### UpdateStatus.spec.tsx

- **should render two icons when no updating data** → up-to-date and update-available labels/counts.
- **should render three icons when updating data is provided** → currently updating conditional section test.
- **should render the up-to-date count** → Consolidated into should display update summaries without an omitted updating count.
- **should render the update available count** → Covered by should display update summaries without an omitted updating count.
- **should render labels for both statuses** → Covered by should display update summaries without an omitted updating count.
- **should not show currently updating section when omitted** → Covered by should display update summaries without an omitted updating count.
- **should render a vertical divider** → status summaries cover content grouping; divider is framework layout.
- **should render two dividers when updating data is provided** → currently-updating conditional test covers content; divider count is framework layout.
- **should render skeleton when isLoading is true without data** → identical no-data loading mount already covered.

### ClustersWithIssues.spec.tsx

- **should render a divider after the cluster count** → cluster count test; old assertion did not identify a divider.
- **should render external link icon in each console link** → console link text and visibility tests cover meaning.
- **should render skeleton when isLoading is true without data** → Identical no-data loading mount is covered by the other loading test; keep the data-provided case where present.

### DetailsStepDrawer.spec.tsx

- **should render close button in drawer header** → header close interaction test.
- **should render close button at bottom** → exact bottom close interaction test.
- **should render resizable panel** → expanded panel title test; old assertion never exercised resizing.

### LoginStep.spec.tsx

- **should render ROSA login instruction** → default ACM login command test.

### ReviewFieldRow.spec.tsx

- **should show lock icon when noEditAfterStep is true** → locked-setting screen-reader text test.
- **should not show lock icon when noEditAfterStep is false** → Renamed and strengthened: editable value visible and locked-setting explanation absent.

### ReviewFieldRowShared.spec.tsx

- **should show lock icon when noEditAfterStep is true** → locked-setting screen-reader text test.

### TabGroup.spec.tsx

- **should render all tab buttons** → Consolidated into should display all tabs with only the first selected and visible.
- **should show first tab content by default** → Covered by should display all tabs with only the first selected and visible.
- **should have first tab selected by default** → Covered by should display all tabs with only the first selected and visible.

### Networking.spec.tsx

- **should render CIDR alert in advanced section** → Exact duplicate: advanced section expansion test, including CIDR alert.
- **should show the proxy checkbox when config is not provided** → Exact duplicate: configure proxy checkbox test with undefined config.

### HelperText.spec.tsx

- **returns undefined when neither error nor success** → Moved intact to co-located helperTextUtils.test.ts (Jest).
- **returns id fragment when isError and errorMessage, helper text, or isSuccess and successMessage** → Moved intact to co-located helperTextUtils.test.ts (Jest).
- **returns empty string when no helper content to show** → Moved intact to co-located helperTextUtils.test.ts (Jest).
- **returns error when isError is true** → Moved unchanged to helperTextUtils.test.ts under Jest.
- **returns success when isSuccess is true and not error** → Moved unchanged to helperTextUtils.test.ts under Jest.

### NotificationsPanel.spec.tsx

- **should render bell icon in header** → header/title/count tests convey notification meaning; SVG assertion does not identify bell.

### StorageCard.spec.tsx

- **should display the total storage used** → One default storage outcome with fixed expected values.
- **should display the correct usage percentage** → Covered by total storage, utilization and breakdown test.
- **should display ROSA clusters storage** → Covered by total storage, utilization and breakdown test.
- **should display ARO clusters storage** → Covered by total storage, utilization and breakdown test.
- **should display OSD clusters storage** → Covered by total storage, utilization and breakdown test.
- **should display available storage** → Covered by total storage, utilization and breakdown test.
- **should display total storage label correctly** → Covered by total storage, utilization and breakdown test.

### ROSAHCPWizard.spec.tsx

- **should render wizard with string provider** → Initial UI contract replaces separate framework-root, nav, field and footer mounts.
- **should render wizard steps** → Covered by initial Details navigation/footer test.
- **should render first step content** → Covered by initial Details navigation/footer test.
- **should render wizard footer with navigation buttons** → Covered by initial Details navigation/footer test.

### Details.spec.tsx

- **should render the Details section title** → Consolidated into should display cluster details fields and the account association action.
- **should render OpenShift version select** → Covered by should display cluster details fields and the account association action.
- **should render the Cluster name input** → Covered by should display cluster details fields and the account association action.
- **should render the Associated AWS infrastructure account select** → Covered by should display cluster details fields and the account association action.
- **should render the Associated AWS billing account select** → Covered by should display cluster details fields and the account association action.
- **should render the Region select** → Covered by should display cluster details fields and the account association action.
- **should render the Associate a new AWS account button** → Covered by should display cluster details fields and the account association action.

### ClusterWideProxy.spec.tsx

- **should render the section title** → Consolidated into should explain proxy configuration and link to documentation.
- **should render the intro text** → Covered by should explain proxy configuration and link to documentation.
- **should render the learn more link** → Covered by should explain proxy configuration and link to documentation.
- **should render the configure at least 1 field alert** → Covered by should explain proxy configuration and link to documentation.
- **should render the HTTP proxy URL input** → Consolidated into should display the proxy configuration fields.
- **should render the HTTPS proxy URL input** → Covered by should display the proxy configuration fields.
- **should render the No Proxy domains input** → Covered by should display the proxy configuration fields.
- **should render the Additional trust bundle field** → Covered by should display the proxy configuration fields.

### RolesAndPolicies.spec.tsx

- **should render the Account roles section title** → Consolidated into should display role sections and installer and OIDC selectors.
- **should render the Operator roles section title** → Covered by should display role sections and installer and OIDC selectors.
- **should render the Installer role select** → Covered by should display role sections and installer and OIDC selectors.
- **should render the OIDC config ID select** → Covered by should display role sections and installer and OIDC selectors.

### Encryption.spec.tsx

- **should render the Advanced encryption section title** → Consolidated into should display encryption choices with default KMS selected and guidance.
- **should render the Encryption Keys radio group** → Covered by should display encryption choices with default KMS selected and guidance.
- **should render the default KMS radio option** → Covered by should display encryption choices with default KMS selected and guidance.
- **should render the custom KMS radio option** → Covered by should display encryption choices with default KMS selected and guidance.
- **should have default KMS selected by default** → Covered by should display encryption choices with default KMS selected and guidance.
- **should render the Learn more link for encryption keys** → Covered by should display encryption choices with default KMS selected and guidance.
- **should render the info alert about encryption keys** → Covered by should display encryption choices with default KMS selected and guidance.

### AdvisorCategories.spec.tsx

- **should render the default title** → Consolidated into should display the category chart, title and legend counts.
- **should render the category chart** → Covered by should display the category chart, title and legend counts.
- **should render all category legend items with counts** → Covered by should display the category chart, title and legend counts.
- **should render skeleton when isLoading is true without data** → Identical no-data loading mount is covered by the other loading test; keep the data-provided case where present.

### AdvisorSeverity.spec.tsx

- **should render all four severity counts** → Consolidated into should display every severity label and count.
- **should render severity labels** → Covered by should display every severity label and count.
- **should render skeleton when isLoading is true without data** → Identical no-data loading mount is covered by the other loading test; keep the data-provided case where present.

### CostManagement.spec.tsx

- **renders the title** → Consolidated into displays the cost summary with a formatted total.
- **displays the formatted total cost** → Covered by displays the cost summary with a formatted total.
- **displays month-to-date label** → Covered by displays the cost summary with a formatted total.
- **displays top clusters heading** → Consolidated into displays top clusters with their costs and percentages.
- **renders cluster names** → Covered by displays top clusters with their costs and percentages.
- **renders cluster costs with percentages** → Covered by displays top clusters with their costs and percentages.
- **should render skeleton when isLoading is true without data** → Identical no-data loading mount is covered by the other loading test; keep the data-provided case where present.
- **renders cluster names as links when onClusterClick is provided** → Exercise cluster actions and verify exact callback arguments.
- **shows "View more in Cost Management" link when onViewMore is set** → Verify View more invokes its callback.

### ROSAHCPWizardReviewSections.spec.tsx

- **should render hook output with sections** → Verify exact section labels and ordering rather than nonzero count and first item presence.
- **should render section labels** → Covered by seven expected review section labels test.

### ClusterProviders.spec.tsx

- **should render the default title** → Consolidated into should display the provider chart, title and legend counts.
- **should render the donut chart** → Covered by should display the provider chart, title and legend counts.
- **should render legend items with counts** → Covered by should display the provider chart, title and legend counts.
- **should render skeleton when isLoading is true without data** → Identical no-data loading mount covered by the other loading test.

### RosaHcpYamlEditorStep.spec.tsx

- **renders Monaco editor** → Consolidated into initialization smoke test with named textbox, schema heading, export controls and absent error.
- **displays CodeEditor component** → Consolidated into initialization smoke test with named textbox, schema heading, export controls and absent error.
- **renders schema toggle button** → Consolidated into initialization smoke test with named textbox, schema heading, export controls and absent error.
- **does not show error banner initially** → Consolidated into initialization smoke test with named textbox, schema heading, export controls and absent error.
- **renders without errors when onClose prop is provided** → Removed render-only prop test; actual discard/onClose interaction remains covered by footer CT and E2E.
- **renders without errors when onCancel prop is provided** → Removed render-only prop test; onCancel is unused by this editor component. Footer cancellation callback remains covered separately.
- **sets up YAML language mode** → Removed misleading language-mode claim: view-lines visibility never verified YAML language configuration. Semantic editor smoke coverage remains.
- **enables copy functionality** → Consolidated into initialization smoke test; presence of export controls is tested, clipboard/download behavior is not claimed.
- **enables download functionality** → Consolidated into initialization smoke test; presence of export controls is tested, clipboard/download behavior is not claimed.
- **Monaco textarea is accessible** → Consolidated into initialization smoke test with named textbox, schema heading, export controls and absent error.

### rosa-wizard-yaml-editor.spec.ts

- **opens YAML editor from review page** → Covered by opens YAML editor from Review with cluster creation actions.
- **closes YAML editor with Discard button and confirmation** → Replaced by actual keyboard edit, confirmed discard, return to Review, and reopened document without the edit.
- **cancels discard confirmation** → Replaced by keyboard edit followed by canceled discard; verifies edited document remains.
- **YAML content is editable in Monaco editor** → Replaced model-existence assertion with keyboard editing and observed document change.
- **schema panel toggle button is available** → Replaced toggle presence with hide/reopen interaction and schema heading visibility.
- **create cluster button is visible** → Covered by opens YAML editor from Review with cluster creation actions.
- **cancel button is visible** → Covered by opens YAML editor from Review with cluster creation actions.

## Coverage limits and follow-ups

- The existing CVECard accessibility skip remains: the test documents a PatternFly color-contrast violation. The passing suite does not resolve that issue.
- `RosaHcpYamlEditorStep` accepts `onCancel` but does not use it. The deleted prop-presence test never exercised cancellation. Footer cancellation and discard callbacks remain independently tested. Product changes need a separate decision.
- Monaco CT now verifies initialization through the named editor textbox, schema heading and available export controls. Keyboard editing and schema toggling are exercised in E2E. The removed “YAML language mode” assertion only checked a rendered DOM class; language configuration, clipboard contents and downloaded file contents are not newly verified.
- Drawer resizing and decorative icon colors/shapes remain unverified. Deleted tests only checked panel/SVG presence, so they offered no evidence of those behaviors. Visible status/severity labels and counts remain covered.
- Count/metric test IDs are retained where there is no named semantic grouping (for example storage and risk values). Existing form-group/listbox IDs in retained validation helpers remain fallbacks; changing production semantics is outside this cleanup.
- Public `className` forwarding and parameterized FieldWrapper widths remain tested. A short style assertion is useful when it verifies an explicit public contract.
- Parameterized validation inputs remain independently collected; related assertions were combined only within a single setup/outcome.
