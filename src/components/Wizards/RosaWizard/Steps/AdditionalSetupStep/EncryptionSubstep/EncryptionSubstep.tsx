import {
  Radio,
  Section,
  WizCheckbox,
  WizRadioGroup,
  WizTextInput,
} from '@patternfly-labs/react-form-wizard';
import { useInput } from '@patternfly-labs/react-form-wizard/inputs/Input';
import { Alert, Flex, FlexItem } from '@patternfly/react-core';

export const EncryptionSubstep = (props: any) => {
  const { value } = useInput(props);
  const { cluster } = value;

  return (
    <Section
      label="Advanced encryption"
      id="encryption-substep-section"
      key="encryption-substep-section-key"
    >
      <WizRadioGroup
        id="encryption-keys-radio-group"
        path="cluster.encryption_keys"
        label="Encryption Keys"
        helperText="You can use your default or a custom AWS KMS key to encrypt the root disks for your OpenShift nodes. {HERE GOES A LINK: Learn more}"
      >
        <Flex>
          <FlexItem>
            <Radio
              id="default-aws-kms-key-radio-btn"
              label="Use default AWS KMS key"
              value="default"
            />
          </FlexItem>
          <FlexItem>
            <Radio
              id="custom-aws-kms-key-radio-btn"
              label="Use custom AWS KSM key"
              value="custom"
            />
          </FlexItem>
        </Flex>
      </WizRadioGroup>
      {cluster?.['encryption_keys'] === 'custom' && (
        <WizTextInput
          path="cluster.kms_key_arn"
          label="Key ARN"
          required
          labelHelp="The key ARN is the Amazon Resource Name (ARN) of a CMK. It is a unique, fully qualified identifier for the CMK. A key ARN includes the AWS account, Region, and the key ID.
                        {HERE GOES EXTERNAL LINK: Finding the key ID and ARN}"
        />
      )}

      <WizCheckbox
        path="cluster.etcd_encryption"
        title="etcd encryption"
        label="Enable additional etcd encryption"
        helperText="Optionally, add a unique customer-managed AWS KMS key to encrypt etcd. {HERE GOES A LINK: Learn more}"
      />

      {cluster?.['etcd_encryption'] && (
        <WizTextInput
          path="cluster.etcd_key_arn"
          label="Key ARN"
          required
          labelHelp="The key ARN is the Amazon Resource Name (ARN) of a CMK. It is a unique, fully qualified identifier for the CMK. A key ARN includes the AWS account, Region, and the key ID.
                        {HERE GOES EXTERNAL LINK: Finding the key ID and ARN}"
        />
      )}
      <Alert
        variant="info"
        title="Take a not of the keys associated with your cluster. If you delete your keys, the cluster will not be available"
        ouiaId="encryptionKeysAlert"
      />
    </Section>
  );
};
