import { z } from 'zod';

import type { SimpleWizardFormValues } from './simpleWizardForm';

const REQUIRED_SELECT_MSG = 'Selection is required';

const stepASchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  selectionA1: z.string().min(1, { message: REQUIRED_SELECT_MSG }),
  selectionA2: z.string().min(1, { message: REQUIRED_SELECT_MSG }),
  selectionA3: z.string(),
});

const stepBSchema = z.object({
  selectionB1: z.string().min(1, { message: REQUIRED_SELECT_MSG }),
  selectionB2: z.string().min(1, { message: REQUIRED_SELECT_MSG }),
  selectionB3: z.string(),
});

const stepCSchema = z.object({
  selectionC1: z.string().min(1, { message: REQUIRED_SELECT_MSG }),
  selectionC2: z.string().min(1, { message: REQUIRED_SELECT_MSG }),
  selectionC3: z.string(),
});

const stepDSchema = z.object({
  selectionD1: z.string().min(1, { message: REQUIRED_SELECT_MSG }),
  selectionD2: z.string().min(1, { message: REQUIRED_SELECT_MSG }),
  selectionD3: z.string(),
});

const stepESchema = z.object({
  optionText1: z.string(),
});

const stepFSchema = z.object({
  optionText2: z.string(),
});

/** Zod schema for SimpleWizard — mirrors {@link SimpleWizardFormValues} **/
export const simpleWizardSchema: z.ZodType<SimpleWizardFormValues> = z.object({
  required: z.object({
    stepA: stepASchema,
    stepB: stepBSchema,
    stepC: stepCSchema,
    stepD: stepDSchema,
  }),
  optional: z.object({
    stepE: stepESchema,
    stepF: stepFSchema,
  }),
});
