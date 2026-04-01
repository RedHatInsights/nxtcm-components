import {
  Radio,
  Section,
  useData,
  useItem,
  WizCheckbox,
  WizRadioGroup,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import { Alert, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';
import { validateAWSKMSKeyARN } from '../../../validators';
import { RosaWizardFormData } from '../../../../types';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';

export const EncryptionSubstep = () => {
  const e = useRosaWizardStrings().encryption;
  const v = useRosaWizardValidators();
  const { cluster } = useItem<RosaWizardFormData>();
  const { update } = useData();

  React.useEffect(() => {
    if (cluster?.encryption_keys !== 'custom' && cluster?.kms_key_arn) {
      const { kms_key_arn, ...rest } = cluster;
      update({ cluster: rest });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster?.encryption_keys]);

  React.useEffect(() => {
    if (!cluster?.etcd_encryption && cluster?.etcd_key_arn) {
      const { etcd_key_arn, ...rest } = cluster;
      update({ cluster: rest });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster?.etcd_encryption]);

  return (
    <Section
      label={e.sectionLabel}
      id="encryption-substep-section"
      key="encryption-substep-section-key"
    >
      <WizRadioGroup
        id="encryption-keys-radio-group"
        path="cluster.encryption_keys"
        label={e.keysGroupLabel}
        helperText={
          <>
            {e.keysHelperLead}{' '}
            <ExternalLink href={links.AWS_DATA_PROTECTION}>{e.keysLearnMore}</ExternalLink>
          </>
        }
      >
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <Radio id="default-aws-kms-key-radio-btn" label={e.defaultKms} value="default" />
          </FlexItem>
          <FlexItem>
            <Radio id="custom-aws-kms-key-radio-btn" label={e.customKms} value="custom" />
          </FlexItem>
        </Flex>
      </WizRadioGroup>
      {cluster?.['encryption_keys'] === 'custom' && (
        <WizTextInput
          path="cluster.kms_key_arn"
          label={e.keyArnLabel}
          validateOnBlur
          validation={(value) => validateAWSKMSKeyARN(value, cluster.region, v.kmsKeyArn)}
          required
          labelHelp={e.keyArnHelp}
        />
      )}

      <WizCheckbox
        id="etcd-encryption"
        path="cluster.etcd_encryption"
        title={e.etcdTitle}
        label={e.etcdLabel}
        helperText={
          <>
            {e.etcdHelperLead}{' '}
            <ExternalLink href={links.ROSA_SERVICE_ETCD_ENCRYPTION}>{e.etcdLearnMore}</ExternalLink>
          </>
        }
      />

      {cluster?.['etcd_encryption'] && (
        <WizTextInput
          path="cluster.etcd_key_arn"
          validation={(value) => validateAWSKMSKeyARN(value, cluster.region, v.kmsKeyArn)}
          label={e.keyArnLabel}
          validateOnBlur
          required
          labelHelp={e.keyArnHelp}
        />
      )}
      <Alert variant="info" title={e.keysNoteAlert} ouiaId="encryptionKeysAlert" />
    </Section>
  );
};
