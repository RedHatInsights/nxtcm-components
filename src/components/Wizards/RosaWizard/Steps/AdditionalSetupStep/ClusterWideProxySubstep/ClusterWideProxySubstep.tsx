import {
  Alert,
  Content,
  ContentVariants,
  FormSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  checkNoProxyDomains,
  composeValidators,
  validateCA,
  validateUrl,
} from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';
import { useClusterValues, useRosaForm } from '../../../RosaFormContext';
import { FormTextInput, FormFileUpload } from '../../../../../../TanstackForm';

/**
 * Collects optional HTTP/HTTPS proxy URLs, no-proxy domains, and an additional CA trust bundle,
 * with validation that at least one proxy-related field is set when configuring the cluster proxy.
 */
export const ClusterWideProxySubstep = (): JSX.Element => {
  const cw = useRosaWizardStrings().clusterWideProxy;
  const v = useRosaWizardValidators();
  const form = useRosaForm();
  const cluster = useClusterValues();

  /** Ensures the user provided at least one of HTTP proxy, HTTPS proxy, or trust bundle before saving. */
  const validateAtLeastOne = (): string | undefined => {
    if (!cluster.http_proxy_url && !cluster.https_proxy_url && !cluster.additional_trust_bundle) {
      return v.proxyConfigureAtLeastOne;
    }
    return undefined;
  };

  /** Validates the HTTP proxy field as an `http` URL using shared wizard URL messages. */
  const validateUrlHttp = (value: string): string | undefined => validateUrl(value, 'http', v.url);
  /** Validates the HTTPS proxy field as an `http` or `https` URL using shared wizard URL messages. */
  const validateUrlHttps = (value: string): string | undefined =>
    validateUrl(value, ['http', 'https'], v.url);

  return (
    <FormSection id="cluster-wide-proxy-section-id" title={cw.sectionLabel}>
      <Content component={ContentVariants.p}>{cw.intro}</Content>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>{cw.learnMoreLink}</ExternalLink>
      <Alert variant="info" isInline isPlain title={cw.alertConfigureFields} />
      <Stack hasGutter>
        <StackItem>
          <form.Field
            name="cluster.http_proxy_url"
            validators={{
              onBlur: ({ value }) =>
                composeValidators(validateUrlHttp, validateAtLeastOne)(value as string) ||
                undefined,
            }}
          >
            {(field) => (
              <FormTextInput field={field} label={cw.httpLabel} helperText={cw.httpHelp} />
            )}
          </form.Field>
        </StackItem>
        <StackItem>
          <form.Field
            name="cluster.https_proxy_url"
            validators={{
              onBlur: ({ value }) =>
                composeValidators(validateUrlHttps, validateAtLeastOne)(value as string) ||
                undefined,
            }}
          >
            {(field) => (
              <FormTextInput field={field} label={cw.httpsLabel} helperText={cw.httpsHelp} />
            )}
          </form.Field>
        </StackItem>
        <StackItem>
          <form.Field
            name="cluster.no_proxy_domains"
            validators={{
              onBlur: ({ value }) =>
                checkNoProxyDomains(value as string, v.noProxyDomains) || undefined,
            }}
          >
            {(field) => (
              <FormTextInput
                field={field}
                label={cw.noProxyLabel}
                helperText={cw.noProxyHelp}
                isDisabled={!cluster.http_proxy_url && !cluster.https_proxy_url}
              />
            )}
          </form.Field>
        </StackItem>
        <StackItem>
          <form.Field
            name="cluster.additional_trust_bundle"
            validators={{
              onBlur: ({ value }) =>
                composeValidators(
                  (val: string) => validateCA(val, v.ca),
                  () => validateAtLeastOne()
                )(value as string) || undefined,
            }}
          >
            {(field) => <FormFileUpload field={field} label={cw.trustBundleLabel} />}
          </form.Field>
        </StackItem>
      </Stack>
    </FormSection>
  );
};
