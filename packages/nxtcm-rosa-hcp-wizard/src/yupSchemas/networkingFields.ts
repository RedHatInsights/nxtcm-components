import * as yup from 'yup';
import { overlapCidr, containsCidr } from 'cidr-tools';

import {
  AWS_MACHINE_CIDR_MAX_MULTI_AZ,
  AWS_MACHINE_CIDR_MAX_SINGLE_AZ,
  AWS_MACHINE_CIDR_MIN,
  CIDR_REGEXP,
  FIELD_NAME,
  HOST_PREFIX_MAX,
  HOST_PREFIX_MIN,
  HOST_PREFIX_REGEXP,
  POD_CIDR_MAX,
  POD_NODES_MIN,
  SERVICE_CIDR_MAX,
} from '../constants';
import { parseCIDRSubnetLength } from '../utilities/helpers';
import { ROSAHCPCluster } from '../types';
import type { WizardFieldMeta } from './types';
import {
  ctx,
  findOverlappingCidrFields,
  getStartingIP,
  isCidrSubnetAddress,
  isValidCidr,
  rosaCommonRequiredNonEmptyTest,
  rosaRequiredStringField,
} from './helpers';
import { YUP_FIELD_REQUIRED_UI_META_KEY } from '../utilities/yupFieldRequired';
import { YUP } from './constants';

export const clusterPrivacySchema = rosaRequiredStringField()
  .default(YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.DEFAULT)
  .meta({
    id: YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.META.LABEL_KEY,
    stepId: YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.META.STEP_ID,
    fieldSetLegend: YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.META.FIELD_SET_LEGEND,
    fieldType: YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
    resetsFieldsToDefaultOnChange:
      YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.META.RESETS_FIELDS_TO_DEFAULT_ON_CHANGE,
  } satisfies WizardFieldMeta);

export const clusterPrivacyPublicSubnetIdSchema = yup
  .string()
  .meta({
    id: YUP.NETWORKING.CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA.META.LABEL_KEY,
    placeholderKey: YUP.NETWORKING.CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA.META.PLACEHOLDER_KEY,
    stepId: YUP.NETWORKING.CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA.META.STEP_ID,
    fieldType: YUP.NETWORKING.CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit:
      YUP.NETWORKING.CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
    optionsWizardDataResource:
      YUP.NETWORKING.CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA.META.OPTIONS_WIZARD_DATA_RESOURCE,
    reconcileValueWithOptions:
      YUP.NETWORKING.CLUSTER_PRIVACY_PUBLIC_SUBNET_ID_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
  } satisfies WizardFieldMeta)
  .when('cluster_privacy', {
    is: YUP.NETWORKING.CLUSTER_PRIVACY_SCHEMA.DEFAULT,
    then: (schema) =>
      schema.test(rosaCommonRequiredNonEmptyTest).meta({ [YUP_FIELD_REQUIRED_UI_META_KEY]: true }),
    otherwise: (schema) => schema.optional(),
  });

export const cidrDefaultSchema = yup
  .boolean()
  .default(YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.META.HELPER_TEXT_KEY,
    stepId: YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.META.STEP_ID,
    fieldType: YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.META.FIELD_TYPE,
    advanced: YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.META.ADVANCED,
    hideInReview: YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.META.HIDE_IN_REVIEW,
    syncsFieldsOnChange: YUP.NETWORKING.CIDR_DEFAULT_SCHEMA.META.SYNCS_FIELDS_ON_CHANGE,
  } satisfies WizardFieldMeta);

