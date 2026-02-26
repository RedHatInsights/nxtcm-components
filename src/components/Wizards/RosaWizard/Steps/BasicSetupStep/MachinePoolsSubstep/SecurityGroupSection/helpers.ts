import { SecurityGroup } from './types';

export const securityGroupsSort = (a: SecurityGroup, b: SecurityGroup) => {
  // Sorts first VPCs that have a name over those that don't
  if (a.name && !b.name) {
    return -1;
  }
  if (b.name && !a.name) {
    return 1;
  }
  // Then the rest are sorted alphabetically by their name or ID
  const aId = a.name || a.id || '';
  const bId = b.name || b.id || '';
  return aId.localeCompare(bId);
};
