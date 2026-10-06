// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import React from 'react';

import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { AccountRoles } from './AccountRoles';

export const AccountRolesMount: React.FC = () => {
  return withRosaCt(<AccountRoles />);
};
