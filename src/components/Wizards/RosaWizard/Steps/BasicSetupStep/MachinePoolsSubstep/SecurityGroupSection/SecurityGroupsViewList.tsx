import React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';
import { SecurityGroup } from '../../../../../types';

/**
 * Label width for security group names; wider than PatternFly default so tooltips work in collapsed sections.
 * @see https://github.com/patternfly/patternfly-react/issues/9690
 */
const SECURITY_GROUPS_NAME_MAX_WIDTH = '50ch';

/** Props for rendering selected security groups as removable or static outline labels. */
type SecurityGroupsViewListProps = {
  securityGroups: SecurityGroup[];
  emptyMessage?: string;
  onCloseItem?: (groupId: string) => void;
};

/** Renders security groups as a `LabelGroup`, optional empty text, and optional per-label remove actions. */
const SecurityGroupsViewList = ({
  securityGroups,
  emptyMessage,
  onCloseItem,
}: SecurityGroupsViewListProps) => {
  const itemCount = securityGroups.length;
  if (itemCount === 0) {
    return emptyMessage ? (
      <div className="pf-v6-u-font-size-sm pf-v6-u-disabled-color-100">{emptyMessage}</div>
    ) : null;
  }
  return (
    <LabelGroup className="pf-v6-u-mb-lg" numLabels={itemCount}>
      {securityGroups.map((sg) => {
        const { id = '' } = sg;
        const onClose = onCloseItem ? () => onCloseItem(id) : undefined;
        return (
          <Label
            variant="outline"
            id={id}
            key={id}
            onClose={onClose}
            textMaxWidth={SECURITY_GROUPS_NAME_MAX_WIDTH}
          >
            {sg.name || id}
          </Label>
        );
      })}
    </LabelGroup>
  );
};
export default SecurityGroupsViewList;
