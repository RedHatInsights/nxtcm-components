import { Content, ContentVariants, ExpandableSection } from '@patternfly/react-core';

import type { CloudVpc, ClusterFormData } from '../../../../types';
import { Radio } from '../../../components/Fields/RadioGroup';
import { WizNumberInput, WizRadioGroup } from '../../../components/WizFields';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { clusterValidationSchema } from '../../../yupSchemas';
import EditSecurityGroups from './SecurityGroupSection/EditSecurityGroups';
import { VpcListResource } from '../../../types';

export interface MachinePoolsAdvancedSectionProps {
  /** When true, IMDS options are disabled (unsupported cluster version). */
  wrongVersionForIMDS: boolean;
  /** Max root volume size (GiB) from the selected OpenShift version. */
  maxRootDiskSize: number;
  clusterVersion: string;
  selectedVPC: CloudVpc | undefined;
  vpcList: VpcListResource;
  refreshVPCs?: () => void;
}

export const MachinePoolsAdvancedSection = (props: MachinePoolsAdvancedSectionProps) => {
  const {
    wrongVersionForIMDS,
    maxRootDiskSize,
    clusterVersion,
    selectedVPC,
    vpcList,
    refreshVPCs,
  } = props;
  const mp = useRosaHcpWizardStrings().machinePools;

  return (
    <ExpandableSection toggleText={mp.advancedToggle} isIndented>
      <WizRadioGroup<Partial<ClusterFormData>>
        name="imds"
        schema={clusterValidationSchema}
        label={mp.imdsLabel}
        isDisabled={wrongVersionForIMDS}
        labelHelpTitle={mp.imdsHelpTitle}
        labelHelp={<Content component={ContentVariants.p}>{mp.imdsHelpP1}</Content>}
      >
        <Radio
          id="cluster-metadata-service-imdsv1-imdsv2-btn"
          label={mp.imdsBothLabel}
          value="imdsv1andimdsv2"
          description={mp.imdsBothDescription}
        />
        <Radio
          id="cluster-metadata-service-imdsv2-only-btn"
          label={mp.imdsV2Label}
          value="imdsv2only"
          description={mp.imdsV2Description}
        />
      </WizRadioGroup>

      <div className="pf-v6-u-mt-md">
        <WizNumberInput<Partial<ClusterFormData>>
          name="compute_root_volume"
          schema={clusterValidationSchema}
          min={75}
          max={maxRootDiskSize}
        />
      </div>
      <div className="pf-v6-u-mt-md">
        <EditSecurityGroups
          selectedVPC={selectedVPC}
          isReadOnly={false}
          apiError={vpcList?.error}
          refreshVPCCallback={refreshVPCs}
          isVPCLoading={vpcList?.isFetching}
          clusterVersion={clusterVersion}
        />
      </div>
    </ExpandableSection>
  );
};
