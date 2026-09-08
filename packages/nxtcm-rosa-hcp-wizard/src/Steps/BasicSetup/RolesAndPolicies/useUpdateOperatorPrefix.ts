import { useFormContext, useWatch } from 'react-hook-form';
import { ROSAHCPCluster } from '../../../types';
import { createOperatorRolesPrefix } from '../../../utilities/helpers';
import React from 'react';
import { FIELD_NAME } from '../../../constants';

export const useUpdateOperatorPrefix = () => {
  const { setValue } = useFormContext<ROSAHCPCluster>();
  const clusterName = useWatch({ name: 'name' });

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
