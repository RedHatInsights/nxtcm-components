import * as yup from 'yup';
import { overlapCidr, containsCidr } from 'cidr-tools';

import {
  AWS_MACHINE_CIDR_MAX_MULTI_AZ,
  AWS_MACHINE_CIDR_MAX_SINGLE_AZ,
  AWS_MACHINE_CIDR_MIN,
  CIDR_REGEXP,
  HOST_PREFIX_MAX,
  HOST_PREFIX_MIN,
  HOST_PREFIX_REGEXP,
  POD_CIDR_MAX,
  POD_NODES_MIN,
  SERVICE_CIDR_MAX,
  STEP_IDS,
} from '../constants';
import { parseCIDRSubnetLength } from '../utilities/helpers';
import { ClusterNetwork, ROSAHCPCluster } from '../types';
import type { WizardFieldMeta } from './types';
import {
  ctx,
  findOverlappingCidrFields,
  getStartingIP,
  isCidrSubnetAddress,
  isValidCidr,
  rosaCommonRequiredNonEmptyTest,
} from './helpers';

export const clusterPrivacySchema = yup
  .string()
  .default(ClusterNetwork.external)
  .test(rosaCommonRequiredNonEmptyTest)
  .required()
  .meta({
    id: 'cluster_privacy',
    labelKey: 'networking.clusterPrivacyLabel',
    stepId: STEP_IDS.NETWORKING,
    fieldSetLegend: false,
    fieldType: 'radio',
    noEditAfterSubmit: true,
    resetsFieldsToDefaultOnChange: ['cluster_privacy_public_subnet_id'],
  } satisfies WizardFieldMeta);

export const clusterPrivacyPublicSubnetIdSchema = yup
  .string()
  .optional()
  .meta({
    id: 'cluster_privacy_public_subnet_id',
    labelKey: 'networking.publicSubnetLabel',
    stepId: STEP_IDS.NETWORKING,
    fieldType: 'select',
    optionsWizardDataResource: 'vpcList',
    reconcileValueWithOptions: true,
  } satisfies WizardFieldMeta);

export const cidrDefaultSchema = yup
  .boolean()
  .default(true)
  .optional()
  .meta({
    id: 'cidr_default',
    labelKey: 'networking.useDefaultsLabel',
    helperTextKey: 'networking.useDefaultsHelp',
    stepId: STEP_IDS.NETWORKING,
    fieldType: 'checkbox',
    advanced: true,
    hideInReview: true,
    syncsFieldsOnChange: [
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
  } satisfies WizardFieldMeta);

export const networkMachineCidrSchema = yup
  .string()
  .default('10.0.0.0/16')
  .optional()
  .meta({
    id: 'network_machine_cidr',
    labelKey: 'networking.machineCidrLabel',
    helperTextKey: 'networking.machineCidrHelp',
    stepId: STEP_IDS.NETWORKING,
    fieldType: 'text',
    advanced: true,
    noEditAfterSubmit: true,
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
      'network_machine_cidr',
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
  .default('172.30.0.0/16')
  .optional()
  .meta({
    id: 'network_service_cidr',
    labelKey: 'networking.serviceCidrLabel',
    helperTextKey: 'networking.serviceCidrHelp',
    stepId: STEP_IDS.NETWORKING,
    fieldType: 'text',
    advanced: true,
    noEditAfterSubmit: true,
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
      'network_service_cidr',
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
  .default('10.128.0.0/14')
  .optional()
  .meta({
    id: 'network_pod_cidr',
    labelKey: 'networking.podCidrLabel',
    helperTextKey: 'networking.podCidrHelp',
    stepId: STEP_IDS.NETWORKING,
    fieldType: 'text',
    advanced: true,
    noEditAfterSubmit: true,
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
      'network_pod_cidr',
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
  .default('/23')
  .optional()
  .meta({
    id: 'network_host_prefix',
    labelKey: 'networking.hostPrefixLabel',
    helperTextKey: 'networking.hostPrefixHelp',
    stepId: STEP_IDS.NETWORKING,
    fieldType: 'text',
    advanced: true,
    noEditAfterSubmit: true,
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
  .default(false)
  .optional()
  .meta({
    id: 'configure_proxy',
    labelKey: 'networking.proxyCheckboxLabel',
    helperTextKey: 'networking.proxyCheckboxHelp',
    stepId: STEP_IDS.NETWORKING,
    fieldType: 'checkbox',
    advanced: true,
    hideInReview: true,
    resetsFieldsToDefaultOnChange: [
      'http_proxy_url',
      'https_proxy_url',
      'no_proxy_domains',
      'additional_trust_bundle',
    ],
  } satisfies WizardFieldMeta);

export const multiAzSchema = yup
  .string()
  .optional()
  .meta({
    id: 'multi_az',
    labelKey: 'networking.multiAzLabel',
    stepId: STEP_IDS.NETWORKING,
    hideInReview: true,
  } satisfies WizardFieldMeta);

export const hypershiftSchema = yup
  .string()
  .optional()
  .meta({
    id: 'hypershift',
    labelKey: 'networking.hypershiftLabel',
    stepId: STEP_IDS.NETWORKING,
    hideInReview: true,
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
