# Rosa HCP wizard localizable strings

<!--
Function: reference catalog of every localizable string on RosaHCPWizard.
Purpose: a host app translating the wizard can see each key in RosaHcpWizardStrings and
RosaHcpWizardValidatorStrings, and which of those sections can be left in English when
config.hiddenSteps hides Cluster-wide proxy or Cluster updates.
The lists are checked against the English defaults by src/stringsProvider/localizableStringsDoc.test.ts.
-->

This file is the reference for localizing `RosaHCPWizard`. It lists every UI string key and every validator message key the wizard can show, plus which of those groups are never shown when a step is hidden. A host supplies translations through the `strings` prop. Keys left out of that prop keep the built-in English.

`RosaHCPWizard` takes a `strings` prop (`RosaHcpWizardStringsInput`) for UI copy and validator messages. Omitted keys keep the built-in English from `rosaHcpWizardStrings.defaults.ts`. The merge is deep for plain objects: you can override one key inside a section. Functions and arrays replace the default value entirely. `clusterUpdates.daysOfWeek` is a seven-name list, index 0 = Sunday (cron day `0`) through index 6 = Saturday. If you replace it, pass all seven names.

Pass validator copy under `strings.validators`. It is not a key of the UI string object.

```tsx
import { RosaHCPWizard, STEP_IDS } from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard';

<RosaHCPWizard
  strings={{
    wizard: { next: 'Siguiente', stepLabels: { details: 'Detalles' } },
    validators: { commonRequired: 'Este campo es obligatorio' },
  }}
  config={{
    hiddenSteps: [STEP_IDS.CLUSTER_WIDE_PROXY, STEP_IDS.CLUSTER_UPDATES],
  }}
/>
```

Field labels, placeholders, and helper text are often Yup `.meta()` paths into these same keys (`labelKey`, `placeholderKey`, `helperTextKey`, `reviewLabel`). Translating the key covers the control and any review row that uses that path.

Function-valued validator messages must keep the same parameters. The wizard fills in the live values (lengths, CIDRs, field labels) at validation time.

## Sections safe to omit

Only two steps can be removed, with `config.hiddenSteps`. Hiding a step removes it from navigation and from the Review summary. The keys below are then never shown, so a partial `strings` object can leave them out and users will not see the English fallback.

Hiding one step does not affect the other. Encryption cannot be hidden, so `wizard.stepLabels.additionalSetup` stays on screen even when cluster updates is hidden.

`config.hiddenFields` is separate. `FIELD_NAME.NODES_COMPUTE` hides the fixed compute-node count only (`autoscaling.computeCountLabel`, `autoscaling.computeCountHelp`). The `autoscaling` section itself stays, because min and max node counts are still shown when autoscaling is on.

### Cluster-wide proxy

`STEP_IDS.CLUSTER_WIDE_PROXY` (`cluster-wide-proxy-step`) hides the Cluster-wide proxy step, its Review section, and the "Configure a cluster-wide proxy" checkbox on Networking. Proxy fields stay empty, so proxy validation messages are not shown.

Omit these sections:

- `clusterWideProxy`
- `validators.url`
- `validators.noProxyDomains`
- `validators.ca`
- `validators.proxyConfigureAtLeastOne`

Omit these keys inside sections you still translate:

- `wizard.stepLabels.clusterWideProxy`
- `networking.proxyCheckboxLabel`
- `networking.proxyCheckboxHelp`
- `networking.proxyNextStepInfo`

### Cluster updates

`STEP_IDS.CLUSTER_UPDATES` (`cluster-updates-step`) hides the Cluster updates step and its Review section.

Omit this section:

- `clusterUpdates` (including `clusterUpdates.daysOfWeek`)

Omit these keys inside sections you still translate:

- `wizard.stepLabels.clusterUpdatesOptional`
- `review.updateStrategy`
- `review.strategyIndividual`
- `review.strategyAutomatic`

No validator section belongs only to this step. The schedule uses `validators.commonRequired` when the strategy is automatic, and that same message is used by required fields on steps that stay visible. Keep `validators.commonRequired`.

## UI strings (`RosaHcpWizardStrings`)

Notes:

- **Omit when cluster-wide proxy is hidden** — see the section above.
- **Omit when cluster updates is hidden** — see the section above.
- **Not read** — the key is part of the type, and the current wizard never reads it. Leaving it out does not leave English copy on screen.

### `wizard`

Footer, navigation labels, and the validation alert above the footer. Required, except the two step labels called out below.

| Key | Default English | Notes |
| --- | --- | --- |
| `wizard.stepLabels.basicSetup` | Basic setup | |
| `wizard.stepLabels.details` | Details | |
| `wizard.stepLabels.rolesAndPolicies` | Roles and policies | |
| `wizard.stepLabels.machinePools` | Machine pool | |
| `wizard.stepLabels.networking` | Networking | |
| `wizard.stepLabels.clusterWideProxy` | Cluster-wide proxy | Omit when cluster-wide proxy is hidden |
| `wizard.stepLabels.additionalSetup` | Additional setup | |
| `wizard.stepLabels.encryptionOptional` | Encryption (optional) | |
| `wizard.stepLabels.clusterUpdatesOptional` | Cluster updates (optional) | Omit when cluster updates is hidden |
| `wizard.stepLabels.review` | Review | |
| `wizard.fixValidationErrors` | Please fix validation errors | |
| `wizard.skipToReview` | Skip to review | |
| `wizard.back` | Back | |
| `wizard.next` | Next | |
| `wizard.createCluster` | Create cluster | |
| `wizard.cancel` | Cancel | |

