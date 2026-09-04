import React from 'react';

import { Alert, AlertActionLink } from '@patternfly/react-core';
import { awsLinks, useDocsVersion } from '../../../../constants/links';
import { useRosaHcpWizardStrings } from '../../../../stringsProvider/RosaHcpWizardStringsContext';
import { useWatch } from 'react-hook-form';
import { FIELD_NAME } from '../../../../constants';

const SecurityGroupsNoEditAlert = () => {
  const sg = useRosaHcpWizardStrings().securityGroups;
  const clusterVersion = useWatch({ name: FIELD_NAME.CLUSTER_VERSION }) ?? '';
  const links = useDocsVersion(clusterVersion);
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
          <AlertActionLink
            component="a"
            href={awsLinks.AWS_CONSOLE_SECURITY_GROUPS}
            target="_blank"
          >
            {sg.noEditAwsConsoleLink}
          </AlertActionLink>
        </>
      }
    />
  );
};

export default SecurityGroupsNoEditAlert;
