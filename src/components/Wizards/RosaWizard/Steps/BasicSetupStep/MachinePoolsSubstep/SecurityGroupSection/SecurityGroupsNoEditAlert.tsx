import React from 'react';

import { Alert, AlertActionLink } from '@patternfly/react-core';
import links from '../../../../externalLinks';
import { useRosaWizardStrings } from '../../../../RosaWizardStringsContext';

/** Info alert with links for learning about security groups after creation (no in-wizard editing). */
const SecurityGroupsNoEditAlert = () => {
  const sg = useRosaWizardStrings().securityGroups;

  return (
    <Alert
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
