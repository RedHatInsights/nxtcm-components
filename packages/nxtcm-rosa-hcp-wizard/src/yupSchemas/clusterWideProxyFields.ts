import * as yup from 'yup';

import { BASE_DOMAIN_REGEXP, FIELD_NAME, MAX_CA_SIZE_BYTES } from '../constants';
import { stringToArray } from '../utilities/helpers';
import type { WizardFieldMeta } from './types';
import { ctx } from './helpers';
import { YUP } from './constants';

export const httpProxyUrlSchema = yup
  .string()
  .optional()
  .meta({
    id: YUP.CLUSTER_WIDE_PROXY.HTTP_PROXY_URL_SCHEMA.META.ID,
    labelKey: YUP.CLUSTER_WIDE_PROXY.HTTP_PROXY_URL_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.CLUSTER_WIDE_PROXY.HTTP_PROXY_URL_SCHEMA.META.HELPER_TEXT_KEY,
    placeholderKey: YUP.CLUSTER_WIDE_PROXY.HTTP_PROXY_URL_SCHEMA.META.PLACEHOLDER_KEY,
    stepId: YUP.CLUSTER_WIDE_PROXY.HTTP_PROXY_URL_SCHEMA.META.STEP_ID,
    fieldType: YUP.CLUSTER_WIDE_PROXY.HTTP_PROXY_URL_SCHEMA.META.FIELD_TYPE,
    resetsFieldsToDefaultOnChange:
      YUP.CLUSTER_WIDE_PROXY.HTTP_PROXY_URL_SCHEMA.META.RESETS_FIELDS_TO_DEFAULT_ON_CHANGE,
  } satisfies WizardFieldMeta)
  .test(FIELD_NAME.HTTP_PROXY_URL, '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      return this.createError({ message: msgs.url.invalid });
    }
    const scheme = parsed.protocol.slice(0, -1);
    if (scheme !== 'http') {
      return this.createError({ message: msgs.url.schemePrefix('http://') });
    }
    return true;
  });

export const httpsProxyUrlSchema = yup
  .string()
  .optional()
  .meta({
    id: YUP.CLUSTER_WIDE_PROXY.HTTPS_PROXY_URL_SCHEMA.META.ID,
    labelKey: YUP.CLUSTER_WIDE_PROXY.HTTPS_PROXY_URL_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.CLUSTER_WIDE_PROXY.HTTPS_PROXY_URL_SCHEMA.META.HELPER_TEXT_KEY,
    placeholderKey: YUP.CLUSTER_WIDE_PROXY.HTTPS_PROXY_URL_SCHEMA.META.PLACEHOLDER_KEY,
    stepId: YUP.CLUSTER_WIDE_PROXY.HTTPS_PROXY_URL_SCHEMA.META.STEP_ID,
    fieldType: YUP.CLUSTER_WIDE_PROXY.HTTPS_PROXY_URL_SCHEMA.META.FIELD_TYPE,
    resetsFieldsToDefaultOnChange:
      YUP.CLUSTER_WIDE_PROXY.HTTPS_PROXY_URL_SCHEMA.META.RESETS_FIELDS_TO_DEFAILT_ON_CHANGE,
  } satisfies WizardFieldMeta)
  .test(FIELD_NAME.HTTPS_PROXY_URL, '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      return this.createError({ message: msgs.url.invalid });
    }
    const scheme = parsed.protocol.slice(0, -1);
    if (!['http', 'https'].includes(scheme)) {
      return this.createError({ message: msgs.url.schemePrefix('http://, https://') });
    }
    return true;
  });

export const noProxyDomainsSchema = yup
  .string()
  .optional()
  .default(YUP.CLUSTER_WIDE_PROXY.NO_PROXY_DOMAINS_SCHEMA.DEFAULT)
  .meta({
    id: YUP.CLUSTER_WIDE_PROXY.NO_PROXY_DOMAINS_SCHEMA.META.ID,
    labelKey: YUP.CLUSTER_WIDE_PROXY.NO_PROXY_DOMAINS_SCHEMA.META.LABEL_KEY,
    helperTextKey: YUP.CLUSTER_WIDE_PROXY.NO_PROXY_DOMAINS_SCHEMA.META.HELPER_TEXT_KEY,
    placeholderKey: YUP.CLUSTER_WIDE_PROXY.NO_PROXY_DOMAINS_SCHEMA.META.PLACEHOLDER_KEY,
    stepId: YUP.CLUSTER_WIDE_PROXY.NO_PROXY_DOMAINS_SCHEMA.META.STEP_ID,
    fieldType: YUP.CLUSTER_WIDE_PROXY.NO_PROXY_DOMAINS_SCHEMA.META.FIELD_TYPE,
  } satisfies WizardFieldMeta)
  .test(FIELD_NAME.NO_PROXY_DOMAINS, '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);
    const domains = stringToArray(value);
    if (domains && domains.length > 0) {
      const invalid = domains.filter((d) => !!d && !BASE_DOMAIN_REGEXP.test(d));
      if (invalid.length > 0) {
        return this.createError({
          message: msgs.noProxyDomains.invalidDomains(invalid.join(', '), invalid.length > 1),
        });
      }
    }
    return true;
  });

export const additionalTrustBundleSchema = yup
  .string()
  .optional()
  .meta({
    id: YUP.CLUSTER_WIDE_PROXY.ADDITIONA_TRUST_BUNDLE_SCHEMA.META.ID,
    labelKey: YUP.CLUSTER_WIDE_PROXY.ADDITIONA_TRUST_BUNDLE_SCHEMA.META.LABEL_KEY,
    stepId: YUP.CLUSTER_WIDE_PROXY.ADDITIONA_TRUST_BUNDLE_SCHEMA.META.STEP_ID,
    fieldType: YUP.CLUSTER_WIDE_PROXY.ADDITIONA_TRUST_BUNDLE_SCHEMA.META.FIELD_TYPE,
    collapseOnRequired:
      YUP.CLUSTER_WIDE_PROXY.ADDITIONA_TRUST_BUNDLE_SCHEMA.META.COLLAPSE_ON_REQUIRED,
  } satisfies WizardFieldMeta)
  .test(FIELD_NAME.ADDITIONAL_TRUST_BUNDLE, '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);

    if (value.length > MAX_CA_SIZE_BYTES) {
      return this.createError({ message: msgs.ca.fileTooLarge });
    }

    const pemRegex =
      /-----BEGIN\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----[\s\S]+?-----END\s+(CERTIFICATE|TRUSTED CERTIFICATE|X509 CRL)-----/;
    if (!pemRegex.test(value)) {
      return this.createError({ message: msgs.ca.invalidPem });
    }
    return true;
  });

export const clusterWideProxyFields = {
  http_proxy_url: httpProxyUrlSchema,
  https_proxy_url: httpsProxyUrlSchema,
  no_proxy_domains: noProxyDomainsSchema,
  additional_trust_bundle: additionalTrustBundleSchema,
};
