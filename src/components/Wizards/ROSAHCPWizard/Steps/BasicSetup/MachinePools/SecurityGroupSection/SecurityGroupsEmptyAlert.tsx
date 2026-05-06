import { Alert, AlertActionLink } from '@patternfly/react-core';
import ExternalLink from '../../../../components/ExternalLink';
import links from '../../../../links';
import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';

type SecurityGroupsEmptyAlertProps = {
  refreshVPCCallback?: () => void;
};
const SecurityGroupsEmptyAlert = ({ refreshVPCCallback }: SecurityGroupsEmptyAlertProps) => {
  const sg = useRosaHcpWizardStrings().securityGroups;
  return (
    <Alert variant="info" isInline title={sg.emptyTitle}>
      {sg.emptyBodyPrefix}{' '}
      <ExternalLink href={links.AWS_CONSOLE_SECURITY_GROUPS}>{sg.emptyConsoleLink}</ExternalLink>{' '}
      {sg.emptyBodySuffix} <br />
      {refreshVPCCallback && (
        <AlertActionLink onClick={refreshVPCCallback}>{sg.refreshLink}</AlertActionLink>
      )}
    </Alert>
  );
};

export default SecurityGroupsEmptyAlert;
