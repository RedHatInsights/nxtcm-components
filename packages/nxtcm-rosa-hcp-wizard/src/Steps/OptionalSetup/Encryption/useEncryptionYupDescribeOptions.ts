import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { YupFieldDescribeOptions } from '../../../utilities/yupFieldRequired';
import type { ROSAHCPCluster } from '../../../types';
import { FIELD_NAME } from '../../../constants';

/**
 * Form values for Yup {@link yup.Schema.describe} so `.when()` branches resolve for
 * conditionally required encryption fields (Key ARN inputs).
 */
export function useEncryptionYupDescribeOptions(): YupFieldDescribeOptions {
  const { getValues } = useFormContext<ROSAHCPCluster>();
  const encryptionKeys = useWatch<ROSAHCPCluster>({ name: FIELD_NAME.ENCRYPTION.ENCRYPTION_KEYS });
  const etcdEncryption = useWatch<Pick<ROSAHCPCluster, 'etcd_encryption'>>({
    name: FIELD_NAME.ENCRYPTION.ETCD_ENCRYPTION,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps -- listing getValues is an overkill because it loads entire state, only encryptionKeys and etcdEncryption are needed
  return useMemo(() => ({ value: getValues() }), [encryptionKeys, etcdEncryption, getValues]);
}
