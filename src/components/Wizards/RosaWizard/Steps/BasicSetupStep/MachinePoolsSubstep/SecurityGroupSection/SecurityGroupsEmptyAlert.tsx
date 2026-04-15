import { Alert, AlertActionLink } from '@patternfly/react-core';
import ExternalLink from '../../../../common/ExternalLink';
import links from '../../../../externalLinks';
import { useRosaWizardStrings } from '../../../../RosaWizardStringsContext';

/** Props for the empty-state alert when the VPC has no security groups loaded yet. */
type SecurityGroupsEmptyAlertProps = {
  refreshVPCCallback?: () => void;
};

/** Inline info alert explaining how to create groups in AWS and optionally refresh VPC data. */
const SecurityGroupsEmptyAlert = ({ refreshVPCCallback }: SecurityGroupsEmptyAlertProps) => {
  const sg = useRosaWizardStrings().securityGroups;
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
