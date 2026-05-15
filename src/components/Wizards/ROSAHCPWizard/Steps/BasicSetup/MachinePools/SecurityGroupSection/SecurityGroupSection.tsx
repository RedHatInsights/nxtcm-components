import React from 'react';
import { ExpandableSection, Form } from '@patternfly/react-core';

import type { CloudVpc, VpcListResource } from '../../../../types';
import EditSecurityGroups from './EditSecurityGroups';
import SecurityGroupsEmptyAlert from './SecurityGroupsEmptyAlert';
import SecurityGroupsNoEditAlert from './SecurityGroupsNoEditAlert';
import { showSecurityGroupsSection } from '../../../../helpers';
import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../../components/FieldWithAPIErrorAlert';

export const SecurityGroupsSection = ({
  selectedVPC,
  clusterVersion,
  vpcList,
  refreshVPCs,
}: {
  selectedVPC: CloudVpc | undefined;
  clusterVersion: string;
  vpcList: VpcListResource;
  refreshVPCs?: () => void;
}) => {
  const { machinePools, securityGroups } = useRosaHcpWizardStrings();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const incompatibleClusterVersion = !showSecurityGroupsSection(clusterVersion);

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
        <Form onSubmit={(e) => e.preventDefault()}>
          {showEmptyAlert && !vpcList.error && (
            <SecurityGroupsEmptyAlert refreshVPCCallback={refreshVPCs} />
          )}
          {showEmptyAlert && !!vpcList.error && (
            <FieldWithAPIErrorAlert
              error={vpcList.error}
              isFetching={vpcList.isFetching}
              fieldName={securityGroups.formLabel}
              retry={vpcList.fetch ? () => void vpcList.fetch?.() : undefined}
            />
          )}
          {!showEmptyAlert && (
            <EditSecurityGroups
              selectedVPC={selectedVPC}
              isReadOnly={false}
              apiError={vpcList.error}
              refreshVPCCallback={refreshVPCs}
              isVPCLoading={vpcList.isFetching}
            />
          )}

          {!showEmptyAlert && <SecurityGroupsNoEditAlert />}
        </Form>
      )}
    </ExpandableSection>
  );
};
