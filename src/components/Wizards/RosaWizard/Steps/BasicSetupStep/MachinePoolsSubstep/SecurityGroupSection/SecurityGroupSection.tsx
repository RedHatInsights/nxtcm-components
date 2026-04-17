import { useEffect, useRef, useState, useCallback } from 'react';
import { ExpandableSection } from '@patternfly/react-core';

import EditSecurityGroups from './EditSecurityGroups';
import SecurityGroupsEmptyAlert from './SecurityGroupsEmptyAlert';
import SecurityGroupsNoEditAlert from './SecurityGroupsNoEditAlert';
import { showSecurityGroupsSection } from '../../../../helpers';
import { CloudVpc, Resource, VPC } from '../../../../../types';
import { useRosaWizardStrings } from '../../../../RosaWizardStringsContext';
import { FieldWithAPIErrorAlert } from '../../../../common/FieldWithAPIErrorAlert';
import { useRosaForm } from '../../../../RosaFormContext';
import { useStore } from '@tanstack/react-form';

/** Inputs for worker security group selection scoped to the chosen VPC and cluster version. */
type SecurityGroupsSectionProps = {
  selectedVPC: CloudVpc | undefined;
  clusterVersion: string;
  vpcList: Resource<VPC[]>;
  refreshVPCs?: () => void;
};

/**
 * Expandable section to attach additional worker security groups when supported.
 * Clears selections when the VPC changes and surfaces empty-state or version incompatibility messaging.
 */
export const SecurityGroupsSection = ({
  selectedVPC,
  clusterVersion,
  vpcList,
  refreshVPCs,
}: SecurityGroupsSectionProps) => {
  const { machinePools, securityGroups } = useRosaWizardStrings();
  const form = useRosaForm();
  const selectedGroupIds: string[] =
    useStore(form.store, (s) => s.values.cluster.security_groups_worker) ?? [];

  /** Persists the worker security group id list on the ROSA wizard form. */
  const setSelectedGroupIds = useCallback(
    (ids: string[]) => {
      form.setFieldValue('cluster.security_groups_worker', ids);
    },
    [form]
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
