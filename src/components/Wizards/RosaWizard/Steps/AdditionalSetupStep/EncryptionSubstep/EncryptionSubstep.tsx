import {
  Radio,
  Section,
  useData,
  useItem,
  WizCheckbox,
  WizRadioGroup,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import { Alert, Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from '../../../../../../context/TranslationContext';
import { validateAWSKMSKeyARN } from '../../../validators';
import { RosaWizardFormData } from '../../../../types';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';

export const EncryptionSubstep = () => {
  const { t } = useTranslation();
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
      label={t('Advanced encryption')}
      id="encryption-substep-section"
      key="encryption-substep-section-key"
    >
      <WizRadioGroup
        id="encryption-keys-radio-group"
        path="cluster.encryption_keys"
        label={t('Encryption Keys')}
        helperText={
          <>
            {t(
              'You can use your default or a custom AWS KMS key to encrypt the root disks for your OpenShift nodes.'
            )}{' '}
            <ExternalLink href={links.AWS_DATA_PROTECTION}>Learn more</ExternalLink>
          </>
        }
      >
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <Radio
              id="default-aws-kms-key-radio-btn"
              label={t('Use default AWS KMS key')}
              value="default"
            />
          </FlexItem>
          <FlexItem>
            <Radio
              id="custom-aws-kms-key-radio-btn"
              label={t('Use custom AWS KMS key')}
              value="custom"
            />
          </FlexItem>
        </Flex>
      </WizRadioGroup>
      {cluster?.['encryption_keys'] === 'custom' && (
        <Grid>
          <GridItem span={8}>
            <WizTextInput
              path="cluster.kms_key_arn"
              label={t('Key ARN')}
              validateOnBlur
              validation={(value) => validateAWSKMSKeyARN(value, cluster.region, t)}
              required
              labelHelp={t(
                'The key ARN is the Amazon Resource Name (ARN) of a CMK. It is a unique, fully qualified identifier for the CMK. A key ARN includes the AWS account, Region, and the key ID.'
              )}
            />
          </GridItem>
        </Grid>
      )}

      <WizCheckbox
        id="etcd-encryption"
        path="cluster.etcd_encryption"
        title={t('etcd encryption')}
        label={t('Enable additional etcd encryption')}
        helperText={
          <>
            {t('Optionally, add a unique customer-managed AWS KMS key to encrypt etcd.')}{' '}
            <ExternalLink href={links.ROSA_SERVICE_ETCD_ENCRYPTION}>Learn more</ExternalLink>
          </>
        }
      />

      {cluster?.['etcd_encryption'] && (
        <Grid>
          <GridItem span={8}>
            <WizTextInput
              path="cluster.etcd_key_arn"
              validation={(value) => validateAWSKMSKeyARN(value, cluster.region, t)}
              label={t('Key ARN')}
              validateOnBlur
              required
              labelHelp={t(
                'The key ARN is the Amazon Resource Name (ARN) of a CMK. It is a unique, fully qualified identifier for the CMK. A key ARN includes the AWS account, Region, and the key ID.'
              )}
            />
          </GridItem>
        </Grid>
      )}
      <Grid>
        <GridItem span={9}>
          <Alert
            variant="info"
            title={t(
              'Take a note of the keys associated with your cluster. If you delete your keys, the cluster will not be available'
            )}
            ouiaId="encryptionKeysAlert"
          />
        </GridItem>
      </Grid>
    </Section>
  );
};
