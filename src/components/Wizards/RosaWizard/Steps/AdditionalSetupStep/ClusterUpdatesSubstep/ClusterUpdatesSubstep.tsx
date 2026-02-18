import { Section, WizRadioGroup, Radio } from '@patternfly-labs/react-form-wizard';
import { Button, Content, ContentVariants } from '@patternfly/react-core';
import { useTranslation } from '../../../../../../context/TranslationContext';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';

export const ClusterUpdatesSubstep = (props: any) => {
  const { t } = useTranslation();
  const { value } = useInput(props);
  const { cluster } = value;
  return (
    <Section
      id="cluster-updates-substep-section"
      key="cluster-updates-substep-section-key"
      label={t('Cluster update strategy')}
    >
      <Content component={ContentVariants.p}>
        {t(`The OpenShift version ${cluster.cluster_version} that you selected in the`)}{' '}
        {
          <Button
            onClick={() => props.goToStepId.goToStepById('basic-setup-step-details')}
            variant="link"
            isInline
          >
            {t(`Details step`)}
          </Button>
        }{' '}
        {t('will apply to the managed control plane and the machine pools configured in the')}{' '}
        {
          <Button
            onClick={() => props.goToStepId.goToStepById('networking-sub-step')}
            variant="link"
            isInline
          >
            {t(`Networking and subnets step.`)}
          </Button>
        }{' '}
        {t(`After cluster creation, you can
        update the managed control plane and machine pools independently.`)}
      </Content>

      <Content component={ContentVariants.p}>
        {t('In the event of')}{' '}
        <ExternalLink href={links.SECURITY_CLASSIFICATION_CRITICAL}>
          Critical security concerns
        </ExternalLink>{' '}
        {t(`(CVEs) that significantly impact the security or stability of the cluster, updates may be
        automatically scheduled by Red Hat SRE to the latest z-stream version not impacted by the
        CVE within 2 business days after customer notifications.`)}
      </Content>

      <WizRadioGroup path="cluster.upgrade_policy">
        <Radio
          id="cluster-upgrade-strategy-individual-radio-btn"
          label={t('Individual updates')}
          value="automatic"
          description={
            <>
              {t(
                'Schedule each update individually. When planning updates, make sure to consider the end of life dates from the'
              )}{' '}
              <ExternalLink href={links.ROSA_LIFE_CYCLE}>lifecycle policy</ExternalLink>
            </>
          }
        />
        <Radio
          id="cluster-upgrade-strategy-recurring-radio-btn"
          label={t('Recurring updates')}
          value="manual"
          description={
            <>
              {t(
                `The cluster control plan will be automatically updated based on your preferred day and start time when new patch updates`
              )}{' '}
              <ExternalLink href={links.ROSA_Z_STREAM}>z-stream</ExternalLink>{' '}
              {t(
                `are available. When a new minor version is available, you'll be notified and must manually allow the cluster to update the next minor version. The compute nodes will need to be manually updated.`
              )}
            </>
          }
        />
      </WizRadioGroup>
    </Section>
  );
};
