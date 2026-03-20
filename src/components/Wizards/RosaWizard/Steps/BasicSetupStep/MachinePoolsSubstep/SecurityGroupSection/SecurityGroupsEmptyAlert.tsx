import { Alert, AlertActionLink } from '@patternfly/react-core';
import ExternalLink from '../../../../common/ExternalLink';
import links from '../../../../externalLinks';
import { useRosaWizardStrings } from '../../../../RosaWizardStringsContext';

type SecurityGroupsEmptyAlertProps = {
  refreshVPCCallback?: () => void;
};
const SecurityGroupsEmptyAlert = ({ refreshVPCCallback }: SecurityGroupsEmptyAlertProps) => {
  const sg = useRosaWizardStrings().securityGroups;
  return (
    <Alert variant="info" isInline title={sg.emptyTitle}>
      {sg.emptyBodyPrefix}{' '}
      <ExternalLink href={links.AWS_CONSOLE_SECURITY_GROUPS}>{sg.emptyConsoleLink}</ExternalLink> of
      your AWS console. <br />
      {refreshVPCCallback && (
        <AlertActionLink onClick={refreshVPCCallback}>{sg.refreshLink}</AlertActionLink>
      )}
    </Alert>
  );
};

export default SecurityGroupsEmptyAlert;
