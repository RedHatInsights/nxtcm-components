import { Alert, FormSection, Grid, GridItem } from '@patternfly/react-core';
import { ClusterEncryptionKeys } from '../../../../types';
import ExternalLink from '../../../common/ExternalLink';
import links from '../../../externalLinks';
import { useRosaWizardStrings } from '../../../RosaWizardStringsContext';
import { useRosaWizardValidators } from '../../../RosaWizardStringsContext';
import { validateAWSKMSKeyARN } from '../../../validators';
import { useClusterValues, useRosaForm } from '../../../RosaFormContext';
import { FormCheckbox, FormRadioGroup, FormTextInput } from '../../../../../../TanstackForm';

/**
 * Configures default vs custom AWS KMS keys for cluster encryption, optional etcd encryption with its key,
 * and clears dependent ARN fields when the user switches away from custom or etcd encryption.
 */
export const EncryptionSubstep = (): JSX.Element => {
  const e = useRosaWizardStrings().encryption;
  const v = useRosaWizardValidators();
  const form = useRosaForm();
  const cluster = useClusterValues();

  return (
    <FormSection title={e.sectionLabel} id="encryption-substep-section">
      <form.Field
        name="cluster.encryption_keys"
        listeners={{
          onChange: ({ value }) => {
            if (value !== ClusterEncryptionKeys.custom) {
              form.setFieldValue('cluster.kms_key_arn', undefined);
            }
          },
        }}
      >
        {(field) => (
          <FormRadioGroup
            field={field}
            label={e.keysGroupLabel}
            helperText={
              <>
                {e.keysHelperLead}{' '}
                <ExternalLink href={links.AWS_DATA_PROTECTION}>{e.keysLearnMore}</ExternalLink>
              </>
            }
            options={[
              { value: ClusterEncryptionKeys.default, label: e.defaultKms },
              { value: ClusterEncryptionKeys.custom, label: e.customKms },
            ]}
          />
        )}
      </form.Field>

      {cluster.encryption_keys === ClusterEncryptionKeys.custom && (
        <Grid>
          <GridItem span={4}>
            <form.Field
              name="cluster.kms_key_arn"
              validators={{
                onChange: ({ value }) =>
                  validateAWSKMSKeyARN((value as string) ?? '', cluster.region, v.kmsKeyArn),
              }}
            >
              {(field) => (
                <FormTextInput
                  field={field}
                  label={e.keyArnLabel}
                  labelHelp={e.keyArnHelp}
                  isRequired
                />
              )}
            </form.Field>
          </GridItem>
        </Grid>
      )}

      <form.Field
        name="cluster.etcd_encryption"
        listeners={{
          onChange: ({ value }) => {
            if (!value) {
              form.setFieldValue('cluster.etcd_key_arn', undefined);
            }
          },
        }}
      >
        {(field) => (
          <FormCheckbox
            field={field}
            title={e.etcdTitle}
            label={e.etcdLabel}
            description={
              <>
                {e.etcdHelperLead}{' '}
                <ExternalLink href={links.ROSA_SERVICE_ETCD_ENCRYPTION}>
                  {e.etcdLearnMore}
                </ExternalLink>
              </>
            }
          />
        )}
      </form.Field>

      {cluster.etcd_encryption && (
        <Grid>
          <GridItem span={4}>
            <form.Field
              name="cluster.etcd_key_arn"
              validators={{
                onChange: ({ value }) =>
                  validateAWSKMSKeyARN((value as string) ?? '', cluster.region, v.kmsKeyArn),
              }}
            >
              {(field) => (
                <FormTextInput
                  field={field}
                  label={e.keyArnLabel}
                  labelHelp={e.keyArnHelp}
                  isRequired
                />
              )}
            </form.Field>
          </GridItem>
        </Grid>
      )}

      <Grid>
        <GridItem span={6}>
          <Alert variant="info" title={e.keysNoteAlert} ouiaId="encryptionKeysAlert" />
        </GridItem>
      </Grid>
    </FormSection>
  );
};
