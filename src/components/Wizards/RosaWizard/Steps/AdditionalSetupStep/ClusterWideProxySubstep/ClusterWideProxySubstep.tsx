import { Alert, Content, ContentVariants, Stack, StackItem } from '@patternfly/react-core';
import { useWatch } from 'react-hook-form';
import {
  checkNoProxyDomains,
  composeValidators,
  validateCA,
  validateUrl,
} from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';
import { RosaFileUpload, RosaSection, RosaTextInput } from '../../../Inputs';

export const ClusterWideProxySubstep = () => {
  const cw = useRosaWizardStrings().clusterWideProxy;
  const v = useRosaWizardValidators();
  const cluster = useWatch({ name: 'cluster' });

  const validateAtLeastOne = () => {
    if (!cluster.http_proxy_url && !cluster.https_proxy_url && !cluster.additional_trust_bundle) {
      return v.proxyConfigureAtLeastOne;
    }
    return undefined;
  };
  const validateUrlHttp = (value: string) => validateUrl(value, 'http', v.url);
  const validateUrlHttps = (value: string) => validateUrl(value, ['http', 'https'], v.url);

  return (
    <RosaSection id="cluster-wide-proxy-section-id" label={cw.sectionLabel}>
      <Content component={ContentVariants.p}>{cw.intro}</Content>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>{cw.learnMoreLink}</ExternalLink>
      <Alert variant="info" isInline isPlain title={cw.alertConfigureFields} />
      <Stack hasGutter>
        <StackItem>
          <RosaTextInput
            validation={composeValidators(validateUrlHttp, validateAtLeastOne)}
            validateOnBlur
            label={cw.httpLabel}
            helperText={cw.httpHelp}
            path="cluster.http_proxy_url"
          />
        </StackItem>
        <StackItem>
          <RosaTextInput
            validation={composeValidators(validateUrlHttps, validateAtLeastOne)}
            validateOnBlur
            label={cw.httpsLabel}
            helperText={cw.httpsHelp}
            path="cluster.https_proxy_url"
          />
        </StackItem>
        <StackItem>
          <RosaTextInput
            disabled={!cluster.http_proxy_url && !cluster.https_proxy_url}
            validateOnBlur
            validation={(value) => checkNoProxyDomains(value, v.noProxyDomains)}
            label={cw.noProxyLabel}
            helperText={cw.noProxyHelp}
            path="cluster.no_proxy_domains"
          />
        </StackItem>
        <StackItem>
          <RosaFileUpload
            label={cw.trustBundleLabel}
            path="cluster.additional_trust_bundle"
            validation={composeValidators(
              (value: string) => validateCA(value, v.ca),
              () => validateAtLeastOne()
            )}
          />
        </StackItem>
      </Stack>
    </RosaSection>
  );
};
