import { Radio, Section, WizCheckbox, WizRadioGroup } from "@patternfly-labs/react-form-wizard"
import { Alert, Content, ContentVariants, Flex, FlexItem } from "@patternfly/react-core"


export const EncryptionSubstep = () => {
    return (
        <Section label="Advanced encryption" id="encryption-substep-section" key="encryption-substep-section-key">
            <WizRadioGroup id="encryption-keys-radio-group"
                path="metadata.encryption-keys" label="Encryption Keys" helperText="You can use your default or a custom AWS KMS key to encrypt the root disks for your OpenShift nodes. {HERE GOES A LINK: Learn more}">
                <Flex>
                    <FlexItem>
                        <Radio id="default-aws-kms-key-radio-btn" label="Use default AWS KMS key" value="default" />
                    </FlexItem>
                    <FlexItem>

                        <Radio id="custom-aws-kms-key-radio-btn" label="Use custom AWS KSM key" value="custom" />
                    </FlexItem>
                </Flex>

            </WizRadioGroup>

            <WizCheckbox path="metadata.etcd-encryption" title="etcd encryption" label="Enable additional etcd encryption" helperText="Optionally, add a unique customer-managed AWS KMS key to encrypt etcd. {HERE GOES A LINK: Learn more}" />

            <Alert variant="info" title="Take a not of the keys associated with your cluster. If you delete your keys, the cluster will not be available" ouiaId="encryptionKeysAlert" />
        </Section>
    )
}