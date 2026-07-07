import React from 'react';

import { Alert, AlertActionLink } from '@patternfly/react-core';
import links from '../../../../constants/links';
import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';

const SecurityGroupsNoEditAlert = () => {
  const sg = useRosaHcpWizardStrings().securityGroups;

  return (
    <Alert
      className="pf-v6-u-mt-md"
      variant="info"
      isInline
      title={sg.noEditTitle}
      actionLinks={
        <>
          <AlertActionLink component="a" href={links.ROSA_SECURITY_GROUPS} target="_blank">
            {sg.noEditViewMoreInfo}
          </AlertActionLink>
          <AlertActionLink component="a" href={links.AWS_CONSOLE_SECURITY_GROUPS} target="_blank">
            {sg.noEditAwsConsoleLink}
          </AlertActionLink>
        </>
      }
    />
  );
};

export default SecurityGroupsNoEditAlert;
