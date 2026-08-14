import { STEP_IDS } from '../constants';
import { ClusterEncryptionKeys, ClusterNetwork, ClusterUpgrade } from '../types';

export const YUP = {
  NETWORKING: {
    CLUSTER_PRIVACY_SCHEMA: {
      DEFAULT: ClusterNetwork.external,
      META: {
        ID: 'cluster_privacy',
        LABEL_KEY: 'networking.clusterPrivacyLabel',
        STEP_ID: STEP_IDS.NETWORKING,
        FIELD_SET_LEGEND: false,
        FIELD_TYPE: 'radio',
        NO_EDIT_AFTER_SUBMIT: true,
        RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: ['cluster_privacy_public_subnet_id'],
      },
    },
    CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA: {
      META: {
        ID: 'cluster_privacy_public_subnet_id',
        LABEL_KEY: 'networking.publicSubnetLabel',
        PLACEHOLDER_KEY: 'networking.publicSubnetPlaceholder',
        STEP_ID: STEP_IDS.NETWORKING,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
        OPTIONS_WIZARD_DATA_RESOURCE: 'vpcList',
        RECONCILE_VALUE_WITH_OPTIONS: true,
      },
    },
    CIDR_DEFAULT_SCHEMA: {
      DEFAULT: true,
      META: {
        ID: 'cidr_default',
        LABEL_KEY: 'networking.useDefaultsLabel',
        HELPER_TEXT_KEY: 'networking.useDefaultsHelp',
        STEP_ID: STEP_IDS.NETWORKING,
        FIELD_TYPE: 'checkbox',
        ADVANCED: true,
        HIDE_IN_REVIEW: true,
        SYNCS_FIELDS_ON_CHANGE: [
          {
            when: true,
            setDefaults: [
              'network_machine_cidr',
              'network_service_cidr',
              'network_pod_cidr',
              'network_host_prefix',
            ],
          },
        ],
      },
    },
    NETWORK_MACHINE_CIDR_SCHEMA: {
      DEFAULT: '10.0.0.0/16',
      META: {
        ID: 'network_machine_cidr',
        LABEL_KEY: 'networking.machineCidrLabel',
        HELPER_TEXT_KEY: 'networking.machineCidrHelp',
        STEP_ID: STEP_IDS.NETWORKING,
        FIELD_TYPE: 'text',
        ADVANCED: true,
        NO_EDIT_AFTER_SUBMIT: true,
      },
    },
    NETWORK_SERVICE_CIDR_SCHEMA: {
      DEFAULT: '172.30.0.0/16',
      META: {
        ID: 'network_service_cidr',
        LABEL_KEY: 'networking.serviceCidrLabel',
        HELPER_TEXT_KEY: 'networking.serviceCidrHelp',
        STEP_ID: STEP_IDS.NETWORKING,
        FIELD_TYPE: 'text',
        ADVANCED: true,
        NO_EDIT_AFTER_SUBMIT: true,
      },
    },
    NETWORK_POD_CIDR_SCHEMA: {
      DEFAULT: '10.128.0.0/14',
      META: {
        ID: 'network_pod_cidr',
        LABEL_KEY: 'networking.podCidrLabel',
        HELPER_TEXT_KEY: 'networking.podCidrHelp',
        STEP_ID: STEP_IDS.NETWORKING,
        FIELD_TYPE: 'text',
        ADVANCED: true,
        NO_EDIT_AFTER_SUBMIT: true,
      },
    },
    NETWORK_HOST_PREFIX_SCHEMA: {
      DEFAULT: '/23',
      META: {
        ID: 'network_host_prefix',
        LABEL_KEY: 'networking.hostPrefixLabel',
        HELPER_TEXT_KEY: 'networking.hostPrefixHelp',
        STEP_ID: STEP_IDS.NETWORKING,
        FIELD_TYPE: 'text',
        ADVANCED: true,
        NO_EDIT_AFTER_SUBMIT: true,
      },
    },
    CONFIGURE_PROXY_SCHEMA: {
      DEFAULT: false,
      META: {
        ID: 'configure_proxy',
        LABEL_KEY: 'networking.proxyCheckboxLabel',
        HELPER_TEXT_KEY: 'networking.proxyCheckboxHelp',
        STEP_ID: STEP_IDS.NETWORKING,
        FIELD_TYPE: 'checkbox',
        ADVANCED: true,
        HIDE_IN_REVIEW: true,
        RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: [
          'http_proxy_url',
          'https_proxy_url',
          'no_proxy_domains',
          'additional_trust_bundle',
        ],
      },
    },
    MULTI_AZ_SCHEMA: {
      META: {
        ID: 'multi_az',
        LABEL_KEY: 'networking.multiAzLabel',
        STEP_ID: STEP_IDS.NETWORKING,
        HIDE_IN_REVIEW: true,
      },
    },
    HYPERSHIFT_SCHEMA: {
      META: {
        ID: 'hypershift',
        LABEL_KEY: 'networking.hypershiftLabel',
        STEP_ID: STEP_IDS.NETWORKING,
        HIDE_IN_REVIEW: true,
      },
    },
  },
  CLUSTER_WIDE_PROXY: {
    HTTP_PROXY_URL_SCHEMA: {
      META: {
        ID: 'http_proxy_url',
        LABEL_KEY: 'clusterWideProxy.httpLabel',
        HELPER_TEXT_KEY: 'clusterWideProxy.httpHelp',
        PLACEHOLDER_KEY: 'clusterWideProxy.httpPlaceholder',
        STEP_ID: STEP_IDS.CLUSTER_WIDE_PROXY,
        FIELD_TYPE: 'text',
        RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: ['no_proxy_domains'],
      },
    },
    HTTPS_PROXY_URL_SCHEMA: {
      META: {
        ID: 'https_proxy_url',
        LABEL_KEY: 'clusterWideProxy.httpsLabel',
        HELPER_TEXT_KEY: 'clusterWideProxy.httpsHelp',
        PLACEHOLDER_KEY: 'clusterWideProxy.httpsPlaceholder',
        STEP_ID: STEP_IDS.CLUSTER_WIDE_PROXY,
        FIELD_TYPE: 'text',
        RESETS_FIELDS_TO_DEFAILT_ON_CHANGE: ['no_proxy_domains'],
      },
    },
    NO_PROXY_DOMAINS_SCHEMA: {
      DEFAULT: '',
      META: {
        ID: 'no_proxy_domains',
        LABEL_KEY: 'clusterWideProxy.noProxyLabel',
        HELPER_TEXT_KEY: 'clusterWideProxy.noProxyHelp',
        PLACEHOLDER_KEY: 'clusterWideProxy.noProxyPlaceholder',
        STEP_ID: STEP_IDS.CLUSTER_WIDE_PROXY,
        FIELD_TYPE: 'text',
      },
    },
    ADDITIONA_TRUST_BUNDLE_SCHEMA: {
      META: {
        ID: 'additional_trust_bundle',
        LABEL_KEY: 'clusterWideProxy.trustBundleLabel',
        STEP_ID: STEP_IDS.CLUSTER_WIDE_PROXY,
        FIELD_TYPE: 'textarea',
        COLLAPSE_ON_REQUIRED: true,
      },
    },
  },
  ENCRYPTION: {
    KEYS_SCHEMA: {
      DEFAULT: ClusterEncryptionKeys.default,
      META: {
        ID: 'encryption_keys',
        LABEL_KEY: 'encryption.keysGroupLabel',
        STEP_ID: STEP_IDS.ENCRYPTION,
        FIELD_TYPE: 'radio',
        NO_EDIT_AFTER_SUBMIT: true,
        RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: ['kms_key_arn'],
      },
    },
    KMS_KEY_ARN_SCHEMA: {
      META: {
        ID: 'kms_key_arn',
        LABEL_KEY: 'encryption.keyArnLabel',
        LABEL_HELP_KEY: 'encryption.keyArnHelp',
        STEP_ID: STEP_IDS.ENCRYPTION,
        FIELD_TYPE: 'text',
        NO_EDIT_AFTER_SUBMIT: true,
      },
    },
    ETCD_ENCRYPTION_SCHEMA: {
      DEFAULT: false,
      META: {
        ID: 'etcd_encryption',
        LABEL_KEY: 'encryption.etcdLabel',
        TITLE: 'etcd encryption',
        STEP_ID: STEP_IDS.ENCRYPTION,
        FIELD_TYPE: 'checkbox',
        NO_EDIT_AFTER_SUBMIT: true,
        REVIEW_LABEL: 'Additional etcd encryption',
        RESETS_FIELDS_TO_DEFAILT_ON_CHANGE: ['etcd_key_arn'],
      },
    },
    ETC_KEY_ARN_SCHEMA: {
      META: {
        ID: 'etcd_key_arn',
        LABEL_KEY: 'encryption.keyArnLabel',
        LABEL_HELP_KEY: 'encryption.keyArnHelp',
        STEP_ID: STEP_IDS.ENCRYPTION,
        FIELD_TYPE: 'text',
        NO_EDIT_AFTER_SUBMIT: true,
      },
    },
  },
  MACHINE_POOLS: {
    SELECTED_VPC_SCHEMA: {
      META: {
        ID: 'selected_vpc',
        LABEL_KEY: 'machinePools.vpcLabel',
        PLACEHOLDER_KEY: 'machinePools.vpcPlaceholder',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
        REVIEW_LABEL: 'Install to selected VPC',
        OPTIONS_WIZARD_DATA_RESOURCE: 'vpcList',
        REFETCHES_RESOURCES_ON_CHANGE: [
          {
            resource: 'machineTypes',
            argsFromFields: {
              role_arn: 'installer_role_arn',
              region: 'region',
              availability_zones: 'selected_vpc',
            },
          },
        ],
        RECONCILE_VALUE_WITH_OPTIONS: true,
        RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: ['machine_pools_subnets', 'security_groups_worker'],
        DERIVED_FIELDS_SYNC_ON_CHANGE: 'vpcSecurityGroupsWorkerSelection',
      },
    },
    MACHINE_POOL_SUBNET_ENTRY_SCHEMA: {
      META: {
        ID: 'machine_pool_subnet',
        LABEL_KEY: 'machinePools.subnetLabel',
        PLACEHOLDER_KEY: 'machinePools.subnetPlaceholder',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'select',
        OPTIONS_WIZARD_DATA_RESOURCE: 'vpcList',
        RECONCILE_VALUE_WITH_OPTIONS: true,
      },
    },
    MACHINE_POOLS_SUBNETS_SCHEMA: {
      META: {
        ID: 'machine_pools_subnets',
        LABEL_KEY: 'machinePools.subnetLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
      },
    },
    MACHINE_TYPE_SCHEMA: {
      META: {
        ID: 'machine_type',
        LABEL_KEY: 'machinePools.instanceTypeLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
        OPTIONS_WIZARD_DATA_RESOURCE: 'machineTypes',
        RECONCILE_VALUE_WITH_OPTIONS: true,
      },
    },
    AUTOSCALING_SCHEMA: {
      DEFAULT: false,
      META: {
        ID: 'autoscaling',
        LABEL_KEY: 'autoscaling.enableLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'checkbox',
        HIDE_IN_REVIEW: true,
        SYNCS_FIELDS_ON_CHANGE: [
          {
            when: true,
            setDefaults: ['min_replicas', 'max_replicas'],
            clear: ['nodes_compute'],
          },
          {
            when: false,
            setDefaults: ['nodes_compute'],
            clear: ['min_replicas', 'max_replicas'],
          },
        ],
      },
    },
    NODES_COMPUTE_SCHEMA: {
      DEFAULT: 2,
      META: {
        ID: 'nodes_compute',
        LABEL_KEY: 'autoscaling.computeCountLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'number',
      },
    },
    MIN_REPLICAS_SCHEMA: {
      DEFAULT: 2,
      META: {
        ID: 'min_replicas',
        LABEL_KEY: 'autoscaling.minLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'number',
      },
    },
    MAX_REPLICAS_SCHEMA: {
      DEFAULT: 4,
      META: {
        ID: 'max_replicas',
        LABEL_KEY: 'autoscaling.maxLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'number',
      },
    },
    COMPUTE_ROOT_VOLUME_SCHEMA: {
      DEFAULT: 300,
      META: {
        ID: 'compute_root_volume',
        LABEL_KEY: 'machinePools.rootDiskLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'number',
        NO_EDIT_AFTER_SUBMIT: true,
        UNIT: 'GiB',
        ADVANCED: true,
      },
    },
    IMDS_SCHEMA: {
      META: {
        ID: 'imds',
        LABEL_KEY: 'machinePools.imdsLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'radio',
        NO_EDIT_AFTER_SUBMIT: true,
        ADVANCED: true,
      },
    },
    SECURITY_GROUPS_WORKER_SCHEMA: {
      DEFAULT: [] as readonly string[],
      META: {
        ID: 'security_groups_worker',
        LABEL_KEY: 'securityGroups.formLabel',
        STEP_ID: STEP_IDS.MACHINE_POOLS,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
        RECONCILE_VALUE_WITH_OPTIONS: false,
      },
    },
  },
  CLUSTER_UPDATES_FIELDS: {
    UPGRADE_POLICY_SCHEMA: {
      META: {
        ID: 'upgrade_policy',
        LABEL_KEY: 'clusterUpdates.upgradePolicyLabel',
        REVIEW_LABEL: 'review.updateStrategy',
        STEP_ID: STEP_IDS.CLUSTER_UPDATES,
        FIELD_TYPE: 'radio',
      },
      DEFAULT: ClusterUpgrade.automatic,
    },
    UPGRADE_SCHEDULE_SCHEMA: {
      META: {
        ID: 'upgrade_schedule',
        LABEL_KEY: 'clusterUpdates.dayTimeLabel',
        REVIEW_LABEL: 'clusterUpdates.upgradeScheduleLabel',
        STEP_ID: STEP_IDS.CLUSTER_UPDATES,
      },
      DEFAULT: '00 0 * * 0',
    },
  },
  DETAILS: {
    NAME_SCHEMA: {
      DEFAULT: '',
      META: {
        ID: 'name',
        LABEL_KEY: 'details.clusterNameLabel',
        PLACEHOLDER_KEY: 'details.clusterNamePlaceholder',
        LABEL_HELP_KEY: 'details.clusterNameHelp',
        STEP_ID: STEP_IDS.DETAILS,
        FIELD_TYPE: 'text',
        NO_EDIT_AFTER_SUBMIT: true,
        VALIDATE_ON_BLUR: true,
      },
    },
    CLUSTER_VERSION_SCHEMA: {
      META: {
        ID: 'cluster_version',
        LABEL_KEY: 'details.openShiftVersionLabel',
        PLACEHOLDER_KEY: 'details.openShiftVersionPlaceholder',
        LABEL_HELP_KEY: 'details.openShiftVersionHelp',
        STEP_ID: STEP_IDS.DETAILS,
        FIELD_TYPE: 'select',
        OPTIONS_WIZARD_DATA_RESOURCE: 'versions',
        RECONCILE_VALUE_WITH_OPTIONS: true,
        RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: ['imds', 'security_groups_worker'],
      },
    },
    ASSOCIATED_AWS_ID_SCHEMA: {
      META: {
        ID: 'associated_aws_id',
        LABEL_KEY: 'details.awsInfraLabel',
        LABEL_HELP_KEY: 'details.awsInfraHelp',
        PLACEHOLDER_KEY: 'details.awsInfraPlaceholder',
        STEP_ID: STEP_IDS.DETAILS,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
        OPTIONS_WIZARD_DATA_RESOURCE: 'awsInfrastructureAccounts',
        RECONCILE_VALUE_WITH_OPTIONS: true,
        RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: [
          'installer_role_arn',
          'support_role_arn',
          'worker_role_arn',
          'selected_vpc',
          'machine_pools_subnets',
          'cluster_privacy_public_subnet_id',
        ],
        REFETCHES_RESOURCES_ON_CHANGE: [
          { resource: 'regions', argFromField: 'associated_aws_id' },
          { resource: 'roles', argFromField: 'associated_aws_id' },
          { resource: 'oidcConfig', argFromField: 'associated_aws_id' },
        ],
      },
    },
    BILLING_ACCOUNT_ID_SCHEMA: {
      META: {
        ID: 'billing_account_id',
        LABEL_KEY: 'details.billingLabel',
        LABEL_HELP_KEY: 'details.billingHelp',
        PLACEHOLDER_KEY: 'details.billingPlaceholder',
        STEP_ID: STEP_IDS.DETAILS,
        FIELD_TYPE: 'select',
        OPTIONS_WIZARD_DATA_RESOURCE: 'awsBillingAccounts',
        RECONCILE_VALUE_WITH_OPTIONS: true,
        REVIEW_LABEL: 'AWS billing account',
      },
    },
    REGION_SCHEMA: {
      META: {
        ID: 'region',
        LABEL_KEY: 'details.regionLabel',
        PLACEHOLDER_KEY: 'details.regionPlaceholder',
        STEP_ID: STEP_IDS.DETAILS,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
        OPTIONS_WIZARD_DATA_RESOURCE: 'regions',
        RECONCILE_VALUE_WITH_OPTIONS: true,
        RESETS_FIELDS_TO_DEFAULT_ON_CHANGE: [
          'selected_vpc',
          'machine_pools_subnets',
          'security_groups_worker',
          'cluster_privacy_public_subnet_id',
        ],
        REFETCHES_RESOURCES_ON_CHANGE: [
          {
            resource: 'vpcList',
            argsFromFields: {
              account_id: 'associated_aws_id',
              role_arn: 'installer_role_arn',
              region: 'region',
            },
          },
          {
            resource: 'machineTypes',
            argsFromFields: {
              role_arn: 'installer_role_arn',
              region: 'region',
              availability_zones: 'selected_vpc',
            },
          },
        ],
      },
    },
  },
  ROLES_AND_POLICIES: {
    INSTALLER_ROLE_ARN_SCHEMA: {
      META: {
        ID: 'installer_role_arn',
        LABEL_KEY: 'rolesAndPolicies.installerRoleLabel',
        LABEL_HELP_KEY: 'rolesAndPolicies.installerRoleHelp',
        PLACEHOLDER_KEY: 'rolesAndPolicies.installerRolePlaceholder',
        STEP_ID: STEP_IDS.ROLES_AND_POLICIES,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
        OPTIONS_WIZARD_DATA_RESOURCE: 'roles',
        REFETCHES_RESOURCES_ON_CHANGE: [
          {
            resource: 'vpcList',
            argsFromFields: {
              account_id: 'associated_aws_id',
              role_arn: 'installer_role_arn',
              region: 'region',
            },
          },
          {
            resource: 'machineTypes',
            argsFromFields: {
              role_arn: 'installer_role_arn',
              region: 'region',
              availability_zones: 'selected_vpc',
            },
          },
        ],
        RECONCILE_VALUE_WITH_OPTIONS: true,
        DERIVED_FIELDS_SYNC_ON_CHANGE: 'installerRoleDependentRoles',
      },
    },
    SUPPORT_ROLE_ARN_SCHEMA: {
      META: {
        ID: 'support_role_arn',
        LABEL_KEY: 'rolesAndPolicies.supportRoleLabel',
        LABEL_HELP_KEY: 'rolesAndPolicies.supportHelp',
        PLACEHOLDER_KEY: 'rolesAndPolicies.installerPlaceholder',
        STEP_ID: STEP_IDS.ROLES_AND_POLICIES,
        FIELD_TYPE: 'text',
        NO_EDIT_AFTER_SUBMIT: true,
        OPTIONS_WIZARD_DATA_RESOURCE: 'roles',
        RECONCILE_VALUE_WITH_OPTIONS: false,
      },
    },
    WORKER_ROLE_ARN_SCHEMA: {
      META: {
        ID: 'worker_role_arn',
        LABEL_KEY: 'rolesAndPolicies.workerRoleLabel',
        LABEL_HELP_KEY: 'rolesAndPolicies.workerHelp',
        PLACEHOLDER_KEY: 'rolesAndPolicies.installerPlaceholder',
        STEP_ID: STEP_IDS.ROLES_AND_POLICIES,
        FIELD_TYPE: 'text',
        NO_EDIT_AFTER_SUBMIT: true,
        OPTIONS_WIZARD_DATA_RESOURCE: 'roles',
        RECONCILE_VALUE_WITH_OPTIONS: false,
      },
    },
    BYO_OIDC_CONFIG_ID_SCHEMA: {
      META: {
        ID: 'byo_oidc_config_id',
        LABEL_KEY: 'rolesAndPolicies.oidcLabel',
        LABEL_HELP_KEY: 'rolesAndPolicies.oidcHelp',
        PLACEHOLDER_KEY: 'rolesAndPolicies.oidcPlaceholder',
        LABEL_HELP_TITLE_KEY: 'rolesAndPolicies.oidcPopoverTitle',
        STEP_ID: STEP_IDS.ROLES_AND_POLICIES,
        FIELD_TYPE: 'select',
        NO_EDIT_AFTER_SUBMIT: true,
        OPTIONS_WIZARD_DATA_RESOURCE: 'oidcConfig',
        RECONCILE_VALUE_WITH_OPTIONS: true,
      },
    },
    CUSTOM_OPERATOR_ROLES_PREFIX_SCHEMA: {
      DEFAULT: '',
      META: {
        ID: 'custom_operator_roles_prefix',
        LABEL_KEY: 'rolesAndPolicies.operatorPrefixLabel',
        STEP_ID: STEP_IDS.ROLES_AND_POLICIES,
        FIELD_TYPE: 'text',
        NO_EDIT_AFTER_SUBMIT: true,
      },
    },
  },
} as const;
