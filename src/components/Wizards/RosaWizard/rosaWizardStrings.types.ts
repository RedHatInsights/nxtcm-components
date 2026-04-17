/**
 * Type definitions for RosaWizard UI copy and validation messages.
 * Default English values live in {@link ./rosaWizardStrings.defaults}.
 */

/** Recursive partial for nested string bundles; function-typed leaves stay non-partial. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => unknown
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

/** Validation messages for the cluster name field. */
export type RosaWizardClusterNameValidatorStrings = {
  maxLength: string;
  invalidChars: string;
  mustStartAlphanumeric: string;
  mustNotStartNumber: string;
  mustEndAlphanumeric: string;
};

/** Validation messages and interpolators for the operator roles prefix field. */
export type RosaWizardOperatorRolesPrefixValidatorStrings = {
  fieldLabel: string;
  invalidFormat: (label: string, value: string) => string;
  tooLong: (label: string, max: number) => string;
};

/** Validation messages for custom AWS KMS key ARN input. */
export type RosaWizardKmsKeyValidatorStrings = {
  required: string;
  noWhitespace: string;
  invalidArn: string;
  wrongRegion: string;
};

/** Validation messages when too many EC2 security groups are selected. */
export type RosaWizardSecurityGroupsValidatorStrings = {
  maxExceeded: (max: number) => string;
};

/** Validation messages for comma-separated no-proxy domain entries. */
export type RosaWizardNoProxyValidatorStrings = {
  invalidDomains: (domains: string, plural: boolean) => string;
};

/** Select group headings for OpenShift version options on the Details step (from API latest/default/releases). */
export type RosaWizardOpenShiftVersionGroupLabels = {
  latestRelease: string;
  defaultRelease: string;
  defaultRecommended: string;
  previousReleases: string;
  /** Used when the payload has no separate latest/default (only `releases`). */
  releases: string;
};

/** Validation messages for HTTP/HTTPS proxy URL fields. */
export type RosaWizardUrlValidatorStrings = {
  invalid: string;
  schemePrefix: (protocolList: string) => string;
};

/** Validation messages for additional trust bundle (PEM) content. */
export type RosaWizardCaValidatorStrings = {
  fileTooLarge: string;
  invalidPem: string;
};

/** Validation messages for machine pool root EBS volume size. */
export type RosaWizardRootDiskValidatorStrings = {
  notInteger: string;
  tooSmall: string;
  tooLargeNewOpenshift: string;
  tooLargeOldOpenshift: string;
};

/** Validation messages for replica counts, autoscaling min/max, and compute pool rules. */
export type RosaWizardReplicaValidatorStrings = {
  notInteger: string;
  notPositive: string;
  maxNodes: (max: number) => string;
  minGreaterThanMax: string;
  maxLessThanMin: string;
  computeMinTwo: string;
};

/** CIDR notation validation (networking step). */
export type RosaWizardCidrValidatorStrings = {
  invalidNotation: (value: string) => string;
};

/** Subnet address vs mask consistency (networking step). */
export type RosaWizardValidateRangeValidatorStrings = {
  notSubnetAddress: string;
};

/** Machine CIDR prefix bounds (networking step). */
export type RosaWizardAwsMachineCidrValidatorStrings = {
  maskTooLarge: (minMask: number) => string;
  maskTooSmallMultiAz: (maxMask: number) => string;
  maskTooSmallSingleAz: (maxMask: number) => string;
};

/** Service CIDR and related subnet mask bounds (networking step). */
export type RosaWizardServiceCidrValidatorStrings = {
  maskTooSmall: (maxMask: number, maxServices: number) => string;
  subnetMaskBetween: (min: number, max: number) => string;
  subnetMaskBetweenOneAnd: (max: number) => string;
};

/** Pod CIDR (networking step). */
export type RosaWizardPodCidrValidatorStrings = {
  maskTooSmall: (maxMask: number) => string;
  notEnoughNodes: (prefixLength: number) => string;
};