export const networkMachineCidrSchema = yup
  .string()
  .default(YUP.NETWORKING.NETWORK_MACHINE_CIDR_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.NETWORKING.NETWORK_MACHINE_CIDR_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.NETWORK_MACHINE_CIDR_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.NETWORKING.NETWORK_MACHINE_CIDR_SCHEMA.META.HELPER_TEXT_KEY,
    stepId: YUP.NETWORKING.NETWORK_MACHINE_CIDR_SCHEMA.META.STEP_ID,
    fieldType: YUP.NETWORKING.NETWORK_MACHINE_CIDR_SCHEMA.META.FIELD_TYPE,
    advanced: YUP.NETWORKING.NETWORK_MACHINE_CIDR_SCHEMA.META.ADVANCED,
    noEditAfterSubmit: YUP.NETWORKING.NETWORK_MACHINE_CIDR_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  } satisfies WizardFieldMeta)
  .test('machine-cidr', '', function (value) {
    if (!value) return true;
    const { msgs, selectedSubnets } = ctx(this);

    if (!isValidCidr(value)) {
      return this.createError({ message: msgs.cidr.invalidNotation(value) });
    }
    if (!isCidrSubnetAddress(value)) {
      return this.createError({ message: msgs.validateRange.notSubnetAddress });
    }

    const prefixLength = parseCIDRSubnetLength(value);
    const formData = this.parent as Partial<ROSAHCPCluster>;
    const isMultiAz = formData.multi_az === 'true';

    if (prefixLength != null) {
      if (prefixLength < AWS_MACHINE_CIDR_MIN) {
        return this.createError({
          message: msgs.awsMachineCidr.maskTooLarge(AWS_MACHINE_CIDR_MIN),
        });
      }
      if (
        (isMultiAz || formData.hypershift === 'true') &&
        prefixLength > AWS_MACHINE_CIDR_MAX_MULTI_AZ
      ) {
        return this.createError({
          message: msgs.awsMachineCidr.maskTooSmallMultiAz(AWS_MACHINE_CIDR_MAX_MULTI_AZ),
        });
      }
      if (!isMultiAz && prefixLength > AWS_MACHINE_CIDR_MAX_SINGLE_AZ) {
        return this.createError({
          message: msgs.awsMachineCidr.maskTooSmallSingleAz(AWS_MACHINE_CIDR_MAX_SINGLE_AZ),
        });
      }
    }

    if (selectedSubnets && selectedSubnets.length > 0) {
      for (const subnet of selectedSubnets) {
        if (
          CIDR_REGEXP.test(subnet.cidr_block) &&
          !containsCidr(value, getStartingIP(subnet.cidr_block))
        ) {
          const subnetLabel = subnet.name || subnet.subnet_id;
          return this.createError({
            message: msgs.subnetCidrs.machineDoesNotIncludeStartIp(
              getStartingIP(subnet.cidr_block),
              subnetLabel
            ),
          });
        }
      }
    }

    const overlapping = findOverlappingCidrFields(
      value,
      FIELD_NAME.NETWORK_MACHINE_CIDR,
      formData,
      msgs.disjointSubnets
    );
    if (overlapping.length > 0) {
      return this.createError({
        message: msgs.disjointSubnets.overlap(overlapping.join(', '), overlapping.length > 1),
      });
    }

    return true;
  });

export const networkServiceCidrSchema = yup
  .string()
  .default(YUP.NETWORKING.NETWORK_SERVICE_CIDR_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.NETWORKING.NETWORK_SERVICE_CIDR_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.NETWORK_SERVICE_CIDR_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.NETWORKING.NETWORK_SERVICE_CIDR_SCHEMA.META.HELPER_TEXT_KEY,
    stepId: YUP.NETWORKING.NETWORK_SERVICE_CIDR_SCHEMA.META.STEP_ID,
    fieldType: YUP.NETWORKING.NETWORK_SERVICE_CIDR_SCHEMA.META.FIELD_TYPE,
    advanced: YUP.NETWORKING.NETWORK_SERVICE_CIDR_SCHEMA.META.ADVANCED,
    noEditAfterSubmit: YUP.NETWORKING.NETWORK_SERVICE_CIDR_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  } satisfies WizardFieldMeta)
  .test('service-cidr', '', function (value) {
    if (!value) return true;
    const { msgs, selectedSubnets } = ctx(this);

    if (!isValidCidr(value)) {
      return this.createError({ message: msgs.cidr.invalidNotation(value) });
    }
    if (!isCidrSubnetAddress(value)) {
      return this.createError({ message: msgs.validateRange.notSubnetAddress });
    }

    const prefixLength = parseCIDRSubnetLength(value);
    if (prefixLength != null && prefixLength > SERVICE_CIDR_MAX) {
      const maxServices = 2 ** (32 - SERVICE_CIDR_MAX) - 2;
      return this.createError({
        message: msgs.serviceCidr.maskTooSmall(SERVICE_CIDR_MAX, maxServices),
      });
    }

    const parts = value.split('/');
    const maskBits = parseInt(parts[1], 10);
    if (maskBits > SERVICE_CIDR_MAX || maskBits < 1) {
      return this.createError({
        message: msgs.serviceCidr.subnetMaskBetweenOneAnd(SERVICE_CIDR_MAX),
      });
    }

    const formData = this.parent as Partial<ROSAHCPCluster>;

    if (selectedSubnets && selectedSubnets.length > 0) {
      for (const subnet of selectedSubnets) {
        if (CIDR_REGEXP.test(subnet.cidr_block)) {
          const subnetLabel = subnet.name || subnet.subnet_id;
          if (containsCidr(value, getStartingIP(subnet.cidr_block))) {
            return this.createError({
              message: msgs.subnetCidrs.serviceIncludesStartIp(
                getStartingIP(subnet.cidr_block),
                subnetLabel
              ),
            });
          }
          if (overlapCidr(value, subnet.cidr_block)) {
            return this.createError({
              message: msgs.subnetCidrs.serviceOverlaps(subnetLabel, subnet.cidr_block),
            });
          }
        }
      }
    }

    const overlapping = findOverlappingCidrFields(
      value,
      FIELD_NAME.NETWORK_SERVICE_CIDR,
      formData,
      msgs.disjointSubnets
    );
    if (overlapping.length > 0) {
      return this.createError({
        message: msgs.disjointSubnets.overlap(overlapping.join(', '), overlapping.length > 1),
      });
    }

    return true;
  });

