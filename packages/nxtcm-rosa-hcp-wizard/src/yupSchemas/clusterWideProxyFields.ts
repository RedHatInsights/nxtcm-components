import * as yup from 'yup';

import { BASE_DOMAIN_REGEXP, MAX_CA_SIZE_BYTES, STEP_IDS } from '../constants';
import { stringToArray } from '../helpers';
import type { WizardFieldMeta } from './types';
import { ctx } from './helpers';

export const httpProxyUrlSchema = yup
  .string()
  .optional()
  .meta({
    id: 'http_proxy_url',
    labelKey: 'clusterWideProxy.httpLabel',
    helperTextKey: 'clusterWideProxy.httpHelp',
    placeholderKey: 'clusterWideProxy.httpPlaceholder',
    stepId: STEP_IDS.CLUSTER_WIDE_PROXY,
    fieldType: 'text',
    resetsFieldsToDefaultOnChange: ['no_proxy_domains'],
  } satisfies WizardFieldMeta)
  .test('http-proxy-url', '', function (value) {
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
    id: 'https_proxy_url',
    labelKey: 'clusterWideProxy.httpsLabel',
    helperTextKey: 'clusterWideProxy.httpsHelp',
    placeholderKey: 'clusterWideProxy.httpsPlaceholder',
    stepId: STEP_IDS.CLUSTER_WIDE_PROXY,
    fieldType: 'text',
    resetsFieldsToDefaultOnChange: ['no_proxy_domains'],
  } satisfies WizardFieldMeta)
  .test('https-proxy-url', '', function (value) {
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
  .meta({
    id: 'no_proxy_domains',
    labelKey: 'clusterWideProxy.noProxyLabel',
    helperTextKey: 'clusterWideProxy.noProxyHelp',
    placeholderKey: 'clusterWideProxy.noProxyPlaceholder',
    stepId: STEP_IDS.CLUSTER_WIDE_PROXY,
    fieldType: 'text',
  } satisfies WizardFieldMeta)
  .test('no-proxy-domains', '', function (value) {
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
    id: 'additional_trust_bundle',
    labelKey: 'clusterWideProxy.trustBundleLabel',
    stepId: STEP_IDS.CLUSTER_WIDE_PROXY,
    fieldType: 'textarea',
    collapseOnRequired: true,
  } satisfies WizardFieldMeta)
  .test('trust-bundle', '', function (value) {
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
