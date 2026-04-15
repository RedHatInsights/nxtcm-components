import { Alert, Content, ContentVariants, Stack, StackItem } from '@patternfly/react-core';
import { useWatch } from 'react-hook-form';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { RosaFileUpload, RosaSection, RosaTextInput } from '../../../Inputs';

export const ClusterWideProxySubstep = () => {
  const cw = useRosaWizardStrings().clusterWideProxy;
  const cluster = useWatch({ name: 'cluster' });

  return (
    <RosaSection id="cluster-wide-proxy-section-id" label={cw.sectionLabel}>
      <Content component={ContentVariants.p}>{cw.intro}</Content>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>{cw.learnMoreLink}</ExternalLink>
      <Alert variant="info" isInline isPlain title={cw.alertConfigureFields} />
      <Stack hasGutter>
        <StackItem>
          <RosaTextInput
            validateOnBlur
            label={cw.httpLabel}
            helperText={cw.httpHelp}
            path="cluster.http_proxy_url"
          />
        </StackItem>
        <StackItem>
          <RosaTextInput
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
            label={cw.noProxyLabel}
            helperText={cw.noProxyHelp}
            path="cluster.no_proxy_domains"
          />
        </StackItem>
        <StackItem>
          <RosaFileUpload label={cw.trustBundleLabel} path="cluster.additional_trust_bundle" />
        </StackItem>
      </Stack>
    </RosaSection>
  );
};