### `submitError`

Shown when cluster creation fails.

| Key | Default English |
| --- | --- |
| `submitError.title` | Error creating cluster |
| `submitError.backToReviewStep` | Back to the wizard |
| `submitError.exitWizard` | Exit wizard |

### `yamlEditor`

YAML editor opened from Review. Required even when optional steps are hidden.

| Key | Default English |
| --- | --- |
| `yamlEditor.title` | YAML Configuration |
| `yamlEditor.description` | Review and edit the YAML configuration. |
| `yamlEditor.parseErrorTitle` | YAML Schema Validation Error |
| `yamlEditor.convertError` | Error converting form data to YAML |
| `yamlEditor.invalidYaml` | Invalid YAML syntax |
| `yamlEditor.discardChanges` | Discard changes and go back to Review step |
| `yamlEditor.discardConfirmTitle` | Discard YAML changes? |
| `yamlEditor.discardConfirmBody` | Any changes you made to the YAML configuration will be lost. |
| `yamlEditor.discardConfirmYes` | Yes |
| `yamlEditor.cancelCreation` | Cancel cluster creation |
| `yamlEditor.schemaTitle` | ROSAControlPlane schema |
| `yamlEditor.schemaToggleAriaLabel` | Toggle schema panel |
| `yamlEditor.schemaShowTooltip` | Show schema |
| `yamlEditor.schemaHideTooltip` | Hide sidebar |
| `yamlEditor.schemaSearchPlaceholder` | Search schema fields... |

### `associateAwsDrawer`

"Associate a new AWS account" drawer, opened from Details.

| Key | Default English |
| --- | --- |
| `associateAwsDrawer.panelTitle` | How to associate a new AWS account |
| `associateAwsDrawer.introSts` | ROSA cluster deployments use the AWS Security Token Service for added security. Run the following required steps from a CLI authenticated with both AWS and ROSA. |
| `associateAwsDrawer.cliVersion` | You must use ROSA CLI version 1.2.31 or above. |
| `associateAwsDrawer.stepLoginTitle` | Step 1: Log in to ROSA |
| `associateAwsDrawer.step1Title` | Step 2: OCM role |
| `associateAwsDrawer.step2Title` | Step 3: User role |
| `associateAwsDrawer.step3Title` | Step 4: Account roles |
| `associateAwsDrawer.closingPrompt` | After you've completed all the steps, close this guide and choose your account. |
| `associateAwsDrawer.closeButton` | Close |
| `associateAwsDrawer.createOCMRoleAriaLabel` | Copyable ROSA create ocm-role |
| `associateAwsDrawer.createOCMRoleAdminAriaLabel` | Copyable ROSA create ocm-role --admin |
| `associateAwsDrawer.linkOCMRoleAriaLabel` | Copyable rosa link ocm-role <arn> command |

### `ocmRole`

OCM role instructions inside the associate-account drawer.

`ocmRole.linkExistingLead` starts with a space. It continues a sentence that the drawer renders before it.

| Key | Default English |
| --- | --- |
| `ocmRole.checkLinkedTitle` | First, check if a role exists and is linked with: |
| `ocmRole.existingLinkedInfo` | If there is an existing role and it's already linked to your Red Hat account, you can continue to step 3. |
| `ocmRole.unlinkedTitle` | Next, is there an existing role that isn't linked? |
| `ocmRole.tabCreateNew` | No, create new role |
| `ocmRole.tabLinkExisting` | Yes, link existing role |
| `ocmRole.basicOcmRoleLabel` | Basic OCM role |
| `ocmRole.orDivider` | OR |
| `ocmRole.adminOcmRoleLabel` | Admin OCM role |
| `ocmRole.helpDecideTitle` | Help me decide |
| `ocmRole.helpBasicBody` | The basic role enables OpenShift Cluster Manager to detect the AWS IAM roles and policies required by ROSA. |
| `ocmRole.helpAdminBody` | The admin role also enables the detection of the roles and policies. In addition, the admin role enables automatic deployment of the cluster-specific Operator roles and OpenID Connect (OIDC) provider by using OpenShift Cluster Manager. |
| `ocmRole.linkExistingLead` | ` If a role exists but is not linked, link it with:` |
| `ocmRole.orgAdminInfo` | You must have organization administrator privileges in your Red Hat account to run this command. After you link the OCM role with your Red Hat organization, it is visible for all users in the organization. |

### `userRole`

User role instructions inside the associate-account drawer.

`userRole.userRoleLabel` ends with a space.

| Key | Default English |
| --- | --- |
| `userRole.checkLinkedTitle` | First, check if a role exists and is linked with: |
| `userRole.existingLinkedInfo` | If there is an existing role and it's already linked to your Red Hat account, you can continue to step 4. |
| `userRole.unlinkedTitle` | Next, is there an existing role that isn't linked? |
| `userRole.whyLinkTitle` | Why do I need to link my account? |
| `userRole.whyLinkBodyPrefix` | The link creates a trust policy between the role and the link cluster installer. |
| `userRole.reviewPermissionsLink` | Review the AWS policy permissions for the basic and admin OCM roles. |
| `userRole.tabCreateNew` | No, create new role |
| `userRole.tabLinkExisting` | Yes, link existing role |
| `userRole.userRoleLabel` | `User role ` |
| `userRole.userRolePopover` | The user role is necessary to validate that your Red Hat user account has permissions to install a cluster in the AWS account. |
| `userRole.copyAriaListUserRole` | Copyable ROSA rosa list user-role command |
| `userRole.copyAriaLinkUserRole` | Copyable ROSA link user-role --arn |

