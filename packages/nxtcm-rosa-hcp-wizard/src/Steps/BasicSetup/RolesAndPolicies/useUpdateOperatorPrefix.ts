import React from 'react';

import { useFormContext, useWatch } from 'react-hook-form';

import { FIELD_NAME } from '../../../constants';
import { ROSAHCPCluster } from '../../../types';
import { createOperatorRolesPrefix } from '../../../utilities/helpers';

export const useUpdateOperatorPrefix = () => {
  const { setValue } = useFormContext<ROSAHCPCluster>();
  const clusterName = useWatch({ name: FIELD_NAME.CLUSTER_NAME });

  const operatorRolesPrefix = React.useMemo(
    () => createOperatorRolesPrefix(clusterName),
    [clusterName]
  );
  React.useEffect(() => {
    setValue(FIELD_NAME.CUSTOM_OPERATOR_ROLES_PREFIX, operatorRolesPrefix, {
      shouldValidate: true,
    });
  }, [operatorRolesPrefix, setValue]);
};
