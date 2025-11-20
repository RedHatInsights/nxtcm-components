import { Section, WizRadioGroup, Radio } from '@patternfly-labs/react-form-wizard';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useTranslation } from '../../../../../../context/TranslationContext';

export const ClusterUpdatesSubstep = () => {
  const { t } = useTranslation();
  return (
    <Section
      id="cluster-updates-substep-section"
      key="cluster-updates-substep-section-key"
      label={t('Cluster update strategy')}
    >
      <Content component={ContentVariants.p}>
        {t(`The OpenShift version [4.14.6] that you selected in the &quot;HERE GOES LINK: Details
        step&quot; will apply to the managed control plane and the machine pools configured in the
        &quot;HERE GOES LINK: Networking and subnets step&quot;. After cluster creation, you can
        update the managed control plane and machine pools independently.`)}
      </Content>

      <Content component={ContentVariants.p}>
        {t(`In the event of &quot;HERE GOES LINK WITH EXTERNAL ICON: Critical security concerns&quot;
        (CVEs) that significantly impact the security or stability of the cluster, updates may be
        automatically scheduled by Red Hat SRE to the latest z-stream version not impacted by the
        CVE within 2 business days after customer notifications.`)}
      </Content>

      <WizRadioGroup path="cluster.upgrade_policy">
        <Radio
          id="cluster-upgrade-strategy-individual-radio-btn"
          label={t('Individual updates')}
          value="automatic"
          description={t(
            'Schedule each update individually. When planning updates, make sure to consider the end of life dates from the {HERE GOES LINK WITH EXTERNAL ICON: lifecycle policy'
          )}
        />
        <Radio
          id="cluster-upgrade-strategy-recurring-radio-btn"
          label={t('Recurring updates')}
          value="manual"
          description={t(
            "The cluster control plan will be automatically updated based on your preferred day and start time when new patch updates ({HERE GOES LINK WITH EXTERNAL ICON: z-stream}) are available. When a new minor version is available, you'll be notified and must manually allow the cluster to update the next minor version. The compute nodes will need to be manually updated."
          )}
        />
      </WizRadioGroup>
    </Section>
  );
};