### `accountRoles`

Account-role instructions inside the associate-account drawer.

| Key | Default English |
| --- | --- |
| `accountRoles.intro` | To create the necessary account-wide roles and policies quickly, use the default auto method that's provided by the ROSA CLI. |
| `accountRoles.copyAriaAccountRoles` | Copyable ROSA rosa create account-roles --hosted-cp --mode auto command |
| `accountRoles.manualInstructionsLead` | If you would prefer to manually create the required roles and policies within your AWS account, then follow |
| `accountRoles.manualInstructionsLink` | these instructions |

### `details`

Details step, including the control that opens the associate-account drawer.

| Key | Default English |
| --- | --- |
| `details.sectionLabel` | Cluster details |
| `details.clusterNameLabel` | Cluster name |
| `details.clusterNamePlaceholder` | Enter the cluster name |
| `details.clusterNameHelp` | This name appears in the OpenShift cluster list and forms part of the cluster console subdomain. |
| `details.openShiftVersionLabel` | OpenShift version |
| `details.openShiftVersionPlaceholder` | Select an OpenShift version |
| `details.openShiftVersionOptionDisabledDescription` | Your current account roles do not support the version of OpenShift. |
| `details.openShiftVersionGroups.latestRelease` | Latest release |
| `details.openShiftVersionGroups.defaultRelease` | Default release |
| `details.openShiftVersionGroups.defaultRecommended` | Default (Recommended) |
| `details.openShiftVersionGroups.previousReleases` | Previous releases |
| `details.openShiftVersionGroups.releases` | Releases |
| `details.awsInfraLabel` | Associated AWS infrastructure account |
| `details.awsInfraPlaceholder` | Select an AWS infrastructure account |
| `details.awsInfraHelp` | Your cluster's cloud resources will be created in the associated AWS infrastructure account. To continue, you must associate at least 1 account. |
| `details.associateNewAccount` | Associate a new AWS account |
| `details.billingLabel` | Associated AWS billing account |
| `details.billingPlaceholder` | Select an AWS billing account |
| `details.billingHelp` | The AWS account that receives billing for cluster usage and Red Hat subscription charges. This account is often the same as your associated AWS infrastructure account, but does not have to be. |
| `details.connectBillingLink` | Connect ROSA to a new AWS billing account |
| `details.regionLabel` | Region |
| `details.regionPlaceholder` | Select a region |
| `details.regionHelpLead` | The AWS Region where your compute nodes and managed control plane will be located. |
| `details.regionLearnMoreLink` | Learn more about AWS Regions. |

`details.openShiftVersionGroups.releases` is the heading when the version list has no separate latest or default group.

### `rolesAndPolicies`

Roles and policies step.

| Key | Default English |
| --- | --- |
| `rolesAndPolicies.accountRolesSection` | Account roles |
| `rolesAndPolicies.installerRoleLabel` | Installer role |
| `rolesAndPolicies.installerPlaceholder` | Select an installer role |
| `rolesAndPolicies.installerRoleOptionDisabledDescription` | This account role does not support the selected OpenShift version. |
| `rolesAndPolicies.installerHelpLead` | An AWS IAM role used by the ROSA installer |
| `rolesAndPolicies.installerLearnMoreLink` | Learn more about roles. |
| `rolesAndPolicies.arnsToggle` | Amazon Resource Names (ARNs) |
| `rolesAndPolicies.supportRoleLabel` | Support role |
| `rolesAndPolicies.supportPlaceholder` | Select a support role |
| `rolesAndPolicies.supportHelp` | An IAM role used by the Red Hat Site Reliability Engineering (SRE) support team. The role is used with the corresponding policy resource to provide the Red Hat SRE support team with the permissions required to support ROSA clusters. |
| `rolesAndPolicies.workerRoleLabel` | Worker role |
| `rolesAndPolicies.workerPlaceholder` | Select a worker role |
| `rolesAndPolicies.workerHelp` | An IAM role used by the ROSA compute instances. The role is used with the corresponding policy resource to provide the compute instances with the permissions required to manage their components. |
| `rolesAndPolicies.operatorRolesSection` | Operator roles |
| `rolesAndPolicies.oidcLabel` | OIDC config ID |
| `rolesAndPolicies.oidcPlaceholder` | Select an OIDC config ID |
| `rolesAndPolicies.oidcPopoverTitle` | Create a new OIDC config id |
| `rolesAndPolicies.operatorPrefixToggle` | Operator roles prefix |
| `rolesAndPolicies.operatorPrefixLabel` | Operator roles prefix |
| `rolesAndPolicies.operatorPrefixHelpLead` | You can specify a custom prefix for the Operator AWS IAM roles. |
| `rolesAndPolicies.operatorPrefixLearnMoreLink` | Learn more and see examples. |
| `rolesAndPolicies.operatorPrefixHelper` | 32 characters maximum. This is autogenerated by the cluster name, but you can change it. |
| `rolesAndPolicies.operatorRolesCreateLabel` | Create operator roles |
| `rolesAndPolicies.operatorRolesCreateInstructions` | Create operator AWS IAM roles by running the following commands in your CLI. You must complete this step before your cluster can be created. |
| `rolesAndPolicies.operatorRolesCreateCommandAriaLabel` | Copyable ROSA create operator-roles command |
| `rolesAndPolicies.copyHover` | Copy |
| `rolesAndPolicies.copyClicked` | Copied |
| `rolesAndPolicies.rolesAlertTitle` | Some roles are missing |
| `rolesAndPolicies.accountRolesHelp` | Missing account roles |
| `rolesAndPolicies.userRolesHelp` | Missing user role |

