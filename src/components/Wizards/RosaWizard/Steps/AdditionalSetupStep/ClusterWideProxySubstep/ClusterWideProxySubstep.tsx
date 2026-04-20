import {
  Alert,
  Content,
  ContentVariants,
  FormSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { useClusterValues, useRosaForm } from '../../../RosaFormContext';
import { FormTextInput, FormFileUpload } from '../../../../../../TanstackForm';

/**
 * Collects optional HTTP/HTTPS proxy URLs, no-proxy domains, and an additional CA trust bundle,
 * with validation that at least one proxy-related field is set when configuring the cluster proxy.
 */
export const ClusterWideProxySubstep = (): JSX.Element => {
  const cw = useRosaWizardStrings().clusterWideProxy;
  const form = useRosaForm();
  const cluster = useClusterValues();

  return (
    <FormSection id="cluster-wide-proxy-section-id" title={cw.sectionLabel}>
      <Content component={ContentVariants.p}>{cw.intro}</Content>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>{cw.learnMoreLink}</ExternalLink>
      <Alert variant="info" isInline isPlain title={cw.alertConfigureFields} />
      <Stack hasGutter>
        <StackItem>
          <form.Field name="cluster.http_proxy_url">
            {(field) => (
              <FormTextInput field={field} label={cw.httpLabel} helperText={cw.httpHelp} />
            )}
          </form.Field>
        </StackItem>
        <StackItem>
          <form.Field name="cluster.https_proxy_url">
            {(field) => (
              <FormTextInput field={field} label={cw.httpsLabel} helperText={cw.httpsHelp} />
            )}
          </form.Field>
        </StackItem>
        <StackItem>
          <form.Field name="cluster.no_proxy_domains">
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
          <form.Field name="cluster.additional_trust_bundle">
            {(field) => <FormFileUpload field={field} label={cw.trustBundleLabel} />}
          </form.Field>
        </StackItem>
      </Stack>
    </FormSection>
  );
};
