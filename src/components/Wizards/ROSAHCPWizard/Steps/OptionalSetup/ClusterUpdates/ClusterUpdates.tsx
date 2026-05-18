import { Button, Content, ContentVariants, useWizardContext } from '@patternfly/react-core';
import { useWatch } from 'react-hook-form';

import { Section } from '../../../components/Section';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../links';
import { STEP_IDS } from '../../../constants';
import { clusterValidationSchema } from '../../../yupSchemas';
import { WizRadioGroup } from '../../../components/WizFields/WizRadioGroup';
import { Radio } from '../../../components/Fields/RadioGroup';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { ClusterUpgrade, type ROSAHCPCluster } from '../../../types';
import { UpgradeScheduleFields } from './UpgradeScheduleFields';

export const ClusterUpdates = () => {
  const cu = useRosaHcpWizardStrings().clusterUpdates;
  const { goToStepById } = useWizardContext();

  const clusterVersion = useWatch<ROSAHCPCluster, 'cluster_version'>({ name: 'cluster_version' });
  const upgradePolicy = useWatch<ROSAHCPCluster, 'upgrade_policy'>({ name: 'upgrade_policy' });

  return (
    <Section label={cu.sectionLabel}>
      <Content component={ContentVariants.p}>
        {cu.versionIntroPrefix} {clusterVersion} {cu.versionIntroSuffix}{' '}
        <Button onClick={() => goToStepById?.(STEP_IDS.DETAILS)} variant="link" isInline>
          {cu.detailsStepLink}
        </Button>{' '}
        {cu.midSentence}{' '}
        <Button onClick={() => goToStepById?.(STEP_IDS.NETWORKING)} variant="link" isInline>
          {cu.networkingStepLink}
        </Button>{' '}
        {cu.afterCreation}
      </Content>
      <Content component={ContentVariants.p}>
        {cu.cveLead}{' '}
        <ExternalLink href={links.SECURITY_CLASSIFICATION_CRITICAL}>
          {cu.criticalConcernsLink}
        </ExternalLink>{' '}
        {cu.cveTail}
      </Content>

      <WizRadioGroup<ROSAHCPCluster>
        name="upgrade_policy"
        schema={clusterValidationSchema}
        label=""
      >
        <Radio
          id="cluster-upgrade-strategy-individual-radio-btn"
          label={cu.individualLabel}
          value={ClusterUpgrade.manual}
          description={
            <>
              {cu.individualDescriptionLead}{' '}
              <ExternalLink href={links.ROSA_LIFE_CYCLE}>{cu.lifecycleLink}</ExternalLink>
            </>
          }
        />
        <Radio
          id="cluster-upgrade-strategy-recurring-radio-btn"
          label={cu.recurringLabel}
          value={ClusterUpgrade.automatic}
          description={
            <>
              {cu.recurringDescriptionBeforeZStream}
              <ExternalLink href={links.ROSA_Z_STREAM}>{cu.zStreamLinkText}</ExternalLink>
              {cu.recurringDescriptionAfterZStream}
            </>
          }
        />
      </WizRadioGroup>

      {upgradePolicy === ClusterUpgrade.automatic && <UpgradeScheduleFields />}
    </Section>
  );
};