export const networkPodCidrSchema = yup
  .string()
  .default(YUP.NETWORKING.NETWORK_POD_CIDR_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.NETWORKING.NETWORK_POD_CIDR_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.NETWORK_POD_CIDR_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.NETWORKING.NETWORK_POD_CIDR_SCHEMA.META.HELPER_TEXT_KEY,
    stepId: YUP.NETWORKING.NETWORK_POD_CIDR_SCHEMA.META.STEP_ID,
    fieldType: YUP.NETWORKING.NETWORK_POD_CIDR_SCHEMA.META.FIELD_TYPE,
    advanced: YUP.NETWORKING.NETWORK_POD_CIDR_SCHEMA.META.ADVANCED,
    noEditAfterSubmit: YUP.NETWORKING.NETWORK_POD_CIDR_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  } satisfies WizardFieldMeta)
  .test('pod-cidr', '', function (value) {
    if (!value) return true;
    const { msgs, selectedSubnets } = ctx(this);

    if (!isValidCidr(value)) {
      return this.createError({ message: msgs.cidr.invalidNotation(value) });
    }
    if (!isCidrSubnetAddress(value)) {
      return this.createError({ message: msgs.validateRange.notSubnetAddress });
    }

    const formData = this.parent as Partial<ROSAHCPCluster>;
    const prefixLength = parseCIDRSubnetLength(value);

    if (prefixLength != null) {
      if (prefixLength > POD_CIDR_MAX) {
        return this.createError({ message: msgs.podCidr.maskTooSmall(POD_CIDR_MAX) });
      }

      const hostPrefixLen = parseCIDRSubnetLength(formData.network_host_prefix) || 23;
      const maxPodIPs = 2 ** (32 - hostPrefixLen);
      const maxPodNodes = Math.floor(2 ** (32 - prefixLength) / maxPodIPs);
      if (maxPodNodes < POD_NODES_MIN) {
        return this.createError({ message: msgs.podCidr.notEnoughNodes(prefixLength) });
      }
    }

    if (selectedSubnets && selectedSubnets.length > 0) {
      for (const subnet of selectedSubnets) {
        if (CIDR_REGEXP.test(subnet.cidr_block)) {
          const subnetLabel = subnet.name || subnet.subnet_id;
          if (containsCidr(value, getStartingIP(subnet.cidr_block))) {
            return this.createError({
              message: msgs.subnetCidrs.podIncludesStartIp(
                getStartingIP(subnet.cidr_block),
                subnetLabel
              ),
            });
          }
          if (overlapCidr(value, subnet.cidr_block)) {
            return this.createError({
              message: msgs.subnetCidrs.podOverlaps(subnetLabel, subnet.cidr_block),
            });
          }
        }
      }
    }

    const overlapping = findOverlappingCidrFields(
      value,
      FIELD_NAME.NETWORK_POD_CIDR,
      formData,
      msgs.disjointSubnets
    );
    if (overlapping.length > 0) {
      return this.createError({
        message: msgs.disjointSubnets.overlap(overlapping.join(', '), overlapping.length > 1),
      });
    }

    return true;
  });

