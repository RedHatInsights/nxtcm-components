import React, { type ReactNode } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import SecurityGroupsViewList from './SecurityGroupsViewList';

import { securityGroupsSort } from './helpers';
import { validateSecurityGroups } from '../../../../validators';
import { truncateTextWithEllipsis } from '../../../../helpers';
import { FormGroupHelperText } from '../../../../components/FormGroupHelperText';
import { WizMultiSelect } from '../../../../components/WizFields';
import { clusterValidationSchema } from '../../../../yupSchemas';
import type { ClusterFormData, CloudVpc } from '../../../../../types';
import {
  useRosaHcpWizardStrings,
  useRosaHcpWizardValidators,
} from '../../../../stringsProvider/RosaHcpWizardStringsContext';
import { useFormContext, useWatch } from 'react-hook-form';

export interface EditSecurityGroupsProps {
  label?: string;
  selectedVPC: CloudVpc;
  isReadOnly: boolean;
  apiError?: ReactNode;
  refreshVPCCallback?: () => void;
  isVPCLoading?: boolean;
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
}: EditSecurityGroupsProps) => {
  const sg = useRosaHcpWizardStrings().securityGroups;
  const v = useRosaHcpWizardValidators();
  const label = labelProp ?? sg.formLabel;
  const { setValue } = useFormContext<Partial<ClusterFormData>>();
  const watchedGroups = useWatch({ name: 'security_groups_worker' });
  const selectedGroupIds = React.useMemo(
    () => (Array.isArray(watchedGroups) ? (watchedGroups as string[]) : EMPTY_GROUP_IDS),
    [watchedGroups]
  );

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

  React.useEffect(() => {
    const newGroupIds = vpcSecurityGroupsSorted.map((g) => g.id || '');
    const newSelectedGroupIds = selectedGroupIds.filter((gId) => newGroupIds.includes(gId));

    const selectionChanged =
      newSelectedGroupIds.length !== selectedGroupIds.length ||
      newSelectedGroupIds.some((id, index) => id !== selectedGroupIds[index]);

    if (selectionChanged) {
      setValue('security_groups_worker', newSelectedGroupIds, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [vpcSecurityGroupsSorted, selectedGroupIds, setValue]);

  if (isReadOnly) {
    return (
      <SecurityGroupsViewList securityGroups={selectedOptions} emptyMessage={sg.readOnlyEmpty} />
    );
  }

  const onDeleteGroup = (deleteGroupId: string) => {
    const next = selectedGroupIds.filter((sgId) => sgId !== deleteGroupId);
    setValue('security_groups_worker', next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const validationError = validateSecurityGroups(selectedGroupIds, v.securityGroups);

  return (
    <>
      <Stack hasGutter className="pf-v6-u-mt-md">
        <StackItem>
          <WizMultiSelect<Partial<ClusterFormData>>
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
        </StackItem>
        <StackItem>
          <SecurityGroupsViewList securityGroups={selectedOptions} onCloseItem={onDeleteGroup} />
        </StackItem>
      </Stack>
      <FormGroupHelperText touched error={validationError} />
    </>
  );
};

export default EditSecurityGroups;