### `oidcHint`

OIDC config instructions on the Roles and policies step.

| Key | Default English |
| --- | --- |
| `oidcHint.instructions` | Create a new OIDC config ID by running the following commands in your CLI. Then, refresh the OIDC config ID dropdown and select the new config ID. |

### `rosaLogin`

ROSA CLI login instructions. `product="acm"` uses `rosaLogin.instructionsService`. Other products use `rosaLogin.instructions`.

| Key | Default English |
| --- | --- |
| `rosaLogin.instructions` | Before you can create or link AWS IAM roles, log in to ROSA from your CLI. Run the following command to authenticate with your Red Hat account. |
| `rosaLogin.instructionsService` | Before you can create or link AWS IAM roles, log in to ROSA from your CLI. Run the following command to authenticate with your Red Hat account. Replace the `<CLIENT_ID>` and `<CLIENT_SECRET>` placeholders with your service account credentials. |
| `rosaLogin.copyAriaLabel` | Copyable ROSA login command |

### `networking`

Networking step. CIDR copy stays required when the proxy step is hidden. Only the proxy opt-in keys below can be omitted with that step.

`networking.proxyNextStepInfo` is not read by the current wizard. It is still proxy opt-in copy, so leave it out together with the other proxy keys when that step is hidden.

| Key | Default English | Notes |
| --- | --- | --- |
| `networking.sectionLabel` | Networking | |
| `networking.privacyHelper` | Install your cluster with all public or private API endpoints and application routes. | |
| `networking.clusterPrivacyLabel` | Cluster privacy | |
| `networking.publicLabel` | Public | |
| `networking.publicPopover` | Access Kubernetes API endpoint and application routes from the internet. | |
| `networking.publicSubnetDisabledHelper` | Select a private subnet on the Machine pools step before choosing a public subnet. The selected private subnet will be used for the public API endpoint and application routes. | |
| `networking.publicSubnetLabel` | Public subnet name | |
| `networking.publicSubnetPlaceholder` | Select public subnet name | |
| `networking.privateLabel` | Private | |
| `networking.privatePopover` | Access Kubernetes API endpoint and application routes from direct private connections only. | |
| `networking.advancedToggle` | Advanced networking configuration (optional) | |
| `networking.proxyCheckboxLabel` | Configure a cluster-wide proxy | Omit when cluster-wide proxy is hidden |
| `networking.proxyCheckboxHelp` | Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster on the next step. | Omit when cluster-wide proxy is hidden |
| `networking.proxyNextStepInfo` | You will be able to configure cluster-wide proxy details in the next step | Omit when cluster-wide proxy is hidden. Not read |
| `networking.cidrAlertTitle` | CIDR ranges cannot be changed after you create your cluster | |
| `networking.cidrAlertBody` | Specify non-overlapping CIDR ranges for the machine, service, and pod fields. Enter the network address for each range—the first IP address in the subnet (for example, 10.0.0.0/16, not 10.0.0.1/16). Ensure these ranges do not overlap with each other or with networks already in use in your environment, including your VPC subnets. | |
| `networking.cidrLearnMoreLink` | Learn more about CIDR range definitions | |
| `networking.cidrFieldLearnMoreLink` | Learn more | |
| `networking.useDefaultsLabel` | Use default values | |
| `networking.useDefaultsHelp` | The values are safe defaults. However, you must ensure that the Machine CIDR matches the selected VPC subnets. | |
| `networking.machineCidrLabel` | Machine CIDR | |
| `networking.machineCidrHelpLead` | A block of IP addresses used by the OpenShift Container Platform installation program while installing the cluster. The address block must not overlap with any other network block. | |
| `networking.machineCidrHelp` | Subnet mask must be between /16 and /25 | |
| `networking.serviceCidrLabel` | Service CIDR | |
| `networking.serviceCidrHelpLead` | A block of IP addresses for services. OpenShift SDN allows only one serviceNetwork block. The address block must not overlap with any other network block. | |
| `networking.serviceCidrHelp` | Subnet mask must be at most /24 | |
| `networking.podCidrLabel` | Pod CIDR | |
| `networking.podCidrHelpLead` | A block of IP addresses from which Pod IP addresses are allocated. The OpenShift SDN network plug-in supports multiple cluster networks. The address blocks for multiple cluster networks must not overlap. Select address pools large enough to fit your anticipated workload. | |
| `networking.podCidrHelp` | Subnet mask must allow for at least 32 nodes | |
| `networking.hostPrefixLabel` | Host prefix | |
| `networking.hostPrefixHelpLead` | The subnet prefix length to assign to each individual node. For example, if host prefix is set to /23, then each node is assigned a /23 subnet out of the given CIDR, allowing for 510 (2^(32 - 23) - 2) pod IP addresses. | |
| `networking.hostPrefixHelp` | Must be between /23 and /26 | |

### `machinePools`

Machine pools step. Privacy labels from `networking` are also reused when Review displays cluster privacy.

