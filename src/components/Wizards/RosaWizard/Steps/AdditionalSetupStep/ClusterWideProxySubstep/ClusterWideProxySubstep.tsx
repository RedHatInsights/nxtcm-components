import { Section, WizTextInput, WizFileUpload, useItem } from '@patternfly-labs/react-form-wizard';
import { Alert, Content, ContentVariants, Grid, GridItem } from '@patternfly/react-core';
import {
  checkNoProxyDomains,
  composeValidators,
  validateCA,
  validateUrl,
} from '../../../validators';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';
import { RosaWizardFormData } from '@/components/Wizards/types';

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
      <Grid>
        <GridItem span={7}>
          <WizTextInput
            validation={composeValidators(validateUrlHttp, validateAtLeastOne)}
            validateOnBlur
            label={cw.httpLabel}
            helperText={cw.httpHelp}
            path="cluster.http_proxy_url"
          />
        </GridItem>
        <GridItem span={7}>
          <WizTextInput
            validation={composeValidators(validateUrlHttps, validateAtLeastOne)}
            validateOnBlur
            label={cw.httpsLabel}
            helperText={cw.httpsHelp}
            path="cluster.https_proxy_url"
          />
        </GridItem>
        <GridItem span={7}>
          <WizTextInput
            disabled={!cluster.http_proxy_url && !cluster.https_proxy_url}
            validateOnBlur
            validation={(value) => checkNoProxyDomains(value, v.noProxyDomains)}
            label={cw.noProxyLabel}
            helperText={cw.noProxyHelp}
            path="cluster.no_proxy_domains"
          />
        </GridItem>
        <GridItem span={7}>
          <WizFileUpload
            label={cw.trustBundleLabel}
            path="cluster.additional_trust_bundle"
            validation={composeValidators(
              (value: string) => validateCA(value, v.ca),
              () => validateAtLeastOne()
            )}
          />
        </GridItem>
      </Grid>
    </Section>
  );
};
