import { Section, WizTextInput, WizFileUpload, useItem } from '@patternfly-labs/react-form-wizard';
import { Alert, Content, ContentVariants, Stack, StackItem } from '@patternfly/react-core';
import {
  checkNoProxyDomains,
  composeValidators,
  validateCA,
  validateUrl,
} from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';
import { RosaWizardFormData } from '../../../../types';

export const ClusterWideProxySubstep = () => {
  const cw = useRosaWizardStrings().clusterWideProxy;
  const v = useRosaWizardValidators();
  const { cluster } = useItem<RosaWizardFormData>();

  const validateAtLeastOne = () => {
    if (!cluster.http_proxy_url && !cluster.https_proxy_url && !cluster.additional_trust_bundle) {
      return v.proxyConfigureAtLeastOne;
    }
    return undefined;
  };
  const validateUrlHttp = (value: string) => validateUrl(value, 'http', v.url);
  const validateUrlHttps = (value: string) => validateUrl(value, ['http', 'https'], v.url);

  return (
    <Section
      id="cluster-wide-proxy-section-id"
      key="cluster-wide-proxy-section-key"
      label={cw.sectionLabel}
    >
      <Content component={ContentVariants.p}>{cw.intro}</Content>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>{cw.learnMoreLink}</ExternalLink>
      <Alert variant="info" isInline isPlain title={cw.alertConfigureFields} />
      <Stack hasGutter>
        <StackItem>
          <WizTextInput
            validation={composeValidators(validateUrlHttp, validateAtLeastOne)}
            validateOnBlur
            label={cw.httpLabel}
            helperText={cw.httpHelp}
            path="cluster.http_proxy_url"
          />
        </StackItem>
        <StackItem>
          <WizTextInput
            validation={composeValidators(validateUrlHttps, validateAtLeastOne)}
            validateOnBlur
            label={cw.httpsLabel}
            helperText={cw.httpsHelp}
            path="cluster.https_proxy_url"
          />
        </StackItem>
        <StackItem>
          <WizTextInput
            disabled={!cluster.http_proxy_url && !cluster.https_proxy_url}
            validateOnBlur
            validation={(value) => checkNoProxyDomains(value, v.noProxyDomains)}
            label={cw.noProxyLabel}
            helperText={cw.noProxyHelp}
            path="cluster.no_proxy_domains"
          />
        </StackItem>
        <StackItem>
          <WizFileUpload
            label={cw.trustBundleLabel}
            path="cluster.additional_trust_bundle"
            validation={composeValidators(
              (value: string) => validateCA(value, v.ca),
              () => validateAtLeastOne()
            )}
          />
        </StackItem>
      </Stack>
    </Section>
  );
};