| Key | Default English |
| --- | --- |
| `machinePools.sectionLabel` | Machine pool |
| `machinePools.intro` | Create a machine pool.  Additional machine pools can be created after cluster creation. |
| `machinePools.vpcLabel` | VPC |
| `machinePools.vpcLabelPrefix` | Select a VPC to install your machine pool into your selected region: |
| `machinePools.vpcPlaceholder` | Select a VPC to install your machine pool into |
| `machinePools.vpcHelpLead` | To create a cluster hosted by Red Hat, you must have a Virtual Private Cloud (VPC) available to create clusters on. |
| `machinePools.vpcLearnMoreLink` | Learn more about VPCs. |
| `machinePools.machinePoolLabel` | Machine pool |
| `machinePools.subnetLabel` | Private subnet name |
| `machinePools.addPoolButton` | Add machine pool |
| `machinePools.subnetPlaceholder` | Select private subnet |
| `machinePools.settingsSectionLabel` | Machine pool settings |
| `machinePools.instanceTypeLabel` | Compute node instance type |
| `machinePools.instanceTypeHelpLead` | Instance types are made from varying combinations of CPU, memory, storage, and networking capacity. Instance type availability depends on regional availability and your AWS account configuration. |
| `machinePools.instanceTypeLearnMore` | Learn more. |
| `machinePools.advancedToggle` | Advanced machine pool configuration (optional) |
| `machinePools.imdsHelpTitle` | Amazon EC2 Instance Metadata Service (IMDS) |
| `machinePools.imdsHelpP1` | Instance metadata is data that is related to an Amazon Elastic Compute Cloud (Amazon EC2) instance that applications can use to configure or manage the running instance. |
| `machinePools.imdsLabel` | Instance Metadata Service |
| `machinePools.imdsBothLabel` | Use both IMDSv1 and IMDSv2 |
| `machinePools.imdsBothDescription` | Allows use of both IMDS versions for backward compatibility |
| `machinePools.imdsV2Label` | Use IMDSv2 only |
| `machinePools.imdsV2Description` | A session-oriented method with enhanced security |
| `machinePools.rootDiskLabel` | Root disk size |
| `machinePools.rootDiskHelp` | Root disks are AWS EBS volumes attached as the primary disk for AWS EC2 instances. The root disk size for this machine pool group of nodes must be between 75GiB and 16384GiB. |
| `machinePools.securityGroupsToggle` | Additional security groups (optional) |

### `autoscaling`

Autoscaling controls on the Machine pools step. `autoscaling.computeCountLabel` and `autoscaling.computeCountHelp` are the fixed node count shown when autoscaling is off. They can be left untranslated when `hiddenFields` includes `FIELD_NAME.NODES_COMPUTE`. The rest of this section is still shown.

| Key | Default English |
| --- | --- |
| `autoscaling.title` | Autoscaling |
| `autoscaling.helperLead` | Autoscaling automatically adds and removes nodes from the machine pool based on resource requirements. |
| `autoscaling.learnMoreAutoscaling` | Learn more about autscaling with ROSA. |
| `autoscaling.enableLabel` | Enable autoscaling |
| `autoscaling.minLabel` | Min compute node count |
| `autoscaling.minHelp` | The number of compute nodes to provision for your initial machine pool. |
| `autoscaling.learnMoreNodeCount` | Learn more about compute node count |
| `autoscaling.maxLabel` | Max compute node count |
| `autoscaling.maxHelp` | The number of compute nodes to provision for your initial machine pool. |
| `autoscaling.computeCountLabel` | Compute node count |
| `autoscaling.computeCountHelp` | The number of compute nodes to provision for your initial machine pool. |

### `securityGroups`

Additional security groups on the Machine pools step.

| Key | Default English |
| --- | --- |
| `securityGroups.emptyTitle` | There are no security groups for this Virtual Private Cloud |
| `securityGroups.emptyBodyPrefix` | To add security groups, go to the |
| `securityGroups.emptyBodySuffix` | of your AWS console. |
| `securityGroups.emptyConsoleLink` | Security groups section |
| `securityGroups.refreshLink` | Refresh Security Groups |
| `securityGroups.noEditTitle` | You cannot add or edit security groups associated with machine pools that were created during cluster creation. |
| `securityGroups.formLabel` | Security groups |
| `securityGroups.selectToggle` | Select security groups |
| `securityGroups.refreshTooltip` | Refetch Security Groups list |
| `securityGroups.readOnlyEmpty` | This machine pool does not have additional security groups. |
| `securityGroups.badgeSrText` | some items |
| `securityGroups.optionsMenuAria` | Options menu |
| `securityGroups.selectAriaLabelledBy` | Select AWS security groups |
| `securityGroups.noEditViewMoreInfo` | View more information |
| `securityGroups.noEditAwsConsoleLink` | AWS security groups console |
| `securityGroups.incompatibleVersion` | To use securityGroups, your cluster must be version 4.14.x or newer. |

### `clusterWideProxy`

Cluster-wide proxy step. Omit this entire section when cluster-wide proxy is hidden.

| Key | Default English |
| --- | --- |
| `clusterWideProxy.sectionLabel` | Cluster-wide proxy |
| `clusterWideProxy.intro` | Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster. |
| `clusterWideProxy.learnMoreLink` | Learn more about configuring a cluster-wide proxy |
| `clusterWideProxy.alertConfigureFields` | Configure at least 1 of the following fields: |
| `clusterWideProxy.httpLabel` | HTTP proxy URL |
| `clusterWideProxy.httpHelp` | Specify a proxy URL to use for HTTP connections outside the cluster. |
| `clusterWideProxy.httpPlaceholder` | Enter the HTTP proxy URL |
| `clusterWideProxy.httpsLabel` | HTTPS proxy URL |
| `clusterWideProxy.httpsHelp` | Specify a proxy URL to use for HTTPS connections outside the cluster. |
| `clusterWideProxy.httpsPlaceholder` | Enter the HTTPS proxy URL |
| `clusterWideProxy.noProxyLabel` | No proxy domains |
| `clusterWideProxy.noProxyHelp` | Preface a domain with . to match subdomains only. For example, .y.com matches x.y.com, but not y.com. Use * to bypass proxy for all destinations. |
| `clusterWideProxy.noProxyPlaceholder` | Enter the no proxy domains |
| `clusterWideProxy.trustBundleLabel` | Additional trust bundle |

