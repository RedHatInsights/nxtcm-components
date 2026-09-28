import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { useWatch } from 'react-hook-form';

import ExternalLink from '../../../components/ExternalLink';
import { Radio } from '../../../components/Fields/Radio';
import { FieldWrapper } from '../../../components/FieldWrapper';
import { Section } from '../../../components/Section';
import { WizCheckbox } from '../../../components/WizFields/WizCheckbox';
import { WizRadioGroup } from '../../../components/WizFields/WizRadioGroup';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';
import { FIELD_NAME } from '../../../constants';
import { awsLinks, useGetDocsVersion } from '../../../constants/links';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { ClusterEncryptionKeys, ROSAHCPCluster } from '../../../types';
import { clusterValidationSchema } from '../../../yupSchemas';
import { useClearFieldWhenHidden } from './useClearFieldWhenHidden';
import { useEncryptionYupDescribeOptions } from './useEncryptionYupDescribeOptions';

export const Encryption = () => {
  const e = useRosaHcpWizardStrings().encryption;
  const yupDescribeOptions = useEncryptionYupDescribeOptions();

  const clusterVersion = useWatch({ name: FIELD_NAME.CLUSTER_VERSION }) ?? '';
  const links = useGetDocsVersion(clusterVersion);
  const customKmsSelected = useWatch<ROSAHCPCluster>({
    name: FIELD_NAME.ENCRYPTION.ENCRYPTION_KEYS,
  });
  const etcdIsChecked = useWatch<Pick<ROSAHCPCluster, 'etcd_encryption'>>({
    name: FIELD_NAME.ENCRYPTION.ETCD_ENCRYPTION,
  });

  useClearFieldWhenHidden<ROSAHCPCluster>(
    FIELD_NAME.ENCRYPTION.KMS_KEY_ARN,
    customKmsSelected !== ClusterEncryptionKeys.custom
  );
  useClearFieldWhenHidden<ROSAHCPCluster>(FIELD_NAME.ENCRYPTION.ETCD_KEY_ARN, !etcdIsChecked);

  return (
    <Section label={e.sectionLabel}>
      <WizRadioGroup<ROSAHCPCluster>
        name={FIELD_NAME.ENCRYPTION.ENCRYPTION_KEYS}
        schema={clusterValidationSchema}
        helperText={
          <>
            {e.keysHelperLead}{' '}
            <ExternalLink href={awsLinks.AWS_DATA_PROTECTION}>{e.keysLearnMore}</ExternalLink>
          </>
        }
      >
        <FieldWrapper>
          <Radio
            id="wiz-radio-default"
            label={e.defaultKms}
            value={ClusterEncryptionKeys.default}
          />
          <Radio id="wiz-radio-custom" label={e.customKms} value={ClusterEncryptionKeys.custom} />
        </FieldWrapper>
      </WizRadioGroup>

      {customKmsSelected === 'custom' ? (
        <FieldWrapper size="lg">
          <WizTextInput<ROSAHCPCluster>
            name={FIELD_NAME.ENCRYPTION.KMS_KEY_ARN}
            schema={clusterValidationSchema}
            yupDescribeOptions={yupDescribeOptions}
          />
        </FieldWrapper>
      ) : null}
      <FieldWrapper size="full">
        <WizCheckbox<ROSAHCPCluster>
          name={FIELD_NAME.ENCRYPTION.ETCD_ENCRYPTION}
          schema={clusterValidationSchema}
          helperText={
            <>
              {e.etcdHelperLead}{' '}
              <ExternalLink href={links.ROSA_SERVICE_ETCD_ENCRYPTION}>
                {e.etcdLearnMore}
              </ExternalLink>
            </>
          }
        />
      </FieldWrapper>
      {etcdIsChecked ? (
        <FieldWrapper size="lg">
          <WizTextInput<ROSAHCPCluster>
            name={FIELD_NAME.ENCRYPTION.ETCD_KEY_ARN}
            schema={clusterValidationSchema}
            yupDescribeOptions={yupDescribeOptions}
          />
        </FieldWrapper>
      ) : null}
      <FieldWrapper size="md">
        <Alert variant="info" title={e.keysNoteAlert} ouiaId="encryptionKeysAlert" />
      </FieldWrapper>
    </Section>
  );
};
