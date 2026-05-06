import { Alert, Content, ContentVariants, Stack, StackItem } from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import {
  useRosaHcpWizardStrings,
  //useRosaHcpWizardValidators,
} from '../../../stringsProvider/RosaHcpWizardStringsContext';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';

export const ClusterWideProxy = () => {
  const cw = useRosaHcpWizardStrings().clusterWideProxy;
  // const v = useRosaHcpWizardValidators();

  return (
    <Section label={cw.sectionLabel}>
      <Content component={ContentVariants.p}>{cw.intro}</Content>
      <ExternalLink href={links.CONFIGURE_PROXY_URL}>{cw.learnMoreLink}</ExternalLink>
      <Alert variant="info" isInline isPlain title={cw.alertConfigureFields} />
      <Stack hasGutter>
        <StackItem>http_proxy_url</StackItem>
        <StackItem>https_proxy_url</StackItem>
        <StackItem>no_proxy_domains</StackItem>

        <StackItem>additiona_trust)bundle</StackItem>
      </Stack>
    </Section>
  );
};