### `encryption`

Encryption step under Additional setup. This step cannot be hidden.

`encryption.reviewEtcdEnabledLabel` and `encryption.reviewEtcdDisabledLabel` are the Review values for etcd encryption.

| Key | Default English |
| --- | --- |
| `encryption.sectionLabel` | Advanced encryption |
| `encryption.keysGroupLabel` | Encryption Keys |
| `encryption.keysHelperLead` | You can use your default or a custom AWS KMS key to encrypt the root disks for your OpenShift nodes. |
| `encryption.keysLearnMore` | Learn more |
| `encryption.defaultKms` | Use default AWS KMS key |
| `encryption.customKms` | Use custom AWS KMS key |
| `encryption.keyArnLabel` | Key ARN |
| `encryption.keyArnHelp` | The key ARN is the Amazon Resource Name (ARN) of a CMK. It is a unique, fully qualified identifier for the CMK. A key ARN includes the AWS account, Region, and the key ID. |
| `encryption.etcdTitle` | etcd encryption |
| `encryption.etcdLabel` | Enable additional etcd encryption |
| `encryption.etcdHelperLead` | Optionally, add a unique customer-managed AWS KMS key to encrypt etcd. |
| `encryption.etcdLearnMore` | Learn more |
| `encryption.keysNoteAlert` | Take a note of the keys associated with your cluster. If you delete your keys, the cluster will not be available |
| `encryption.reviewEtcdDisabledLabel` | disabled |
| `encryption.reviewEtcdEnabledLabel` | enabled |

### `clusterUpdates`

Cluster updates step. Omit this entire section when cluster updates is hidden.

Several sentences are split around links. `clusterUpdates.recurringDescriptionAfterZStream` starts with a space because it follows the z-stream link with no extra space inserted by the component. `clusterUpdates.daysOfWeek` feeds the day dropdown and the Review schedule value.

| Key | Default English |
| --- | --- |
| `clusterUpdates.sectionLabel` | Cluster update strategy |
| `clusterUpdates.upgradePolicyLabel` | Cluster update strategy |
| `clusterUpdates.versionIntroPrefix` | The OpenShift version |
| `clusterUpdates.versionIntroSuffix` | that you selected in the |
| `clusterUpdates.detailsStepLink` | Details step |
| `clusterUpdates.midSentence` | will apply to the managed control plane and the machine pools configured in the |
| `clusterUpdates.networkingStepLink` | Networking step. |
| `clusterUpdates.afterCreation` | After cluster creation, you can update the managed control plane and machine pools independently. |
| `clusterUpdates.cveLead` | In the event of |
| `clusterUpdates.criticalConcernsLink` | Critical security concerns |
| `clusterUpdates.cveTail` | (CVEs) that significantly impact the security or stability of the cluster, updates may be automatically scheduled by Red Hat SRE to the latest z-stream version not impacted by the CVE within 2 business days after customer notifications. |
| `clusterUpdates.individualLabel` | Manual updates |
| `clusterUpdates.individualDescriptionLead` | Schedule each update individually. When planning updates, make sure to consider the end of life dates from the |
| `clusterUpdates.lifecycleLink` | lifecycle policy |
| `clusterUpdates.recurringLabel` | Automatic updates |
| `clusterUpdates.recurringDescriptionBeforeZStream` | The cluster control plan will be automatically updated based on your preferred day and start time when new patch updates |
| `clusterUpdates.zStreamLinkText` | z-stream |
| `clusterUpdates.recurringDescriptionAfterZStream` | ` are available. When a new minor version is available, you'll be notified and must manually allow the cluster to update the next minor version. The compute nodes will need to be manually updated.` |
| `clusterUpdates.dayTimeLabel` | Select a day and start time |
| `clusterUpdates.selectDayPlaceholder` | Select day |
| `clusterUpdates.selectTimePlaceholder` | Select time |
| `clusterUpdates.upgradeScheduleLabel` | Scheduled day and start time |
| `clusterUpdates.daysOfWeek` | Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday |

### `review`

Review step chrome (section title, alert, edit actions, show more / show less) is always required. Update-strategy keys are required only when the cluster updates step is shown. The remaining keys are on the type and are not read; Review row labels come from each field's own label key instead.

