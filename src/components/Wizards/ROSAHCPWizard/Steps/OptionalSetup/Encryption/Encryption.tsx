import { Alert, Grid, GridItem } from '@patternfly/react-core';
import { Section } from '../../../components/Section';
import {
  useRosaHcpWizardStrings,
  //useRosaHcpWizardValidators,
} from '../../../stringsProvider/RosaHcpWizardStringsContext';

export const Encryption = () => {
  const e = useRosaHcpWizardStrings().encryption;
  //const v = useRosaHcpWizardValidators();
  return (
    <Section label={e.sectionLabel}>
      encryption_keys etcd_encryption
      <Grid>
        <GridItem span={6}>
          <Alert variant="info" title={e.keysNoteAlert} ouiaId="encryptionKeysAlert" />
        </GridItem>
      </Grid>
    </Section>
  );
};
