import { Button, Spinner } from '@patternfly/react-core';
import RedoIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';

export type SecurityGroupsRefreshButtonProps = {
  onRefresh?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
};

export function SecurityGroupsRefreshButton({
  onRefresh,
  isLoading = false,
  isDisabled = false,
}: SecurityGroupsRefreshButtonProps) {
  const sg = useRosaHcpWizardStrings().securityGroups;

  if (!onRefresh) {
    return null;
  }

  return (
    <Button
      variant="control"
      aria-label={sg.refreshTooltip}
      onClick={onRefresh}
      icon={isLoading ? <Spinner size="sm" /> : <RedoIcon />}
      isDisabled={isDisabled || isLoading}
      data-testid="security-groups-refresh"
    />
  );
}