| Key | Default English | Notes |
| --- | --- | --- |
| `review.sectionLabel` | Review your ROSA cluster | |
| `review.alertTitle` | Double check your settings. | |
| `review.lockedSettings` | Locked settings cannot be changed later. | |
| `review.detailsToggle` | Details | Not read |
| `review.rolesToggle` | Roles and policies | Not read |
| `review.networkingToggle` | Networking and subnets | Not read |
| `review.encryptionToggle` | Encryption (optional) | Not read |
| `review.optionalNetworkingToggle` | Networking (optional) | Not read |
| `review.clusterUpdatesToggle` | Cluster updates (optional) | Not read |
| `review.editStep` | Edit step | |
| `review.editInYaml` | Edit in YAML | |
| `review.clusterName` | Cluster name | Not read |
| `review.openShiftVersion` | OpenShift version | Not read |
| `review.awsInfra` | Associated AWS infrastructure account | Not read |
| `review.awsBilling` | AWS billing account | Not read |
| `review.region` | Region | Not read |
| `review.installerRole` | Installer role | Not read |
| `review.oidcConfigId` | OIDC Config ID | Not read |
| `review.operatorPrefix` | Operator roles prefix | Not read |
| `review.publicSubnet` | Public subnet name | Not read |
| `review.installVpc` | Install to selected VPC | Not read |
| `review.instanceType` | Compute node instance type | Not read |
| `review.computeCount` | Compute node count | Not read |
| `review.machinePoolsHeading` | Machine pools | Not read |
| `review.additionalEtcd` | Additional etcd encryption | Not read |
| `review.encryptionKeys` | Encryption keys | Not read |
| `review.machineCidr` | Machine CIDR | Not read |
| `review.serviceCidr` | Service CIDR | Not read |
| `review.podCidr` | Pod CIDR | Not read |
| `review.hostPrefix` | Host prefix | Not read |
| `review.updateStrategy` | Cluster update strategy | Omit when cluster updates is hidden |
| `review.strategyIndividual` | Manual updates | Omit when cluster updates is hidden |
| `review.strategyAutomatic` | Automatic updates | Omit when cluster updates is hidden |
| `review.autoscalingMinPrefix` | Min: | Not read |
| `review.autoscalingMaxPrefix` | Max: | Not read |
| `review.showMore` | Show more | |
| `review.showLess` | Show less | |

### `common`

Shared API error alerts on selects that load accounts, regions, versions, roles, and similar lists.

| Key | Default English |
| --- | --- |
| `common.errorValidatingPrefix` | Error validating |
| `common.errorLoadingPrefix` | Error loading |
| `common.listSuffix` | list |
| `common.errorDetails` | Error details |
| `common.showErrorDetails` | Show error details |
| `common.retry` | Retry |

## Validator strings (`RosaHcpWizardValidatorStrings`)

Pass these under `strings.validators`. `{name}` in a default shows a parameter the wizard substitutes. Keep the function signature when you replace a function.

### `validators.commonRequired`

Required on every wizard, including when cluster updates is hidden.

| Key | Default English |
| --- | --- |
| `validators.commonRequired` | This field is required |

### `validators.clusterName`

Details step, cluster name.

| Key | Default English |
| --- | --- |
| `validators.clusterName.maxLength` | This value can contain at most 54 characters |
| `validators.clusterName.invalidChars` | This value can only contain lowercase alphanumeric characters or '-' or '.' |
| `validators.clusterName.mustStartAlphanumeric` | This value must start with an alphanumeric character |
| `validators.clusterName.mustNotStartNumber` | This value must not start with a number |
| `validators.clusterName.mustEndAlphanumeric` | This value must end with an alphanumeric character |

### `validators.operatorRolesPrefix`

Roles and policies step, custom operator roles prefix.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.operatorRolesPrefix.fieldLabel` | `string` | Custom operator roles prefix |
| `validators.operatorRolesPrefix.invalidFormat` | `(label: string, value: string) => string` | `{label} '{value}' isn't valid, must consist of lower-case alphanumeric characters or '-', start with an alphabetic character, and end with an alphanumeric character. For example, 'my-name', or 'abc-123'.` |
| `validators.operatorRolesPrefix.tooLong` | `(label: string, max: number) => string` | `{label} may not exceed {max} characters.` |

### `validators.kmsKeyArn`

Encryption step, custom KMS key ARN.

| Key | Default English |
| --- | --- |
| `validators.kmsKeyArn.required` | Field is required. |
| `validators.kmsKeyArn.noWhitespace` | Value must not contain whitespaces. |
| `validators.kmsKeyArn.invalidArn` | Key provided is not a valid ARN. It should be in the format "arn:aws:kms:<region>:<accountid>:key/<keyid>". |
| `validators.kmsKeyArn.wrongRegion` | Your KMS key must contain your selected region. |

### `validators.securityGroups`

Machine pools step, additional security groups. This is separate from the `securityGroups` UI section.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.securityGroups.maxExceeded` | `(max: number) => string` | A maximum of {max} security groups can be selected. |

### `validators.noProxyDomains`

Cluster-wide proxy step. Omit this entire section when cluster-wide proxy is hidden.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.noProxyDomains.invalidDomains` | `(domains: string, plural: boolean) => string` | The domain(s) '{domains}' isn't/aren't valid, must contain at least two valid lower-case DNS labels separated by dots, for example 'domain.com' or 'sub.domain.com'. `domains` is the invalid list. `plural` is true when that list has more than one domain. |

### `validators.url`

Cluster-wide proxy step, HTTP and HTTPS proxy URLs. Omit this entire section when cluster-wide proxy is hidden.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.url.invalid` | `string` | Invalid URL |
| `validators.url.schemePrefix` | `(protocolList: string) => string` | The URL should include the scheme prefix ({protocolList}) |

### `validators.ca`

Cluster-wide proxy step, additional trust bundle. Omit this entire section when cluster-wide proxy is hidden.

| Key | Default English |
| --- | --- |
| `validators.ca.fileTooLarge` | File must be no larger than 4 MB |
| `validators.ca.invalidPem` | Must be a PEM encoded X.509 file (.pem, .crt, .ca, .cert) and no larger than 4 MB |

### `validators.rootDisk`

Machine pools step, root disk size.

| Key | Default English |
| --- | --- |
| `validators.rootDisk.notInteger` | Root disk size must be an integer. |
| `validators.rootDisk.tooSmall` | Root disk size must be at least 75 GiB. |
| `validators.rootDisk.tooLargeOldOpenshift` | Root disk size must not exceed 1024 GiB |
| `validators.rootDisk.tooLargeNewOpenshift` | Root disk size must not exceed 16384 GiB. |

### `validators.replicas`

Machine pools step, compute node count and autoscaling min/max.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.replicas.notInteger` | `string` | Input must be an integer. |
| `validators.replicas.notPositive` | `string` | Input must be a positive number. |
| `validators.replicas.maxNodes` | `(max: number) => string` | Input cannot be more than {max}. |
| `validators.replicas.minGreaterThanMax` | `string` | Min nodes cannot be greater than max nodes. |
| `validators.replicas.maxLessThanMin` | `string` | Max nodes must be greater than or equal to min nodes. |
| `validators.replicas.computeMinTwo` | `string` | Input cannot be less than 2 nodes. |

