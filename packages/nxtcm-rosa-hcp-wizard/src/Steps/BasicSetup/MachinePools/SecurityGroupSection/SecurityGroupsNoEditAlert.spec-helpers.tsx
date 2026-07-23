import React from 'react';
import { withRosaCt } from '../../../../components/WizFields/wizFieldCtSpecHelpers';
import SecurityGroupsNoEditAlert from './SecurityGroupsNoEditAlert';

export const SecurityGroupsNoEditAlertMount: React.FC = () => {
  return withRosaCt(<SecurityGroupsNoEditAlert />);
};
