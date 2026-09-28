// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import React from 'react';

import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { UserRole } from './UserRole';

export const UserRoleMount: React.FC = () => {
  return withRosaCt(<UserRole />);
};
