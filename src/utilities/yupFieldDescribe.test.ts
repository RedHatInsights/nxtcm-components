import * as yup from 'yup';

import { getYupFieldDescriptionAtPath, metaFromDescription } from './yupFieldDescribe';
import { YUP_FIELD_REQUIRED_UI_META_KEY } from './yupFieldRequired';

describe('getYupFieldDescriptionAtPath', () => {
  it('resolves sibling .when() branches via object describe', () => {
    const etcdKeyArn = yup.string().when('etcd_encryption', {
      is: true,
      then: (schema) => schema.meta({ [YUP_FIELD_REQUIRED_UI_META_KEY]: true }),
      otherwise: (schema) => schema.optional(),
    });
    const schema = yup.object({
      etcd_encryption: yup.boolean(),
      etcd_key_arn: etcdKeyArn,
    });

    const whenChecked = getYupFieldDescriptionAtPath(schema, 'etcd_key_arn', {
      value: { etcd_encryption: true },
    });
    const whenUnchecked = getYupFieldDescriptionAtPath(schema, 'etcd_key_arn', {
      value: { etcd_encryption: false },
    });

    expect(metaFromDescription(whenChecked)).toEqual({ [YUP_FIELD_REQUIRED_UI_META_KEY]: true });
    expect(metaFromDescription(whenUnchecked)).toEqual({});
  });

  it('supports nested paths on object describe', () => {
    const schema = yup.object({
      user: yup.object({
        name: yup.string().required().meta({ id: 'user-name' }),
      }),
    });

    expect(metaFromDescription(getYupFieldDescriptionAtPath(schema, 'user.name'))).toEqual({
      id: 'user-name',
    });
  });
});
