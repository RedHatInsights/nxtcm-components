import { Alert, Stack, StackItem } from '@patternfly/react-core';
import ExternalLink from '../../../../components/ExternalLink';
import links from '../../../../constants/links';
import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';
import { SecurityGroupsRefreshButton } from './SecurityGroupsRefreshButton';

type SecurityGroupsEmptyAlertProps = {
  refreshVPCCallback?: () => void;
  isVPCLoading?: boolean;
};
const SecurityGroupsEmptyAlert = ({
  refreshVPCCallback,
  isVPCLoading,
}: SecurityGroupsEmptyAlertProps) => {
  const sg = useRosaHcpWizardStrings().securityGroups;
  return (
    <Stack hasGutter>
      <StackItem>
        <Alert variant="info" isInline title={sg.emptyTitle}>
          {sg.emptyBodyPrefix}{' '}
          <ExternalLink href={links.AWS_CONSOLE_SECURITY_GROUPS}>
            {sg.emptyConsoleLink}
          </ExternalLink>{' '}
          {sg.emptyBodySuffix}
        </Alert>
      </StackItem>
      <StackItem>
        <SecurityGroupsRefreshButton onRefresh={refreshVPCCallback} isLoading={isVPCLoading} />
      </StackItem>
    </Stack>
  );
};

export default SecurityGroupsEmptyAlert;
