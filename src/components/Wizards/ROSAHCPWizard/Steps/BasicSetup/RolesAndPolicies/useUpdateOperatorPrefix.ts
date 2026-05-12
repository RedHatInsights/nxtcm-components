import { useFormContext, useWatch } from 'react-hook-form';
import { ROSAHCPCluster } from '../../../types';
import { createOperatorRolesPrefix } from '../../../helpers';
import React from 'react';

export const useUpdateOperatorPrefix = () => {
  const { setValue } = useFormContext<ROSAHCPCluster>();
  const clusterName = useWatch({ name: 'name' });

  const operatorRolesPrefix = createOperatorRolesPrefix(clusterName);
  React.useEffect(() => {
    setValue('custom_operator_roles_prefix', operatorRolesPrefix);
  }, [operatorRolesPrefix, setValue]);
};
