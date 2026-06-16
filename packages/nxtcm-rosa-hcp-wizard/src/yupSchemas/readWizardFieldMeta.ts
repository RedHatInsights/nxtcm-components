import type { WizardFieldMeta } from './types';

type FieldSchemaWithMeta = { describe: () => { meta?: WizardFieldMeta } };

/** Reads {@link WizardFieldMeta} from a Yup field schema's `.describe().meta`. */
export function readWizardFieldMeta(fieldSchema: unknown): WizardFieldMeta | undefined {
  if (
    fieldSchema == null ||
    typeof fieldSchema !== 'object' ||
    typeof (fieldSchema as FieldSchemaWithMeta).describe !== 'function'
  ) {
    return undefined;
  }
  return (fieldSchema as FieldSchemaWithMeta).describe().meta;
}
