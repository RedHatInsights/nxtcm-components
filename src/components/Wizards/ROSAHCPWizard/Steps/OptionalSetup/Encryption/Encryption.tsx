import { Alert, Grid, GridItem } from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { WizRadioGroup } from '../../../components/WizFields/WizRadioGroup';
import { clusterValidationSchema } from '../../../yupSchemas';
import { Radio } from '../../../components/Fields/Radio';

export const Encryption = () => {
  const e = useRosaHcpWizardStrings().encryption;
  //const v = useRosaHcpWizardValidators();
  return (
    <Section label={e.sectionLabel}>
      <WizRadioGroup name="encryption_keys" schema={clusterValidationSchema}>
        <Radio id="wiz-radio-public" label={e.defaultKms} value="public" />
        <Radio id="wiz-radio-private" label={e.customKms} value="private" />
      </WizRadioGroup>
      encryption_keys etcd_encryption
      <Grid>
        <GridItem span={6}>
          <Alert variant="info" title={e.keysNoteAlert} ouiaId="encryptionKeysAlert" />
        </GridItem>
      </Grid>
    </Section>
  );
};
