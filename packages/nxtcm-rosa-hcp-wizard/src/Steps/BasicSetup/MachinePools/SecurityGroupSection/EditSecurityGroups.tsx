import React, { type ReactNode } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import SecurityGroupsViewList from './SecurityGroupsViewList';

import { securityGroupsSort } from './helpers';
import { showSecurityGroupsSection, truncateTextWithEllipsis } from '../../../../helpers';
import { WizMultiSelect } from '../../../../components/WizFields';
import { clusterValidationSchema } from '../../../../yupSchemas';
import type { CloudVpc, ROSAHCPCluster } from '../../../../types';
import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';
import { useFormContext, useWatch } from 'react-hook-form';
import SecurityGroupsNoEditAlert from './SecurityGroupsNoEditAlert';
import SecurityGroupsEmptyAlert from './SecurityGroupsEmptyAlert';

export interface EditSecurityGroupsProps {
  label?: string;
  selectedVPC: CloudVpc | undefined;
  isReadOnly: boolean;
  apiError?: ReactNode;
  refreshVPCCallback?: () => void;
  isVPCLoading?: boolean;
  clusterVersion: string;
}

const EMPTY_GROUP_IDS: string[] = [];

const getDisplayName = (securityGroupName: string) => {
  if (securityGroupName) {
    const maxVisibleLength = 50;
    const displayName = truncateTextWithEllipsis(securityGroupName, maxVisibleLength);
    return { displayName, isCut: securityGroupName.length > maxVisibleLength };
  }
  return { displayName: '--', isCut: false };
};

const EditSecurityGroups = ({
  label: labelProp,
  selectedVPC,
  isReadOnly,
  apiError,
  refreshVPCCallback,
  isVPCLoading,
  clusterVersion,
}: EditSecurityGroupsProps) => {
  const sg = useRosaHcpWizardStrings().securityGroups;

  const label = labelProp ?? sg.formLabel;
  const { setValue } = useFormContext<Partial<ROSAHCPCluster>>();
  const watchedGroups = useWatch({ name: 'security_groups_worker' });
  const selectedGroupIds = React.useMemo(
    () => (Array.isArray(watchedGroups) ? (watchedGroups as string[]) : EMPTY_GROUP_IDS),
    [watchedGroups]
  );

  const showEmptyAlert = (selectedVPC?.aws_security_groups || []).length === 0;
  const incompatibleClusterVersionMessage = sg.incompatibleVersion;

  const vpcSecurityGroupsSorted = React.useMemo(() => {
    const list = [...(selectedVPC?.aws_security_groups || [])];
    list.sort(securityGroupsSort);
    return list;
  }, [selectedVPC?.aws_security_groups]);

  const options = React.useMemo(
    () =>
      vpcSecurityGroupsSorted.map(({ id = '', name = '' }) => {
        const { displayName, isCut } = getDisplayName(name);
        return {
          id,
          label: displayName,
          description: id,
          value: id,
          ...(isCut ? { title: name } : {}),
        };
      }),
    [vpcSecurityGroupsSorted]
  );

  const selectedOptions = vpcSecurityGroupsSorted.filter((s) =>
    selectedGroupIds?.includes(s.id || '')
  );

  if (isReadOnly) {
    return (
      <SecurityGroupsViewList securityGroups={selectedOptions} emptyMessage={sg.readOnlyEmpty} />
    );
  }
  const incompatibleClusterVersion = !showSecurityGroupsSection(clusterVersion);
  if (!selectedVPC?.id) {
    return null;
  }

  const onDeleteGroup = (deleteGroupId: string) => {
    const next = selectedGroupIds.filter((sgId) => sgId !== deleteGroupId);
    setValue('security_groups_worker', next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  if (showEmptyAlert && !apiError) {
    return <SecurityGroupsEmptyAlert refreshVPCCallback={refreshVPCCallback} />;
  }

  return (
    <>
      <Stack hasGutter className="pf-v6-u-mt-md">
        <StackItem>
          {incompatibleClusterVersion ? (
            <div>{incompatibleClusterVersionMessage}</div>
          ) : (
            <WizMultiSelect<ROSAHCPCluster>
              name="security_groups_worker"
              schema={clusterValidationSchema}
              label={label}
              placeholder={sg.selectToggle}
              menuToggleAriaLabel={sg.optionsMenuAria}
              badgeScreenReaderText={sg.badgeSrText}
              options={options}
              maxMenuHeight="300px"
              data-testid="securitygroups-id"
              apiError={apiError}
              isLoading={isVPCLoading}
              onRefresh={refreshVPCCallback}
            />
          )}
        </StackItem>
        <StackItem>
          <SecurityGroupsViewList securityGroups={selectedOptions} onCloseItem={onDeleteGroup} />
        </StackItem>
        {!incompatibleClusterVersion ? <SecurityGroupsNoEditAlert /> : null}
      </Stack>
    </>
  );
};

export default EditSecurityGroups;
