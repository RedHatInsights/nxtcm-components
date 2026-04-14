import { Alert, Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { validateAWSKMSKeyARN } from '../../../validators';
import { ClusterEncryptionKeys } from '../../../../types';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';
import { Radio, RosaCheckbox, RosaRadioGroup, RosaSection, RosaTextInput } from '../../../Inputs';

export const EncryptionSubstep = () => {
  const e = useRosaWizardStrings().encryption;
  const v = useRosaWizardValidators();
  const { setValue } = useFormContext();
  const cluster = useWatch({ name: 'cluster' });

  return (
    <RosaSection label={e.sectionLabel} id="encryption-substep-section">
      <RosaRadioGroup
        id="encryption-keys-radio-group"
        path="cluster.encryption_keys"
        label={e.keysGroupLabel}
        helperText={
          <>
            {e.keysHelperLead}{' '}
            <ExternalLink href={links.AWS_DATA_PROTECTION}>{e.keysLearnMore}</ExternalLink>
          </>
        }
        onValueChange={(value) => {
          if (value !== ClusterEncryptionKeys.custom) {
            setValue('cluster.kms_key_arn', undefined, { shouldDirty: true });
          }
        }}
      >
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <Radio
              id="default-aws-kms-key-radio-btn"
              label={e.defaultKms}
              value={ClusterEncryptionKeys.default}
            />
          </FlexItem>
          <FlexItem>
            <Radio
              id="custom-aws-kms-key-radio-btn"
              label={e.customKms}
              value={ClusterEncryptionKeys.custom}
            />
          </FlexItem>
        </Flex>
      </RosaRadioGroup>
      {cluster?.encryption_keys === ClusterEncryptionKeys.custom && (
        <Grid>
          <GridItem span={4}>
            <RosaTextInput
              path="cluster.kms_key_arn"
              label={e.keyArnLabel}
              validateOnBlur
              validation={(value) => validateAWSKMSKeyARN(value, cluster?.region, v.kmsKeyArn)}
              required
              labelHelp={e.keyArnHelp}
            />
          </GridItem>
        </Grid>
      )}

      <RosaCheckbox
        id="etcd-encryption"
        path="cluster.etcd_encryption"
        title={e.etcdTitle}
        label={e.etcdLabel}
        onValueChange={(checked) => {
          if (!checked) {
            setValue('cluster.etcd_key_arn', undefined, { shouldDirty: true });
          }
        }}
        helperText={
          <>
            {e.etcdHelperLead}{' '}
            <ExternalLink href={links.ROSA_SERVICE_ETCD_ENCRYPTION}>{e.etcdLearnMore}</ExternalLink>
          </>
        }
      />

      {cluster?.etcd_encryption && (
        <Grid>
          <GridItem span={4}>
            <RosaTextInput
              path="cluster.etcd_key_arn"
              validation={(value) => validateAWSKMSKeyARN(value, cluster?.region, v.kmsKeyArn)}
              label={e.keyArnLabel}
              validateOnBlur
              required
              labelHelp={e.keyArnHelp}
            />
          </GridItem>
        </Grid>
      )}
      <Grid>
        <GridItem span={6}>
          <Alert variant="info" title={e.keysNoteAlert} ouiaId="encryptionKeysAlert" />
        </GridItem>
      </Grid>
    </RosaSection>
  );
};
