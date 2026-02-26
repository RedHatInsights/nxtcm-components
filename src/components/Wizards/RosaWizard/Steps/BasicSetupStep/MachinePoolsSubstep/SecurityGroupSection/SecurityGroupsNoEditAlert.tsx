import React from 'react';

import { Alert, AlertActionLink } from '@patternfly/react-core';
import { useTranslation } from '../../../../../../../context/TranslationContext';
import links from '../../../../externalLinks';

const SecurityGroupsNoEditAlert = () => {
  const { t } = useTranslation();

  return (
    <Alert
      variant="info"
      isInline
      title={t(
        'You cannot add or edit security groups associated with machine pools that were created during cluster creation.'
      )}
      actionLinks={
        <>
          <AlertActionLink component="a" href={links.ROSA_SECURITY_GROUPS} target="_blank">
            View more information
          </AlertActionLink>
          <AlertActionLink component="a" href={links.AWS_CONSOLE_SECURITY_GROUPS} target="_blank">
            AWS security groups console
          </AlertActionLink>
        </>
      }
    />
  );
};

export default SecurityGroupsNoEditAlert;
