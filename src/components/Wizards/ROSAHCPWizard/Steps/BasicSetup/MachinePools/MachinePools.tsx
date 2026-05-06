import {
  Content,
  ContentVariants,
  ExpandableSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import {
  useRosaHcpWizardStrings,
  //useRosaHcpWizardValidators,
} from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../components/FieldWithAPIErrorAlert';
import { SecurityGroupsSection } from './SecurityGroupSection/SecurityGroupSection';

export const MachinePools = () => {
  const mp = useRosaHcpWizardStrings().machinePools;
  // const v = useRosaHcpWizardValidators();

  return (
    <>
      <Section label={mp.sectionLabel} id="machine-pools-section">
        <Content component={ContentVariants.p}>{mp.intro}</Content>
        <Grid>
          <GridItem span={5}>
            <FieldWithAPIErrorAlert error={''} isFetching={false} fieldName={mp.vpcLabel}>
              selected_vpc
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>

        <Grid hasGutter>
          <GridItem span={8}>
            <FieldWithAPIErrorAlert error={''} isFetching={false} fieldName={mp.subnetLabel}>
              machine_pools_subnets
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>
      </Section>

      <Section label={mp.settingsSectionLabel}>
        <Content component={ContentVariants.p}>{mp.settingsIntro}</Content>
        <Grid>
          <GridItem span={5}>
            <FieldWithAPIErrorAlert error={''} isFetching={false} fieldName={mp.instanceTypeLabel}>
              machine_type
            </FieldWithAPIErrorAlert>
          </GridItem>
        </Grid>
        autoscaling_field
      </Section>

      <ExpandableSection toggleText={mp.advancedToggle} isIndented>
        imds compute_root_volume
      </ExpandableSection>

      <SecurityGroupsSection
        clusterVersion={'4.16'}
        selectedVPC={undefined}
        vpcList={[]}
        refreshVPCs={undefined}
      />
    </>
  );
};