### `validators.proxyConfigureAtLeastOne`

Omit when cluster-wide proxy is hidden. Not read by the current wizard. The step uses `clusterWideProxy.alertConfigureFields` for the same instruction.

| Key | Default English |
| --- | --- |
| `validators.proxyConfigureAtLeastOne` | Configure at least one of the cluster-wide proxy fields. |

### `validators.cidr`

Networking step, CIDR notation.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.cidr.invalidNotation` | `(value: string) => string` | IP address range '{value}' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'. |

### `validators.validateRange`

Networking step, subnet address versus mask.

| Key | Default English |
| --- | --- |
| `validators.validateRange.notSubnetAddress` | This is not a subnet address. The subnet prefix is inconsistent with the subnet mask. |

### `validators.awsMachineCidr`

Networking step, machine CIDR prefix bounds.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.awsMachineCidr.maskTooLarge` | `(minMask: number) => string` | The subnet mask can't be larger than '/{minMask}'. |
| `validators.awsMachineCidr.maskTooSmallMultiAz` | `(maxMask: number) => string` | The subnet mask can't be smaller than '/{maxMask}'. |
| `validators.awsMachineCidr.maskTooSmallSingleAz` | `(maxMask: number) => string` | The subnet mask can't be smaller than '/{maxMask}'. |

### `validators.serviceCidr`

Networking step, service CIDR. `validators.serviceCidr.subnetMaskBetween` is not read. `validators.serviceCidr.subnetMaskBetweenOneAnd` is the message the wizard uses for that case. Keep the section; the other keys are shown.

| Key | Signature | Default English | Notes |
| --- | --- | --- | --- |
| `validators.serviceCidr.maskTooSmall` | `(maxMask: number, maxServices: number) => string` | The subnet mask can't be smaller than '/{maxMask}', which provides up to {maxServices} services. | |
| `validators.serviceCidr.subnetMaskBetween` | `(min: number, max: number) => string` | Subnet mask must be between /{min} and /{max}. | Not read |
| `validators.serviceCidr.subnetMaskBetweenOneAnd` | `(max: number) => string` | Subnet mask must be between /1 and /{max}. | |

### `validators.podCidr`

Networking step, pod CIDR.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.podCidr.maskTooSmall` | `(maxMask: number) => string` | The subnet mask can't be smaller than /{maxMask}. |
| `validators.podCidr.notEnoughNodes` | `(prefixLength: number) => string` | The subnet mask of /{prefixLength} does not allow for enough nodes. Try changing the host prefix or the pod subnet range. |

### `validators.subnetCidrs`

Networking step, machine / service / pod CIDRs compared with the selected VPC subnets.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.subnetCidrs.machineDoesNotIncludeStartIp` | `(startIp: string, subnetName: string) => string` | The Machine CIDR does not include the starting IP ({startIp}) of {subnetName} |
| `validators.subnetCidrs.serviceOverlaps` | `(subnetName: string, cidrBlock: string) => string` | The Service CIDR overlaps with {subnetName} CIDR '{cidrBlock}' |
| `validators.subnetCidrs.serviceIncludesStartIp` | `(startIp: string, subnetName: string) => string` | The Service CIDR includes the starting IP ({startIp}) of {subnetName} |
| `validators.subnetCidrs.podOverlaps` | `(subnetName: string, cidrBlock: string) => string` | The Pod CIDR overlaps with {subnetName} CIDR '{cidrBlock}' |
| `validators.subnetCidrs.podIncludesStartIp` | `(startIp: string, subnetName: string) => string` | The Pod CIDR includes the starting IP ({startIp}) of {subnetName} |

### `validators.disjointSubnets`

Networking step, non-overlapping machine, service, and pod ranges. `overlap` receives the other field labels as a comma-separated list. `plural` is true when that list has more than one label.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.disjointSubnets.fieldLabelMachine` | `string` | Machine CIDR |
| `validators.disjointSubnets.fieldLabelService` | `string` | Service CIDR |
| `validators.disjointSubnets.fieldLabelPod` | `string` | Pod CIDR |
| `validators.disjointSubnets.overlap` | `(otherFieldLabelsCsv: string, plural: boolean) => string` | This subnet overlaps with the subnet(s) in the {otherFieldLabelsCsv} field(s). |

### `validators.hostPrefix`

Networking step, host prefix.

| Key | Signature | Default English |
| --- | --- | --- |
| `validators.hostPrefix.invalidMaskFormat` | `(value: string) => string` | The value '{value}' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'. |
| `validators.hostPrefix.maskTooLarge` | `(maxPrefix: number, maxPodIPs: number) => string` | The subnet mask can't be larger than '/{maxPrefix}', which provides up to {maxPodIPs} Pod IP addresses. |
| `validators.hostPrefix.maskTooSmall` | `(minPrefix: number, maxPodIPs: number) => string` | The subnet mask can't be smaller than '/{minPrefix}', which provides up to {maxPodIPs} Pod IP addresses. |