/** Machine / service / pod CIDR vs selected VPC subnets (networking step). */
export type RosaWizardSubnetCidrsValidatorStrings = {
  machineDoesNotIncludeStartIp: (startIp: string, subnetName: string) => string;
  serviceOverlaps: (subnetName: string, cidrBlock: string) => string;
  serviceIncludesStartIp: (startIp: string, subnetName: string) => string;
  podOverlaps: (subnetName: string, cidrBlock: string) => string;
  podIncludesStartIp: (startIp: string, subnetName: string) => string;
};

/** Non-overlapping machine, service, and pod ranges (networking step). */
export type RosaWizardDisjointSubnetsValidatorStrings = {
  fieldLabelMachine: string;
  fieldLabelService: string;
  fieldLabelPod: string;
  overlap: (otherFieldLabelsCsv: string, plural: boolean) => string;
};

/** Host prefix / node sizing (networking step). */
export type RosaWizardHostPrefixValidatorStrings = {
  invalidMaskFormat: (value: string) => string;
  maskTooLarge: (maxPrefix: number, maxPodIPs: number) => string;
  maskTooSmall: (minPrefix: number, maxPodIPs: number) => string;
};

/** All validator message groups used across RosaWizard networking, roles, disks, and forms. */
export type RosaWizardValidatorStrings = {
  clusterName: RosaWizardClusterNameValidatorStrings;
  operatorRolesPrefix: RosaWizardOperatorRolesPrefixValidatorStrings;
  kmsKeyArn: RosaWizardKmsKeyValidatorStrings;
  securityGroups: RosaWizardSecurityGroupsValidatorStrings;
  noProxyDomains: RosaWizardNoProxyValidatorStrings;
  url: RosaWizardUrlValidatorStrings;
  ca: RosaWizardCaValidatorStrings;
  rootDisk: RosaWizardRootDiskValidatorStrings;
  replicas: RosaWizardReplicaValidatorStrings;
  proxyConfigureAtLeastOne: string;
  cidr: RosaWizardCidrValidatorStrings;
  validateRange: RosaWizardValidateRangeValidatorStrings;
  awsMachineCidr: RosaWizardAwsMachineCidrValidatorStrings;
  serviceCidr: RosaWizardServiceCidrValidatorStrings;
  podCidr: RosaWizardPodCidrValidatorStrings;
  subnetCidrs: RosaWizardSubnetCidrsValidatorStrings;
  disjointSubnets: RosaWizardDisjointSubnetsValidatorStrings;
  hostPrefix: RosaWizardHostPrefixValidatorStrings;
};

/** Footer and shell labels for wizard navigation (Next, Back, Cancel, Submit, errors). */
export type RosaWizardChromeStrings = {
  nextButtonText: string;
  backButtonText: string;
  cancelButtonText: string;
  submitButtonText: string;
  skipToReviewButtonText: string;
  validationErrorText: string;
  closeButtonAriaLabel: string;
};

