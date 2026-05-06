/**
 * Default English strings for RosaHcpWizard (UI copy + validation messages).
 *
 * **Library usage:** `RosaHcpWizard` merges these with any `strings` prop you pass; you do not need
 * to import this file unless you want the full default object.
 *
 * **App localization workflow:**
 * 1. Copy this file into your app (e.g. `myRosaHcpWizardStrings.en.ts`).
 * 2. Replace string values with translations; keep the same keys and structure.
 * 3. For validator entries that are functions (`invalidFormat`, `maxExceeded`, etc.), keep the
 *    same signatures so validation still interpolates values correctly.
 * 4. Pass your object (or `mergeRosaHcpWizardStrings(yourPartial)` from `rosaHcpWizardStrings`) into
 *    `<RosaHCPWizard strings={...} />` or spread partial overrides only.
 *
 * Types: import type { RosaHcpWizardStrings, RosaHcpWizardValidatorStrings } from './rosaHcpWizardStrings.types'
 * (or from the package barrel that re-exports them).
 */

import type {
  RosaHcpWizardStrings,
  RosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings.types';

const defaultOperatorPrefixInvalid = (label: string, value: string) =>
  `${label} '${value}' isn't valid, must consist of lower-case alphanumeric characters or '-', start with an alphabetic character, and end with an alphanumeric character. For example, 'my-name', or 'abc-123'.`;

const defaultOperatorPrefixTooLong = (label: string, max: number) =>
  `${label} may not exceed ${max} characters.`;

const defaultNoProxyInvalid = (domains: string, plural: boolean) =>
  `The domain${plural ? 's' : ''} '${domains}' ${plural ? "aren't" : "isn't"} valid, 
      must contain at least two valid lower-case DNS labels separated by dots, for example 'domain.com' or 'sub.domain.com'.`;

/** Full default UI strings (English). */
export const defaultRosaHcpWizardStrings: RosaHcpWizardStrings = {
  wizard: {
    stepLabels: {
      basicSetup: 'Basic setup',
      details: 'Details',
      rolesAndPolicies: 'Roles and policies',
      machinePools: 'Machine pools',
      networking: 'Networking',
      clusterWideProxy: 'Cluster-wide proxy',
      additionalSetup: 'Additional setup',
      encryptionOptional: 'Encryption (optional)',
      clusterUpdatesOptional: 'Cluster updates (optional)',
      yamlEditor: 'YAML Editor',
      review: 'Review',
    },
  },
  submitError: {
    title: 'Error creating cluster',
    backToReviewStep: 'Back to review step',
    exitWizard: 'Exit wizard',
  },
  yamlEditor: {
    title: 'YAML Configuration',
    description: 'Review and edit the YAML configuration.',
    parseErrorTitle: 'YAML Parse Error',
    convertError: 'Error converting form data to YAML',
    invalidYaml: 'Invalid YAML syntax',
  },
  associateAwsDrawer: {
    panelTitle: 'How to associate a new AWS account',
    introSts:
      'ROSA cluster deployments use the AWS Security Token Service for added security. Run the following required steps from a CLI authenticated with both AWS and ROSA.',
    cliVersion: 'You must use ROSA CLI version 1.2.31 or above.',
    step1Title: 'Step 1: OCM role',
    step2Title: 'Step 2: User role',
    step3Title: 'Step 3: Account roles',
    closingPrompt:
      "After you've completed all the steps, close this guide and choose your account.",
    closeButton: 'Close',
    createOCMRoleAriaLabel: 'Copyable ROSA create ocm-role',
    createOCMRoleAdminAriaLabel: 'Copyable ROSA create ocm-role --admin',
    linkOCMRoleAriaLabel: 'Copyable rosa link ocm-role <arn> command',
  },
  ocmRole: {
    checkLinkedTitle: 'First, check if a role exists and is linked with:',
    existingLinkedInfo:
      "If there is an existing role and it's already linked to your Red Hat account, you can continue to step 2.",
    unlinkedTitle: "Next, is there an existing role that isn't linked?",
    tabCreateNew: 'No, create new role',
    tabLinkExisting: 'Yes, link existing role',
    basicOcmRoleLabel: 'Basic OCM role',
    orDivider: 'OR',
    adminOcmRoleLabel: 'Admin OCM role',
    helpDecideTitle: 'Help me decide',
    helpBasicBody:
      'The basic role enables OpenShift Cluster Manager to detect the AWS IAM roles and policies required by ROSA.',
    helpAdminBody:
      'The admin role also enables the detection of the roles and policies. In addition, the admin role enables automatic deployment of the cluster-specific Operator roles and OpenID Connect (OIDC) provider by using OpenShift Cluster Manager.',
    linkExistingLead: ' If a role exists but is not linked, link it with:',
    orgAdminInfo:
      'You must have organization administrator privileges in your Red Hat account to run this command. After you link the OCM role with your Red Hat organization, it is visible for all users in the organization.',
  },
  userRole: {
    checkLinkedTitle: 'First, check if a role exists and is linked with:',
    existingLinkedInfo:
      "If there is an existing role and it's already linked to your Red Hat account, you can continue to step 3",
    unlinkedTitle: "Next, is there an existing role that isn't linked?",
    whyLinkTitle: 'Why do I need to link my account?',
    whyLinkBodyPrefix:
      'The link creates a trust policy between the role and the link cluster installer.',
    reviewPermissionsLink: 'Review the AWS policy permissions for the basic and admin OCM roles.',
    tabCreateNew: 'No, create new role',
    tabLinkExisting: 'Yes, link existing role',
    userRoleLabel: 'User role ',
    userRolePopover:
      'The user role is necessary to validate that your Red Hat user account has permissions to install a cluster in the AWS account.',
    copyAriaListUserRole: 'Copyable ROSA rosa list user-role command',
    copyAriaLinkUserRole: 'Copyable ROSA link user-role --arn',
  },
  accountRoles: {
    intro:
      "To create the necessary account-wide roles and policies quickly, use the default auto method that's provided by the ROSA CLI.",
    copyAriaAccountRoles: 'Copyable ROSA rosa create account-roles --hosted-cp --mode auto command',
    manualInstructionsLead:
      'If you would prefer to manually create the required roles and policies within your AWS account, then follow',
    manualInstructionsLink: 'these instructions',
  },
  details: {
    sectionLabel: 'Details',
    clusterNameLabel: 'Cluster name',
    clusterNamePlaceholder: 'Enter the cluster name',
    clusterNameHelp:
      'This will be how we refer to your cluster in the OpenShift cluster list and will form part of the cluster console subdomain.',
    openShiftVersionLabel: 'OpenShift version',
    openShiftVersionPlaceholder: 'Select an OpenShift version',
    openShiftVersionOptionDisabledDescription:
      'Your current account roles do not support the version of OpenShift.',
    openShiftVersionGroups: {
      latestRelease: 'Latest release',
      defaultRelease: 'Default release',
      defaultRecommended: 'Default (Recommended)',
      previousReleases: 'Previous releases',
      releases: 'Releases',
    },
    awsInfraLabel: 'Associated AWS infrastructure account',
    awsInfraPlaceholder: 'Select an AWS infrastructure account',
    awsInfraHelp:
      "Your cluster's cloud resources will be created in the associated AWS infrastructure account. To continue, you must associate at least 1 account.",
    associateNewAccount: 'Associate a new AWS account',
    billingLabel: 'Associated AWS billing account',
    billingPlaceholder: 'Select an AWS billing account',
    billingHelp:
      'The AWS billing account is often the same as your Associated AWS infrastructure account, but does not have to be.',
    connectBillingLink: 'Connect ROSA to a new AWS billing account',
    regionLabel: 'Region',
    regionPlaceholder: 'Select a region',
    regionHelp:
      'The AWS Region where your compute nodes and control plane will be located. (should be link: Learn more about AWS Regions.)',
  },
  rolesAndPolicies: {
    accountRolesSection: 'Account roles',
    installerRoleLabel: 'Installer role',
    installerPlaceholder: 'Select an Installer role',
    installerRoleOptionDisabledDescription:
      'This account role does not support the selected OpenShift version.',
    installerHelpLead: 'An AWS IAM role used by the ROSA installer',
    installerLearnMoreLink: 'Learn more about roles.',
    arnsToggle: 'Amazon Resource Names (ARNs)',
    supportRoleLabel: 'Support role',
    supportPlaceholder: 'Select a support role',
    supportHelp:
      'An IAM role used by the Red Hat Site Reliability Engineering (SRE) support team. The role is used with the corresponding policy resource to provide the Red Hat SRE support team with the permissions required to support ROSA clusters.',
    workerRoleLabel: 'Worker role',
    workerPlaceholder: 'Select a worker role',
    workerHelp:
      'An IAM role used by the ROSA compute instances. The role is used with the corresponding policy resource to provide the compute instances with the permissions required to manage their components.',
    operatorRolesSection: 'Operator roles',
    oidcLabel: 'OIDC config ID',
    oidcPlaceholder: 'Select an OIDC config ID',
    oidcHelp: 'The OIDC configuration ID created by running the command: rosa create oidc-config',
    oidcPopoverTitle: 'Create a new OIDC config id',
    operatorPrefixToggle: 'Operator role prefix',
    operatorPrefixLabel: 'Operator roles prefix',
    operatorPrefixHelpLead: 'You can specify a custom prefix for the Operator AWS IAM roles.',
    operatorPrefixLearnMoreLink: 'Learn more and see examples.',
    operatorPrefixHelper:
      '32 characters maximum. This is autogenerated by the cluster name, but you can cahnge it.',
    clipboardCopyAria: 'Copy read-only example',
    copyHover: 'Copy',
    copyClicked: 'Copied',
  },
  oidcHint: {
    instructions:
      'Create a new OIDC config ID by running the following commands in your CLI. Then, refresh and select the new config ID from the dropdown.',
  },
  networking: {
    sectionLabel: 'Networking',
    privacyHelper:
      'Install your cluster with all public or private API endpoints and application routes.',
    publicLabel: 'Public',
    publicPopover: 'Access Kubernetes API endpoint and application routes from the internet.',
    publicSubnetLabel: 'Public subnet name',
    publicSubnetPlaceholder: 'Select public subnet name',
    privateLabel: 'Private',
    privatePopover:
      'Access Kubernetes API endpoint and application routes from direct private connections only.',
    advancedToggle: 'Advanced networking configuration (optional)',
    proxyCheckboxLabel: 'Configure a cluster-wide proxy',
    proxyCheckboxHelp:
      'Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster.',
    proxyNextStepInfo: 'You will be able to configure cluster-wide proxy details in the next step',
    cidrAlertTitle: 'CIDR ranges cannot be changed after you create your cluster',
    cidrAlertBody:
      "Specify non-overlapping ranges for machine, service, and pod ranges. Make sure that your internal organization's networking ranges do not overlap with ours, which are Kubernetes. Each range should correspond to the first IP address in their subnet.",
    cidrLearnMoreLink: 'Learn more about configuring network settings',
    useDefaultsLabel: 'Use default values',
    useDefaultsHelp:
      'The values are safe defaults. However, you must ensure that the Machine CIDR matches the selected VPC subnets.',
    machineCidrLabel: 'Machine CIDR',
    machineCidrHelp: 'Subnet mask must be between /16 and /25',
    serviceCidrLabel: 'Service CIDR',
    serviceCidrHelp: 'Subnet mask must be at most /24',
    podCidrLabel: 'Pod CIDR',
    podCidrHelp: 'Subnet mask must allow for at least 32 nodes',
    hostPrefixLabel: 'Host prefix',
    hostPrefixHelp: 'Must be between /23 and /26',
  },
  machinePools: {
    sectionLabel: 'Machine pools',
    intro:
      'Create machine pools and specify the private subnet for each machine pool. To allow high availability for your workloads, add machine pools on different availablity zones.',
    vpcLabel: 'VPC',
    vpcLabelPrefix: 'Select a VPC to install your machine pools into your selected regions:',
    vpcPlaceholder: 'Select a VPC to install your machine pools into',
    vpcHelpLead:
      'To create a cluster hosted by Red Hat, you must have a Virtual Private Cloud (VPC) available to create clusters on.',
    vpcLearnMoreLink: 'Learn more about VPCs.',
    machinePoolLabel: 'Machine pool',
    subnetLabel: 'Private subnet name',
    addPoolButton: 'Add machine pool',
    subnetPlaceholder: 'Select private subnet',
    settingsSectionLabel: 'Machine pools settings',
    settingsIntro:
      'The following settings apply to all machine pools created during cluster install. Additional machine pools can be created after cluster creation.',
    instanceTypeLabel: 'Compute node instance type',
    instanceTypeHelpLead:
      'Instance types are made from varying combinations of CPU, memory, storage, and networking capacity. Instance type availability depends on regional availability and your AWS account configuration.',
    instanceTypeLearnMore: 'Learn more.',
    advancedToggle: 'Advanced machine pool configuration (optional)',
    imdsHelpTitle: 'Amazon EC2 Instance Metadata Service (IMDS)',
    imdsHelpP1:
      'Instance metadata is data that is related to an Amazon Elastic Compute Cloud (Amazon EC2) instance that applications can use to configure or manage the running instance.',
    imdsLabel: 'Instance Metadata Service',
    imdsBothLabel: 'Use both IMDSv1 and IMDSv2',
    imdsBothDescription: 'Allows use of both IMDS versions for backward compatibility',
    imdsV2Label: 'Use IMDSv2 only',
    imdsV2Description: 'A session-oriented method with enhanced security',
    rootDiskLabel: 'Root disk size',
    rootDiskHelp:
      'Root disks are AWS EBS volumes attached as the primary disk for AWS EC2 instances. The root disk size for this machine pool group of nodes must be between 75GiB and 16384GiB.',
    securityGroupsToggle: 'Additional security groups (optional)',
  },
  autoscaling: {
    title: 'Autoscaling',
    helperLead:
      'Autoscaling automatically adds and removes nodes from the machine pool based on resource requirements.',
    learnMoreAutoscaling: 'Learn more about autscaling with ROSA.',
    enableLabel: 'Enable autoscaling',
    minLabel: 'Min compute node count',
    minHelp: 'The number of compute nodes to provision for your initial machine pool.',
    learnMoreNodeCount: 'Learn more about compute node count',
    maxLabel: 'Max compute node count',
    maxHelp: 'The number of compute nodes to provision for your initial machine pool.',
    computeCountLabel: 'Compute node count',
    computeCountHelp: 'The number of compute nodes to provision for your initial machine pool.',
  },
  securityGroups: {
    emptyTitle: 'There are no security groups for this Virtual Private Cloud',
    emptyBodyPrefix: 'To add security groups, go to the',
    emptyBodySuffix: 'of your AWS console.',
    emptyConsoleLink: 'Security groups section',
    refreshLink: 'Refresh Security Groups',
    noEditTitle:
      'You cannot add or edit security groups associated with machine pools that were created during cluster creation.',
    formLabel: 'Security groups',
    selectToggle: 'Select security groups',
    refreshTooltip: 'Refetch Security Groups list',
    readOnlyEmpty: 'This machine pool does not have additional security groups.',
    badgeSrText: 'some items',
    optionsMenuAria: 'Options menu',
    selectAriaLabelledBy: 'Select AWS security groups',
    noEditViewMoreInfo: 'View more information',
    noEditAwsConsoleLink: 'AWS security groups console',
    incompatibleVersion: 'To use securityGroups, your cluster must be version 4.14.x or newer.',
  },
  clusterWideProxy: {
    sectionLabel: 'Cluster-wide proxy',
    intro: 'Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster.',
    learnMoreLink: 'Learn more about configuring a cluster-wide proxy',
    alertConfigureFields: 'Configure at least 1 of the following fields:',
    httpLabel: 'HTTP proxy URL',
    httpHelp: 'Specify a proxy URL to use for HTTP connections outside the cluster.',
    httpsLabel: 'HTTPS proxy URL',
    httpsHelp: 'Specify a proxy URL to use for HTTPS connections outside the cluster.',
    noProxyLabel: 'No Proxy domains',
    noProxyHelp:
      'Preface a domain with . to match subdomains only. For example, .y.com matches x.y.com, but not y.com. Use * to bypass proxy for all destinations.',
    trustBundleLabel: 'Additional trust bundle',
  },
  encryption: {
    sectionLabel: 'Advanced encryption',
    keysGroupLabel: 'Encryption Keys',
    keysHelperLead:
      'You can use your default or a custom AWS KMS key to encrypt the root disks for your OpenShift nodes.',
    keysLearnMore: 'Learn more',
    defaultKms: 'Use default AWS KMS key',
    customKms: 'Use custom AWS KMS key',
    keyArnLabel: 'Key ARN',
    keyArnHelp:
      'The key ARN is the Amazon Resource Name (ARN) of a CMK. It is a unique, fully qualified identifier for the CMK. A key ARN includes the AWS account, Region, and the key ID.',
    etcdTitle: 'etcd encryption',
    etcdLabel: 'Enable additional etcd encryption',
    etcdHelperLead: 'Optionally, add a unique customer-managed AWS KMS key to encrypt etcd.',
    etcdLearnMore: 'Learn more',
    keysNoteAlert:
      'Take a note of the keys associated with your cluster. If you delete your keys, the cluster will not be available',
  },
  clusterUpdates: {
    sectionLabel: 'Cluster update strategy',
    versionIntroPrefix: 'The OpenShift version',
    versionIntroSuffix: 'that you selected in the',
    detailsStepLink: 'Details step',
    midSentence: 'will apply to the managed control plane and the machine pools configured in the',
    networkingStepLink: 'Networking and subnets step.',
    afterCreation:
      'After cluster creation, you can update the managed control plane and machine pools independently.',
    cveLead: 'In the event of',
    criticalConcernsLink: 'Critical security concerns',
    cveTail:
      '(CVEs) that significantly impact the security or stability of the cluster, updates may be automatically scheduled by Red Hat SRE to the latest z-stream version not impacted by the CVE within 2 business days after customer notifications.',
    individualLabel: 'Individual updates',
    individualDescriptionLead:
      'Schedule each update individually. When planning updates, make sure to consider the end of life dates from the',
    lifecycleLink: 'lifecycle policy',
    recurringLabel: 'Recurring updates',
    recurringDescriptionBeforeZStream:
      'The cluster control plan will be automatically updated based on your preferred day and start time when new patch updates ',
    zStreamLinkText: 'z-stream',
    recurringDescriptionAfterZStream:
      " are available. When a new minor version is available, you'll be notified and must manually allow the cluster to update the next minor version. The compute nodes will need to be manually updated.",
    dayTimeLabel: 'Select a day and start time',
    selectDayPlaceholder: 'Select day',
    daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  review: {
    sectionLabel: 'Review your ROSA cluster',
    alertTitle: 'Double check your settings. Locked settings can not be changed later.',
    detailsToggle: 'Details',
    rolesToggle: 'Roles and policies',
    networkingToggle: 'Networking and subnets',
    encryptionToggle: 'Encryption (optional)',
    optionalNetworkingToggle: 'Networking (optional)',
    clusterUpdatesToggle: 'Cluster updates (optional)',
    editStep: 'Edit Step',
    clusterName: 'Cluster name',
    openShiftVersion: 'OpenShift version',
    awsInfra: 'Associated AWS infrastructure account',
    awsBilling: 'AWS billing account',
    region: 'Region',
    installerRole: 'Installer role',
    oidcConfigId: 'OIDC Config ID',
    operatorPrefix: 'Operator roles prefix',
    publicSubnet: 'Public subnet name',
    installVpc: 'Install to selected VPC',
    instanceType: 'Compute node instance type',
    computeCount: 'Compute node count',
    machinePoolsHeading: 'Machine pools',
    additionalEtcd: 'Additional etcd encryption',
    encryptionKeys: 'Encryption keys',
    machineCidr: 'Machine CIDR',
    serviceCidr: 'Service CIDR',
    podCidr: 'Pod CIDR',
    hostPrefix: 'Host prefix',
    updateStrategy: 'Cluster update strategy',
    strategyIndividual: 'Individual updates',
    strategyAutomatic: 'Automatic updates',
    autoscalingMinPrefix: 'Min:',
    autoscalingMaxPrefix: 'Max:',
  },
  common: {
    errorValidatingPrefix: 'Error validating',
    errorLoadingPrefix: 'Error loading',
    listSuffix: 'list',
    errorDetails: 'Error details',
    showErrorDetails: 'Show error details',
    retry: 'Retry',
  },
};

/** Default validation messages (English). Keep function signatures when translating. */
export const defaultRosaHcpWizardValidatorStrings: RosaHcpWizardValidatorStrings = {
  clusterName: {
    maxLength: 'This value can contain at most 54 characters',
    invalidChars: "This value can only contain lowercase alphanumeric characters or '-' or '.'",
    mustStartAlphanumeric: 'This value must start with an alphanumeric character',
    mustNotStartNumber: 'This value must not start with a number',
    mustEndAlphanumeric: 'This value must end with an alphanumeric character',
  },
  operatorRolesPrefix: {
    fieldLabel: 'Custom operator roles prefix',
    invalidFormat: defaultOperatorPrefixInvalid,
    tooLong: defaultOperatorPrefixTooLong,
  },
  kmsKeyArn: {
    required: 'Field is required.',
    noWhitespace: 'Value must not contain whitespaces.',
    invalidArn:
      'Key provided is not a valid ARN. It should be in the format "arn:aws:kms:<region>:<accountid>:key/<keyid>".',
    wrongRegion: 'Your KMS key must contain your selected region.',
  },
  securityGroups: {
    maxExceeded: (max: number) => `A maximum of ${max} security groups can be selected.`,
  },
  noProxyDomains: {
    invalidDomains: defaultNoProxyInvalid,
  },
  url: {
    invalid: 'Invalid URL',
    schemePrefix: (protocolList: string) =>
      `The URL should include the scheme prefix (${protocolList})`,
  },
  ca: {
    fileTooLarge: 'File must be no larger than 4 MB',
    invalidPem: 'Must be a PEM encoded X.509 file (.pem, .crt, .ca, .cert) and no larger than 4 MB',
  },
  rootDisk: {
    notInteger: 'Root disk size must be an integer.',
    tooSmall: 'Root disk size must be at least 75 GiB.',
    tooLargeOldOpenshift: 'Root disk size must not exceed 1024 GiB',
    tooLargeNewOpenshift: 'Root disk size must not exceed 16384 GiB.',
  },
  replicas: {
    notInteger: 'Input must be an integer.',
    notPositive: 'Input must be a positive number.',
    maxNodes: (max: number) => `Input cannot be more than ${max}.`,
    minGreaterThanMax: 'Min nodes cannot be greater than max nodes.',
    maxLessThanMin: 'Max nodes must be greater than or equal to min nodes.',
    computeMinTwo: 'Input cannot be less than 2 nodes.',
  },
  proxyConfigureAtLeastOne: 'Configure at least one of the cluster-wide proxy fields.',
  cidr: {
    invalidNotation: (value: string) =>
      `IP address range '${value}' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'.`,
  },
  validateRange: {
    notSubnetAddress:
      'This is not a subnet address. The subnet prefix is inconsistent with the subnet mask.',
  },
  awsMachineCidr: {
    maskTooLarge: (minMask: number) => `The subnet mask can't be larger than '/${minMask}'.`,
    maskTooSmallMultiAz: (maxMask: number) =>
      `The subnet mask can't be smaller than '/${maxMask}'.`,
    maskTooSmallSingleAz: (maxMask: number) =>
      `The subnet mask can't be smaller than '/${maxMask}'.`,
  },
  serviceCidr: {
    maskTooSmall: (maxMask: number, maxServices: number) =>
      `The subnet mask can't be smaller than '/${maxMask}', which provides up to ${maxServices} services.`,
    subnetMaskBetween: (min: number, max: number) =>
      `Subnet mask must be between /${min} and /${max}.`,
    subnetMaskBetweenOneAnd: (max: number) => `Subnet mask must be between /1 and /${max}.`,
  },
  podCidr: {
    maskTooSmall: (maxMask: number) => `The subnet mask can't be smaller than /${maxMask}.`,
    notEnoughNodes: (prefixLength: number) =>
      `The subnet mask of /${prefixLength} does not allow for enough nodes. Try changing the host prefix or the pod subnet range.`,
  },
  subnetCidrs: {
    machineDoesNotIncludeStartIp: (startIp: string, subnetName: string) =>
      `The Machine CIDR does not include the starting IP (${startIp}) of ${subnetName}`,
    serviceOverlaps: (subnetName: string, cidrBlock: string) =>
      `The Service CIDR overlaps with ${subnetName} CIDR '${cidrBlock}'`,
    serviceIncludesStartIp: (startIp: string, subnetName: string) =>
      `The Service CIDR includes the starting IP (${startIp}) of ${subnetName}`,
    podOverlaps: (subnetName: string, cidrBlock: string) =>
      `The Pod CIDR overlaps with ${subnetName} CIDR '${cidrBlock}'`,
    podIncludesStartIp: (startIp: string, subnetName: string) =>
      `The Pod CIDR includes the starting IP (${startIp}) of ${subnetName}`,
  },
  disjointSubnets: {
    fieldLabelMachine: 'Machine CIDR',
    fieldLabelService: 'Service CIDR',
    fieldLabelPod: 'Pod CIDR',
    overlap: (otherFieldLabelsCsv: string, plural: boolean) =>
      `This subnet overlaps with the subnet${plural ? 's' : ''} in the ${otherFieldLabelsCsv} field${
        plural ? 's' : ''
      }.`,
  },
  hostPrefix: {
    invalidMaskFormat: (value: string) =>
      `The value '${value}' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'.`,
    maskTooLarge: (maxPrefix: number, maxPodIPs: number) =>
      `The subnet mask can't be larger than '/${maxPrefix}', which provides up to ${maxPodIPs} Pod IP addresses.`,
    maskTooSmall: (minPrefix: number, maxPodIPs: number) =>
      `The subnet mask can't be smaller than '/${minPrefix}', which provides up to ${maxPodIPs} Pod IP addresses.`,
  },
};
