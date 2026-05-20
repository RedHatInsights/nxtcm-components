import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import type { YupFieldDescribeOptions } from '../../../../../../utilities/yupFieldRequired';
import type { ROSAHCPCluster } from '../../../types';

/**
 * Form values for Yup {@link yup.Schema.describe} so `.when()` branches resolve for
 * conditionally required encryption fields (Key ARN inputs).
 */
export function useEncryptionYupDescribeOptions(): YupFieldDescribeOptions {
  const { getValues } = useFormContext<ROSAHCPCluster>();
  const encryptionKeys = useWatch<ROSAHCPCluster>({ name: 'encryption_keys' });
  const etcdEncryption = useWatch<Pick<ROSAHCPCluster, 'etcd_encryption'>>({
    name: 'etcd_encryption',
  });

  return useMemo(() => ({ value: getValues() }), [encryptionKeys, etcdEncryption, getValues]);
}
