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

export const Encryption = () => {
  const e = useRosaHcpWizardStrings().encryption;
  const yupDescribeOptions = useEncryptionYupDescribeOptions();
  const customKmsSelected = useWatch<ROSAHCPCluster>({ name: 'encryption_keys' });
  const etcdIsChecked = useWatch<Pick<ROSAHCPCluster, 'etcd_encryption'>>({
    name: 'etcd_encryption',
  });

  useClearFieldWhenHidden<ROSAHCPCluster>(
    'kms_key_arn',
    customKmsSelected !== ClusterEncryptionKeys.custom
  );
  useClearFieldWhenHidden<ROSAHCPCluster>('etcd_key_arn', !etcdIsChecked);

  return (
    <Section label={e.sectionLabel}>
      <WizRadioGroup<ROSAHCPCluster>
        name="encryption_keys"
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
        <WizTextInput<ROSAHCPCluster>
          name="kms_key_arn"
          schema={clusterValidationSchema}
          yupDescribeOptions={yupDescribeOptions}
        />
      ) : null}
      <FieldWrapper span={6}>
        <WizCheckbox<ROSAHCPCluster>
          name="etcd_encryption"
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
        <WizTextInput<ROSAHCPCluster>
          name="etcd_key_arn"
          schema={clusterValidationSchema}
          yupDescribeOptions={yupDescribeOptions}
        />
      ) : null}
      <FieldWrapper span={6}>
        <Alert variant="info" title={e.keysNoteAlert} ouiaId="encryptionKeysAlert" />
      </FieldWrapper>
    </Section>
  );
};
