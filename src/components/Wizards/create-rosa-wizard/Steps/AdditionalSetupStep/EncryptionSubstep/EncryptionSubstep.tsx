import {
  Radio,
  Section,
  useItem,
  WizCheckbox,
  WizRadioGroup,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import { Alert, Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';
import { validateAWSKMSKeyARN } from '../../../validators';
import { ClusterEncryptionKeys, RosaWizardFormData } from '../../../../types';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings, useRosaWizardValidators } from '../../../RosaWizardStringsContext';

export const EncryptionSubstep = () => {
  const e = useRosaWizardStrings().encryption;
  const v = useRosaWizardValidators();
  const { cluster } = useItem<RosaWizardFormData>();

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
        onValueChange={() => {
          if (cluster?.encryption_keys !== ClusterEncryptionKeys.custom && cluster?.kms_key_arn) {
            delete cluster.kms_key_arn;
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
      </WizRadioGroup>
      {cluster?.['encryption_keys'] === ClusterEncryptionKeys.custom && (
        <Grid>
          <GridItem span={4}>
            <WizTextInput
              path="cluster.kms_key_arn"
              label={e.keyArnLabel}
              validateOnBlur
              validation={(value) => validateAWSKMSKeyARN(value, cluster.region, v.kmsKeyArn)}
              required
              labelHelp={e.keyArnHelp}
            />
          </GridItem>
        </Grid>
      )}

      <WizCheckbox
        id="etcd-encryption"
        path="cluster.etcd_encryption"
        title={e.etcdTitle}
        label={e.etcdLabel}
        onValueChange={() => {
          if (!cluster?.etcd_encryption && cluster?.etcd_key_arn) {
            delete cluster.etcd_key_arn;
          }
        }}
        helperText={
          <>
            {e.etcdHelperLead}{' '}
            <ExternalLink href={links.ROSA_SERVICE_ETCD_ENCRYPTION}>{e.etcdLearnMore}</ExternalLink>
          </>
        }
      />

      {cluster?.['etcd_encryption'] && (
        <Grid>
          <GridItem span={4}>
            <WizTextInput
              path="cluster.etcd_key_arn"
              validation={(value) => validateAWSKMSKeyARN(value, cluster.region, v.kmsKeyArn)}
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
    </Section>
  );
};
