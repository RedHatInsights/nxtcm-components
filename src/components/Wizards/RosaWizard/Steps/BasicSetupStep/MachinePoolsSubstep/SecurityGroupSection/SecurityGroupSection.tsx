import { useEffect, useRef, useState } from 'react';
import { ExpandableSection } from '@patternfly/react-core';
import { useValue } from '@patternfly-labs/react-form-wizard/inputs/Input';

import EditSecurityGroups from './EditSecurityGroups';
import SecurityGroupsEmptyAlert from './SecurityGroupsEmptyAlert';
import SecurityGroupsNoEditAlert from './SecurityGroupsNoEditAlert';
import { showSecurityGroupsSection } from '../../../../helpers';
import { CloudVpc, Resource, VPC } from '../../../../../types';
import { useRosaWizardStrings } from '../../../../RosaWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../../common/FieldWithAPIErrorAlert';

export const SecurityGroupsSection = ({
  selectedVPC,
  clusterVersion,
  vpcList,
  refreshVPCs,
}: {
  selectedVPC: CloudVpc | undefined;
  clusterVersion: string;
  vpcList: Resource<VPC[]>;
  refreshVPCs?: () => void;
}) => {
  const { machinePools, securityGroups } = useRosaWizardStrings();
  const [selectedGroupIds, setSelectedGroupIds] = useValue(
    { path: 'cluster.security_groups_worker' },
    []
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const incompatibleClusterVersion = !showSecurityGroupsSection(clusterVersion);

  const prevVpcId = useRef(selectedVPC?.id);
  useEffect(() => {
    if (prevVpcId.current !== undefined && prevVpcId.current !== selectedVPC?.id) {
      setSelectedGroupIds([]);
    }
    prevVpcId.current = selectedVPC?.id;
  }, [selectedVPC?.id, setSelectedGroupIds]);

  if (!selectedVPC?.id) {
    return null;
  }

  const showEmptyAlert = (selectedVPC?.aws_security_groups || []).length === 0;
  const incompatibleClusterVersionMessage = securityGroups.incompatibleVersion;

  return (
    <ExpandableSection
      toggleText={machinePools.securityGroupsToggle}
      isExpanded={isExpanded}
      isIndented
      onToggle={() => setIsExpanded(!isExpanded)}
    >
      {incompatibleClusterVersion && <div>{incompatibleClusterVersionMessage}</div>}
      {!incompatibleClusterVersion && (
        <>
          <FieldWithAPIErrorAlert
            error={vpcList.error}
            isFetching={vpcList.isFetching}
            fieldName={securityGroups.formLabel}
            retry={vpcList.fetch ? () => void vpcList.fetch?.() : undefined}
          >
            {showEmptyAlert && !vpcList.error && (
              <SecurityGroupsEmptyAlert refreshVPCCallback={refreshVPCs} />
            )}
            {!showEmptyAlert && (
              <>
                <EditSecurityGroups
                  selectedVPC={selectedVPC}
                  selectedGroupIds={selectedGroupIds ?? []}
                  onChange={setSelectedGroupIds}
                  isReadOnly={false}
                  refreshVPCCallback={refreshVPCs}
                />
              </>
            )}
          </FieldWithAPIErrorAlert>

          {!showEmptyAlert && <SecurityGroupsNoEditAlert />}
        </>
      )}
    </ExpandableSection>
  );
};
