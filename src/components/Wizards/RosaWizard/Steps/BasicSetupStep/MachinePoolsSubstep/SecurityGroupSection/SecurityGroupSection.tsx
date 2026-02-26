import { useEffect, useRef, useState } from 'react';
import { ExpandableSection } from '@patternfly/react-core';
import { useValue } from '@patternfly-labs/react-form-wizard/inputs/Input';

import { CloudVpc } from './types';
import EditSecurityGroups from './EditSecurityGroups';
import SecurityGroupsEmptyAlert from './SecurityGroupsEmptyAlert';
import SecurityGroupsNoEditAlert from './SecurityGroupsNoEditAlert';

export const SecurityGroupsSection = ({
  selectedVPC,
  refreshVPCs,
}: {
  selectedVPC: CloudVpc;
  refreshVPCs?: () => void;
}) => {
  const [selectedGroupIds, setSelectedGroupIds] = useValue(
    { path: 'cluster.security_groups_worker' },
    []
  );

  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <ExpandableSection
      toggleText="Additional security groups"
      isExpanded={isExpanded}
      isIndented
      onToggle={() => setIsExpanded(!isExpanded)}
    >
      {showEmptyAlert && <SecurityGroupsEmptyAlert refreshVPCCallback={refreshVPCs} />}
      {!showEmptyAlert && (
        <>
          <SecurityGroupsNoEditAlert />
          <br />
          <EditSecurityGroups
            selectedVPC={selectedVPC}
            selectedGroupIds={selectedGroupIds ?? []}
            onChange={setSelectedGroupIds}
            isReadOnly={false}
            refreshVPCCallback={refreshVPCs}
          />
        </>
      )}
    </ExpandableSection>
  );
};
