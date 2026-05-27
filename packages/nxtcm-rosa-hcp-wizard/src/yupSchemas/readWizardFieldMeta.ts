import type { WizardFieldMeta } from './types';

type FieldSchemaWithMeta = { describe: () => { meta?: WizardFieldMeta } };

/** Reads {@link WizardFieldMeta} from a Yup field schema's `.describe().meta`. */
export function readWizardFieldMeta(fieldSchema: unknown): WizardFieldMeta | undefined {
  return (fieldSchema as FieldSchemaWithMeta).describe().meta;
}
