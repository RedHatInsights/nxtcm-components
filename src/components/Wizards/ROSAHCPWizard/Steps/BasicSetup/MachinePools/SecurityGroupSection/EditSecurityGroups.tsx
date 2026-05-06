import React from 'react';

import {
  Badge,
  Button,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectProps,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import RedoIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import SecurityGroupsViewList from './SecurityGroupsViewList';

import { securityGroupsSort } from './helpers';
import { validateSecurityGroups } from '../../../../validators';
import { truncateTextWithEllipsis } from '../../../../helpers';
import { FormGroupHelperText } from '../../../../components/FormGroupHelperText';
import { CloudVpc } from '../../../../../types';
import {
  useRosaHcpWizardStrings,
  useRosaHcpWizardValidators,
} from '../../../../stringsProvider/RosaHcpWizardStringsContext';

export interface EditSecurityGroupsProps {
  label?: string;
  selectedGroupIds: string[];
  selectedVPC: CloudVpc;
  isReadOnly: boolean;
  onChange: (securityGroupIds: string[]) => void;
  refreshVPCCallback?: () => void;
  isVPCLoading?: boolean;
}

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
  selectedGroupIds = [],
  onChange,
  isReadOnly,
  refreshVPCCallback,
  isVPCLoading,
}: EditSecurityGroupsProps) => {
  const sg = useRosaHcpWizardStrings().securityGroups;
  const v = useRosaHcpWizardValidators();
  const label = labelProp ?? sg.formLabel;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const vpcSecurityGroups = React.useMemo(
    () => selectedVPC?.aws_security_groups || [],
    [selectedVPC?.aws_security_groups]
  );
  const selectedOptions = vpcSecurityGroups.filter((sg) => selectedGroupIds?.includes(sg.id || ''));
  selectedOptions.sort(securityGroupsSort);

  React.useEffect(() => {
    if (vpcSecurityGroups.length > 0) {
      const newGroupIds = vpcSecurityGroups.map((sg) => sg.id || '') || [];
      const newSelectedGroupIds = selectedGroupIds.filter((sg) => newGroupIds.includes(sg));

      if (newSelectedGroupIds.length !== selectedGroupIds.length) {
        onChange(newSelectedGroupIds);
      }
    }
  }, [vpcSecurityGroups, selectedGroupIds, onChange]);

  if (isReadOnly) {
    // Shows read-only label, or an empty message if no SGs are selected
    return (
      <SecurityGroupsViewList securityGroups={selectedOptions} emptyMessage={sg.readOnlyEmpty} />
    );
  }

  const onDeleteGroup = (deleteGroupId: string) => {
    const newGroupIdsValue = selectedGroupIds.filter((sgId) => sgId !== deleteGroupId);
    onChange(newGroupIdsValue);
  };

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isOpen}
      isFullWidth
      badge={
        selectedGroupIds.length > 0 && (
          <Badge screenReaderText={sg.badgeSrText}>{selectedGroupIds.length}</Badge>
        )
      }
      aria-label={sg.optionsMenuAria}
    >
      {sg.selectToggle}
    </MenuToggle>
  );

  const onSelect: SelectProps['onSelect'] = (_event, value) => {
    const selectedGroupId = value as string;
    const wasPreviouslySelected = selectedGroupIds.includes(selectedGroupId);
    if (wasPreviouslySelected) {
      // The SG has been unselected
      onDeleteGroup(selectedGroupId);
    } else {
      // The SG has been selected
      const newGroupIds = selectedGroupIds.concat(selectedGroupId);
      const selectedGroups = vpcSecurityGroups.filter((sg) => newGroupIds.includes(sg.id || ''));
      selectedGroups.sort(securityGroupsSort);

      onChange(selectedGroups.map((group) => group.id || ''));
    }
  };

  const validationError = validateSecurityGroups(selectedGroupIds, v.securityGroups);

  return (
    <>
      <FormGroup fieldId="securityGroupIds" label={label} className="pf-v6-u-mt-md">
        <Split hasGutter>
          <SplitItem isFilled>
            <Stack hasGutter>
              <StackItem>
                <Select
                  role="menu"
                  isOpen={isOpen}
                  selected={selectedGroupIds}
                  toggle={toggle}
                  onSelect={onSelect}
                  onOpenChange={(isOpen) => setIsOpen(isOpen)}
                  data-testid="securitygroups-id"
                  aria-label={sg.selectAriaLabelledBy}
                  maxMenuHeight="300px"
                >
                  <SelectList>
                    {vpcSecurityGroups.map(({ id = '', name = '' }) => {
                      const { displayName, isCut } = getDisplayName(name);
                      return (
                        <SelectOption
                          key={id}
                          value={id}
                          description={id}
                          title={isCut ? name : ''}
                          hasCheckbox
                          isSelected={selectedGroupIds.includes(id)}
                        >
                          {displayName}
                        </SelectOption>
                      );
                    })}
                  </SelectList>
                </Select>
              </StackItem>
              <StackItem>
                <SecurityGroupsViewList
                  securityGroups={selectedOptions}
                  onCloseItem={onDeleteGroup}
                />
              </StackItem>
            </Stack>
          </SplitItem>
          {refreshVPCCallback && (
            <SplitItem>
              <Tooltip content={sg.refreshTooltip}>
                <Button
                  id="refreshSecurityGroupsButton"
                  aria-label={sg.refreshTooltip}
                  isDisabled={isVPCLoading}
                  variant="plain"
                  onClick={refreshVPCCallback}
                  icon={<RedoIcon />}
                />
              </Tooltip>
            </SplitItem>
          )}
        </Split>
      </FormGroup>
      <FormGroupHelperText touched error={validationError} />
    </>
  );
};

export default EditSecurityGroups;
