import React from 'react';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { AccountRoles } from './AccountRoles';

export const AccountRolesMount: React.FC = () => {
  return withRosaCt(<AccountRoles />);
};
