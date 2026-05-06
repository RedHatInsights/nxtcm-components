import {
  Alert,
  Content,
  ContentVariants,
  ExpandableSection,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import {
  useRosaHcpWizardStrings,
  //useRosaHcpWizardValidators,
} from '../../../stringsProvider/RosaHcpWizardStringsContext';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';

export const Networking = () => {
  const { networking: n } = useRosaHcpWizardStrings();
  // const v = useRosaHcpWizardValidators();
  return (
    <>
      <Section label={n.sectionLabel}>
        <Grid>
          <GridItem span={7}>cluster_privacy</GridItem>
        </Grid>
      </Section>

      <ExpandableSection isIndented toggleText={n.advancedToggle}>
        <Stack>
          <StackItem>cluster_wide_proxy</StackItem>
        </Stack>
        <Alert isExpandable variant="warning" title={n.cidrAlertTitle} ouiaId="networkingCidrAlert">
          <Content component={ContentVariants.p}>{n.cidrAlertBody}</Content>

          <Content component={ContentVariants.p}>
            <ExternalLink href={links.CIDR_RANGE_DEFINITIONS_ROSA}>
              {n.cidrLearnMoreLink}
            </ExternalLink>
          </Content>
        </Alert>
        cidr_default
        <Stack hasGutter>
          <StackItem>network_machine_cidr</StackItem>
          <StackItem>network_service_cidr</StackItem>
          <StackItem>network_pod_cidr</StackItem>

          <StackItem>network_host_prefix</StackItem>
        </Stack>
      </ExpandableSection>
    </>
  );
};
