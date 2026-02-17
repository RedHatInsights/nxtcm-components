import { Section, WizTextInput, WizFileUpload, useItem } from '@patternfly-labs/react-form-wizard';
import { Alert, Content, ContentVariants } from '@patternfly/react-core';
import { useTranslation } from '../../../../../../context/TranslationContext';
import {
  checkNoProxyDomains,
  composeValidators,
  validateCA,
  validateUrl,
} from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';

export const ClusterWideProxySubstep = () => {
  const { t } = useTranslation();
  const { cluster } = useItem();

  const validateAtLeastOne = () => {
    if (!cluster.http_proxy_url && !cluster.https_proxy_url && !cluster.additional_trust_bundle) {
      return 'Configure at least one of the cluster-wide proxy fields.';
    }
    return undefined;
  };
  const validateUrlHttp = (value: string) => validateUrl(value, 'http');
  const validateUrlHttps = (value: string) => validateUrl(value, ['http', 'https']);

  return (
    <Section
      id="cluster-wide-proxy-section-id"
      key="cluster-wide-proxy-section-key"
      label={t('Cluster-wide proxy')}
    >
      <Content component={ContentVariants.p}>
        {t(
          'Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster.'
        )}
      </Content>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>
        Learn more about configuring a cluster-wide proxy
      </ExternalLink>
      <Alert
        variant="info"
        isInline
        isPlain
        title={t('Configure at least 1 of the following fields:')}
      />
      <WizTextInput
        validation={composeValidators(validateUrlHttp, validateAtLeastOne)}
        validateOnBlur
        label={t('HTTP proxy URL')}
        helperText={t('Specify a proxy URL to use for HTTP connections outside the cluster.')}
        path="cluster.http_proxy_url"
        placeholder="http://<user>:<password>@<ipaddr>:<port>"
      />
      <WizTextInput
        validation={composeValidators(validateUrlHttps, validateAtLeastOne)}
        validateOnBlur
        label={t('HTTPS proxy URL')}
        helperText={t('Specify a proxy URL to use for HTTPS connections outside the cluster.')}
        path="cluster.https_proxy_url"
        placeholder="https://<user>:<password>@<ipaddr>:<port>"
      />
      <WizTextInput
        disabled={!cluster.http_proxy_url && !cluster.https_proxy_url}
        validateOnBlur
        validation={(value) => checkNoProxyDomains(value)}
        label={t('No Proxy domains')}
        helperText={t(
          'Preface a domain with . to match subdomains only. For example, .y.com matches x.y.com, but not y.com. Use * to bypass proxy for all destinations.'
        )}
        path="cluster.no_proxy_domains"
        placeholder="HTTP/HTTPS URL must be provided in order to use No proxy domain"
      />

      <WizFileUpload
        label={t('Additional trust bundle')}
        path="cluster.additional_trust_bundle"
        validation={composeValidators(validateCA, validateAtLeastOne)}
        placeholder={`----BEGIN CERTIFICATE----
                      '<MY_TRUSTED_CA_CERT>'
                      ----END CERTIFICATE---
        `}
      />
    </Section>
  );
};
