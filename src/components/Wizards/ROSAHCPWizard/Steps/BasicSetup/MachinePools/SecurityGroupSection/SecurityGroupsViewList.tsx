import React from 'react';

import { Label, LabelGroup } from '@patternfly/react-core';
import { SecurityGroup } from '../../../../../types';

const SecurityGroupsViewList = ({
  securityGroups,
  emptyMessage,
  onCloseItem,
}: {
  securityGroups: SecurityGroup[];
  emptyMessage?: string;
  onCloseItem?: (groupId: string) => void;
}) => {
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
          <Label variant="outline" id={id} key={id} onClose={onClose}>
            {sg.name || id}
          </Label>
        );
      })}
    </LabelGroup>
  );
};
export default SecurityGroupsViewList;
