import { Alert } from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { WizRadioGroup } from '../../../components/WizFields/WizRadioGroup';
import { clusterValidationSchema } from '../../../yupSchemas';
import { Radio } from '../../../components/Fields/Radio';
import { useWatch } from 'react-hook-form';
import { ClusterEncryptionKeys, ROSAHCPCluster } from '../../../types';
import { WizTextInput } from '../../../components/WizFields/WizTextInput';
import ExternalLink from '../../../components/ExternalLink';
import links from '../../../constants/links';
import { FieldWrapper } from '../../../components/FieldWrapper';
import { WizCheckbox } from '../../../components/WizFields/WizCheckbox';
import { useClearFieldWhenHidden } from './useClearFieldWhenHidden';
import { useEncryptionYupDescribeOptions } from './useEncryptionYupDescribeOptions';
import { FIELD_NAME } from '../../../constants';

export const Encryption = () => {
  const e = useRosaHcpWizardStrings().encryption;
  const yupDescribeOptions = useEncryptionYupDescribeOptions();
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
            <ExternalLink href={links.AWS_DATA_PROTECTION}>{e.keysLearnMore}</ExternalLink>
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
