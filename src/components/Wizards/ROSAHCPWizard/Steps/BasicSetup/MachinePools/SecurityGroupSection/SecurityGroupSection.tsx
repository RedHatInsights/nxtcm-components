import { useEffect, useRef } from 'react';
import { ExpandableSection } from '@patternfly/react-core';

import EditSecurityGroups from './EditSecurityGroups';
import SecurityGroupsEmptyAlert from './SecurityGroupsEmptyAlert';
import SecurityGroupsNoEditAlert from './SecurityGroupsNoEditAlert';
import { showSecurityGroupsSection } from '../../../../helpers';
import { CloudVpc } from '../../../../../types';
import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../../components/FieldWithAPIErrorAlert';
import React from 'react';

export const SecurityGroupsSection = ({
  selectedVPC,
  clusterVersion,
  vpcList,
  refreshVPCs,
}: {
  selectedVPC: CloudVpc | undefined;
  clusterVersion: string;
  vpcList: any;
  //vpcList: Resource<VPC[]>;
  refreshVPCs?: () => void;
}) => {
  const { machinePools, securityGroups } = useRosaHcpWizardStrings();
  //Has to be replaced with react-hook-form
  // const [selectedGroupIds, setSelectedGroupIds] = useValue(
  //   { path: 'cluster.security_groups_worker' },
  //   []
  // );

  const [isExpanded, setIsExpanded] = React.useState(false);
  const incompatibleClusterVersion = !showSecurityGroupsSection(clusterVersion);

  const prevVpcId = useRef(selectedVPC?.id);
  useEffect(() => {
    if (prevVpcId.current !== undefined && prevVpcId.current !== selectedVPC?.id) {
      //setSelectedGroupIds([]);
    }
    prevVpcId.current = selectedVPC?.id;
  }, [selectedVPC?.id]);

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
                  selectedGroupIds={[]}
                  onChange={() => {}}
                  isReadOnly={false}
                  refreshVPCCallback={refreshVPCs}
                  isVPCLoading={vpcList.isFetching}
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
