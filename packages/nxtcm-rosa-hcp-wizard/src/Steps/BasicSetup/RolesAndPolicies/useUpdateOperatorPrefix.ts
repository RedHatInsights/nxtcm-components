import { useFormContext, useWatch } from 'react-hook-form';
import { ROSAHCPCluster } from '../../../types';
import { createOperatorRolesPrefix } from '../../../helpers';
import React from 'react';

export const useUpdateOperatorPrefix = () => {
  const { setValue } = useFormContext<ROSAHCPCluster>();
  const clusterName = useWatch({ name: 'name' });

  const operatorRolesPrefix = React.useMemo(
    () => createOperatorRolesPrefix(clusterName),
    [clusterName]
  );
  React.useEffect(() => {
    setValue('custom_operator_roles_prefix', operatorRolesPrefix, { shouldValidate: true });
  }, [operatorRolesPrefix, setValue]);
};
