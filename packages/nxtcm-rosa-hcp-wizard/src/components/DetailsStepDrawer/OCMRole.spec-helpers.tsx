import React from 'react';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { OCMRole } from './OCMRole';

export const OCMRoleMount: React.FC = () => {
  return withRosaCt(<OCMRole />);
};