export const networkHostPrefixSchema = yup
  .string()
  .default(YUP.NETWORKING.NETWORK_HOST_PREFIX_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.NETWORKING.NETWORK_HOST_PREFIX_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.NETWORK_HOST_PREFIX_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.NETWORKING.NETWORK_HOST_PREFIX_SCHEMA.META.HELPER_TEXT_KEY,
    stepId: YUP.NETWORKING.NETWORK_HOST_PREFIX_SCHEMA.META.STEP_ID,
    fieldType: YUP.NETWORKING.NETWORK_HOST_PREFIX_SCHEMA.META.FIELD_TYPE,
    advanced: YUP.NETWORKING.NETWORK_HOST_PREFIX_SCHEMA.META.ADVANCED,
    noEditAfterSubmit: YUP.NETWORKING.NETWORK_HOST_PREFIX_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  } satisfies WizardFieldMeta)
  .test('host-prefix', '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);

    if (!HOST_PREFIX_REGEXP.test(value)) {
      return this.createError({ message: msgs.hostPrefix.invalidMaskFormat(value) });
    }

    const prefixLength = parseCIDRSubnetLength(value);
    if (prefixLength != null) {
      if (prefixLength < HOST_PREFIX_MIN) {
        const maxPodIPs = 2 ** (32 - HOST_PREFIX_MIN) - 2;
        return this.createError({
          message: msgs.hostPrefix.maskTooLarge(HOST_PREFIX_MIN, maxPodIPs),
        });
      }
      if (prefixLength > HOST_PREFIX_MAX) {
        const maxPodIPs = 2 ** (32 - HOST_PREFIX_MAX) - 2;
        return this.createError({
          message: msgs.hostPrefix.maskTooSmall(HOST_PREFIX_MAX, maxPodIPs),
        });
      }
    }
    return true;
  });

export const configureProxySchema = yup
  .boolean()
  .default(YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.META.HELPER_TEXT_KEY,
    stepId: YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.META.STEP_ID,
    fieldType: YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.META.FIELD_TYPE,
    advanced: YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.META.ADVANCED,
    hideInReview: YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.META.HIDE_IN_REVIEW,
    resetsFieldsToDefaultOnChange:
      YUP.NETWORKING.CONFIGURE_PROXY_SCHEMA.META.RESETS_FIELDS_TO_DEFAULT_ON_CHANGE,
  } satisfies WizardFieldMeta);

export const multiAzSchema = yup
  .string()
  .optional()
  .meta({
    id: YUP.NETWORKING.MULTI_AZ_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.MULTI_AZ_SCHEMA.META.LABEL_KEY,
    stepId: YUP.NETWORKING.MULTI_AZ_SCHEMA.META.STEP_ID,
    hideInReview: YUP.NETWORKING.MULTI_AZ_SCHEMA.META.HIDE_IN_REVIEW,
  } satisfies WizardFieldMeta);

export const hypershiftSchema = yup
  .string()
  .optional()
  .meta({
    id: YUP.NETWORKING.HYPERSHIFT_SCHEMA.META.ID,
    labelKey: YUP.NETWORKING.HYPERSHIFT_SCHEMA.META.LABEL_KEY,
    stepId: YUP.NETWORKING.HYPERSHIFT_SCHEMA.META.STEP_ID,
    hideInReview: YUP.NETWORKING.HYPERSHIFT_SCHEMA.META.HIDE_IN_REVIEW,
  } satisfies WizardFieldMeta);

export const networkingFields = {
  cluster_privacy: clusterPrivacySchema,
  cluster_privacy_public_subnet_id: clusterPrivacyPublicSubnetIdSchema,
  cidr_default: cidrDefaultSchema,
  network_machine_cidr: networkMachineCidrSchema,
  network_service_cidr: networkServiceCidrSchema,
  network_pod_cidr: networkPodCidrSchema,
  network_host_prefix: networkHostPrefixSchema,
  configure_proxy: configureProxySchema,
  multi_az: multiAzSchema,
  hypershift: hypershiftSchema,
};