/** Complete user-visible copy for RosaWizard steps, review, errors, and ancillary UI. */
export type RosaWizardStrings = {
  wizard: {
    stepLabels: {
      basicSetup: string;
      details: string;
      rolesAndPolicies: string;
      machinePools: string;
      networking: string;
      clusterWideProxy: string;
      additionalSetup: string;
      encryptionOptional: string;
      clusterUpdatesOptional: string;
      yamlEditor: string;
      review: string;
    };
    /** Button labels for wizard footer chrome (Next, Back, Cancel, Submit). */
    chrome: RosaWizardChromeStrings;
  };
  submitError: {
    title: string;
    backToReviewStep: string;
    exitWizard: string;
  };
  yamlEditor: {
    title: string;
    description: string;
    parseErrorTitle: string;
    convertError: string;
    invalidYaml: string;
  };
  associateAwsDrawer: {
    panelTitle: string;
    introSts: string;
    cliVersion: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    closingPrompt: string;
    closeButton: string;
  };
  ocmRole: {
    checkLinkedTitle: string;
    existingLinkedInfo: string;
    unlinkedTitle: string;
    tabCreateNew: string;
    tabLinkExisting: string;
    basicOcmRoleLabel: string;
    orDivider: string;
    adminOcmRoleLabel: string;
    helpDecideTitle: string;
    helpBasicBody: string;
    helpAdminBody: string;
    linkExistingLead: string;
    orgAdminInfo: string;
  };
  userRole: {
    checkLinkedTitle: string;
    existingLinkedInfo: string;
    unlinkedTitle: string;
    whyLinkTitle: string;
    whyLinkBodyPrefix: string;
    reviewPermissionsLink: string;
    tabCreateNew: string;
    tabLinkExisting: string;
    userRoleLabel: string;
    userRolePopover: string;
    copyAriaListUserRole: string;
    copyAriaLinkUserRole: string;
  };
  accountRoles: {
    intro: string;
    copyAriaAccountRoles: string;
    manualInstructionsLead: string;
    manualInstructionsLink: string;
  };
  details: {
    sectionLabel: string;
    clusterNameLabel: string;
    clusterNamePlaceholder: string;
    clusterNameHelp: string;
    clusterNameRequired: string;
    openShiftVersionLabel: string;
    openShiftVersionPlaceholder: string;
    openShiftVersionOptionDisabledDescription: string;
    openShiftVersionGroups: RosaWizardOpenShiftVersionGroupLabels;
    awsInfraLabel: string;
    awsInfraPlaceholder: string;
    awsInfraHelp: string;
    associateNewAccount: string;
    billingLabel: string;
    billingPlaceholder: string;
    billingHelp: string;
    connectBillingLink: string;
    regionLabel: string;
    regionPlaceholder: string;
    regionHelp: string;
  };
  rolesAndPolicies: {
    accountRolesSection: string;
    installerRoleLabel: string;
    installerPlaceholder: string;
    installerRoleOptionDisabledDescription: string;
    installerHelpLead: string;
    installerLearnMoreLink: string;
    arnsToggle: string;
    supportRoleLabel: string;
    supportPlaceholder: string;
    supportHelp: string;
    workerRoleLabel: string;
    workerPlaceholder: string;
    workerHelp: string;
    operatorRolesSection: string;
    oidcLabel: string;
    oidcPlaceholder: string;
    oidcHelp: string;
    oidcPopoverTitle: string;
    operatorPrefixToggle: string;
    operatorPrefixLabel: string;
    operatorPrefixHelpLead: string;
    operatorPrefixLearnMoreLink: string;
    operatorPrefixHelper: string;
    clipboardCopyAria: string;
    copyHover: string;
    copyClicked: string;
  };
  oidcHint: {
    instructions: string;
  };
  networking: {
    sectionLabel: string;
    privacyHelper: string;
    publicLabel: string;
    publicPopover: string;
    publicSubnetLabel: string;
    publicSubnetPlaceholder: string;
    privateLabel: string;
    privatePopover: string;
    advancedToggle: string;
    proxyCheckboxLabel: string;
    proxyCheckboxHelp: string;
    proxyNextStepInfo: string;
    cidrAlertTitle: string;
    cidrAlertBody: string;
    cidrLearnMoreLink: string;
    useDefaultsLabel: string;
    useDefaultsHelp: string;
    machineCidrLabel: string;
    machineCidrHelp: string;
    serviceCidrLabel: string;
    serviceCidrHelp: string;
    podCidrLabel: string;
    podCidrHelp: string;
    hostPrefixLabel: string;
    hostPrefixHelp: string;
  };
  machinePools: {
    sectionLabel: string;
    intro: string;
    vpcLabel: string;
    vpcLabelPrefix: string;
    vpcPlaceholder: string;
    vpcHelpLead: string;
    vpcLearnMoreLink: string;
    machinePoolLabel: string;
    subnetLabel: string;
    addPoolButton: string;
    subnetPlaceholder: string;
    settingsSectionLabel: string;
    settingsIntro: string;
    instanceTypeLabel: string;
    instanceTypeHelpLead: string;
    instanceTypeLearnMore: string;
    advancedToggle: string;
    imdsHelpTitle: string;
    imdsHelpP1: string;
    imdsLabel: string;
    imdsBothLabel: string;
    imdsBothDescription: string;
    imdsV2Label: string;
    imdsV2Description: string;
    rootDiskLabel: string;
    rootDiskHelp: string;
    securityGroupsToggle: string;
  };
  autoscaling: {
    title: string;
    helperLead: string;
    learnMoreAutoscaling: string;
    enableLabel: string;
    minLabel: string;
    minHelp: string;
    learnMoreNodeCount: string;
    maxLabel: string;
    maxHelp: string;
    computeCountLabel: string;
    computeCountHelp: string;
  };
  securityGroups: {
    emptyTitle: string;
    emptyBodyPrefix: string;
    emptyBodySuffix: string;
    emptyConsoleLink: string;
    refreshLink: string;
    noEditTitle: string;
    formLabel: string;
    selectToggle: string;
    refreshTooltip: string;
    readOnlyEmpty: string;
    badgeSrText: string;
    optionsMenuAria: string;
    selectAriaLabelledBy: string;
    noEditViewMoreInfo: string;
    noEditAwsConsoleLink: string;
    incompatibleVersion: string;
  };
  clusterWideProxy: {
    sectionLabel: string;
    intro: string;
    learnMoreLink: string;
    alertConfigureFields: string;
    httpLabel: string;
    httpHelp: string;
    httpsLabel: string;
    httpsHelp: string;
    noProxyLabel: string;
    noProxyHelp: string;
    trustBundleLabel: string;
  };
  encryption: {
    sectionLabel: string;
    keysGroupLabel: string;
    keysHelperLead: string;
    keysLearnMore: string;
    defaultKms: string;
    customKms: string;
    keyArnLabel: string;
    keyArnHelp: string;
    etcdTitle: string;
    etcdLabel: string;
    etcdHelperLead: string;
    etcdLearnMore: string;
    keysNoteAlert: string;
  };
  clusterUpdates: {
    sectionLabel: string;
    versionIntroPrefix: string;
    versionIntroSuffix: string;
    detailsStepLink: string;
    midSentence: string;
    networkingStepLink: string;
    afterCreation: string;
    cveLead: string;
    criticalConcernsLink: string;
    cveTail: string;
    individualLabel: string;
    individualDescriptionLead: string;
    lifecycleLink: string;
    recurringLabel: string;
    recurringDescriptionBeforeZStream: string;
    zStreamLinkText: string;
    recurringDescriptionAfterZStream: string;
    dayTimeLabel: string;
    selectDayPlaceholder: string;
    daysOfWeek: [string, string, string, string, string, string, string];
  };
  review: {
    sectionLabel: string;
    alertTitle: string;
    detailsToggle: string;
    rolesToggle: string;
    networkingToggle: string;
    encryptionToggle: string;
    optionalNetworkingToggle: string;
    clusterUpdatesToggle: string;
    editStep: string;
    clusterName: string;
    openShiftVersion: string;
    awsInfra: string;
    awsBilling: string;
    region: string;
    installerRole: string;
    oidcConfigId: string;
    operatorPrefix: string;
    publicSubnet: string;
    installVpc: string;
    instanceType: string;
    computeCount: string;
    machinePoolsHeading: string;
    machinePoolLabel: string;
    subnetLabel: string;
    additionalEtcd: string;
    encryptionKeys: string;
    machineCidr: string;
    serviceCidr: string;
    podCidr: string;
    hostPrefix: string;
    updateStrategy: string;
    strategyIndividual: string;
    strategyAutomatic: string;
    autoscalingMinPrefix: string;
    autoscalingMaxPrefix: string;
  };
  common: {
    errorValidatingPrefix: string;
    errorLoadingPrefix: string;
    listSuffix: string;
    /** Popover `aria-label` for field API error details. */
    errorDetails: string;
    /** Trigger control `aria-label` to open error details popover. */
    showErrorDetails: string;
    retry: string;
    /** Generic required-field error used by select fields that are marked `isRequired`. */
    requiredField: string;
  };
};

/** Partial overrides for {@link RosaWizard}; omitted keys use defaults from {@link ./rosaWizardStrings.defaults}. */
export type RosaWizardStringsInput = DeepPartial<RosaWizardStrings> & {
  validators?: DeepPartial<RosaWizardValidatorStrings>;
  /**
   * Legacy compatibility: if provided, known keys (`nextButtonText`, `backButtonText`,
   * `cancelButtonText`, `submitButtonText`) are mapped into `wizard.chrome`.
   */
  formWizard?: DeepPartial<RosaWizardChromeStrings> & Record<string, unknown>;
};
