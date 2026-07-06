import { clusterValidationSchema } from '../yupSchemas';
import type { ValidationSchemaContext } from '../yupSchemas/types';
import { defaultRosaHcpWizardValidatorStrings } from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { FOOTER_CT_BASE_FORM_VALUES } from './rosaHcpWizardFooter.ctDefaults';
import { VALID_REVIEW_SUBMIT_FORM_VALUES } from './rosaHcpWizardFooter.test-data';

const validationContext: ValidationSchemaContext = {
  msgs: defaultRosaHcpWizardValidatorStrings,
  maxRootDiskSize: 16384,
  maxAutoscalingNodes: 500,
  machinePoolsNumber: 1,
};

describe('rosaHcpWizardFooter.test-data', () => {
  it('VALID_REVIEW_SUBMIT_FORM_VALUES passes full schema with footer CT base defaults', async () => {
    await expect(
      clusterValidationSchema.validate(
        { ...FOOTER_CT_BASE_FORM_VALUES, ...VALID_REVIEW_SUBMIT_FORM_VALUES },
        { abortEarly: false, context: validationContext }
      )
    ).resolves.toBeDefined();
  });
});
