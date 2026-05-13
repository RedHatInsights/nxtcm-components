import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  WizCtWatchStatus,
  wizCtSubmitValidationPreview,
  withRosaCt,
} from '../wizFieldCtSpecHelpers';
import { WizCheckbox } from './WizCheckbox';

export const WIZ_CHECKBOX_EXPLICIT_TITLE = 'Explicit title';
export const WIZ_CHECKBOX_EXPLICIT_LABEL = 'Explicit checkbox label';
export const WIZ_CHECKBOX_EXPLICIT_HELPER = 'Explicit helper text.';
export const WIZ_CHECKBOX_VALUE_STATUS_LABEL = 'acceptTerms form value';

export const WIZ_CHECKBOX_YUP_META_TITLE = 'Yup meta title';
export const WIZ_CHECKBOX_YUP_META_LABEL = 'Yup meta label';
export const WIZ_CHECKBOX_YUP_META_HELPER = 'Yup meta helper text.';

export const WIZ_CHECKBOX_SUBMIT_ERROR = 'You must accept the terms to continue.';

type ExplicitFormValues = { acceptTerms: boolean };

export function WizCheckboxExplicitHarness() {
  const methods = useForm<ExplicitFormValues>({
    defaultValues: { acceptTerms: false },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizCheckbox<ExplicitFormValues>
          name="acceptTerms"
          id="wiz-checkbox-ct-explicit"
          title={WIZ_CHECKBOX_EXPLICIT_TITLE}
          label={WIZ_CHECKBOX_EXPLICIT_LABEL}
          helperText={WIZ_CHECKBOX_EXPLICIT_HELPER}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="acceptTerms"
          ariaLabel={WIZ_CHECKBOX_VALUE_STATUS_LABEL}
          format={(v) => String(v)}
        />
      </Form>
    </FormProvider>
  );
}

const yupMetaSchema = yup.object({
  notifications: yup.boolean().meta({
    id: 'wiz-checkbox-ct-yup-meta',
    title: WIZ_CHECKBOX_YUP_META_TITLE,
    label: WIZ_CHECKBOX_YUP_META_LABEL,
    helperText: WIZ_CHECKBOX_YUP_META_HELPER,
  }),
});

type YupMetaFormValues = yup.InferType<typeof yupMetaSchema>;

export function WizCheckboxYupMetaHarness() {
  const methods = useForm<YupMetaFormValues>({
    defaultValues: { notifications: false },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizCheckbox<YupMetaFormValues> name="notifications" schema={yupMetaSchema} />
      </Form>
    </FormProvider>
  );
}

type SubmitValidationFormValues = { acceptTerms: boolean };

const submitValidationSchema: yup.ObjectSchema<SubmitValidationFormValues> = yup.object({
  acceptTerms: yup.boolean().oneOf([true], WIZ_CHECKBOX_SUBMIT_ERROR).required(),
});

export function WizCheckboxSubmitValidationHarness() {
  const methods = useForm<SubmitValidationFormValues>({
    resolver: yupResolver(submitValidationSchema),
    defaultValues: { acceptTerms: false },
    mode: 'onSubmit',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form onSubmit={wizCtSubmitValidationPreview(methods)}>
        <WizCheckbox<SubmitValidationFormValues>
          name="acceptTerms"
          schema={submitValidationSchema}
          label="I accept the terms"
          title="Terms"
        />
        <Button type="submit">Submit</Button>
      </Form>
    </FormProvider>
  );
}

type NestedPrefsFormValues = {
  prefs: {
    digest: boolean;
  };
};

/** Nested path, no Yup schema — label falls back to final path segment. */
export function WizCheckboxNestedFallbackHarness() {
  const methods = useForm<NestedPrefsFormValues>({
    defaultValues: { prefs: { digest: false } },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizCheckbox<NestedPrefsFormValues> name="prefs.digest" />
      </Form>
    </FormProvider>
  );
}

export const WIZ_CHECKBOX_META_LOSE_TITLE = 'Checkbox meta-only title';
export const WIZ_CHECKBOX_META_LOSE_LABEL = 'Checkbox meta-only label';
export const WIZ_CHECKBOX_META_LOSE_HELPER = 'Checkbox meta-only helper';

export const WIZ_CHECKBOX_OVERRIDE_TITLE_PROPS = 'Explicit title defeats Yup meta';
export const WIZ_CHECKBOX_OVERRIDE_LABEL_PROPS = 'Explicit label defeats Yup meta';
export const WIZ_CHECKBOX_OVERRIDE_HELPER_PROPS = 'Explicit helper defeats Yup meta';

const checkboxOverrideMetaSchema = yup.object({
  flagOpt: yup.boolean().meta({
    title: WIZ_CHECKBOX_META_LOSE_TITLE,
    label: WIZ_CHECKBOX_META_LOSE_LABEL,
    helperText: WIZ_CHECKBOX_META_LOSE_HELPER,
  }),
});

type CheckboxPropsOverrideValues = yup.InferType<typeof checkboxOverrideMetaSchema>;

export function WizCheckboxExplicitPropsOverrideMetaHarness() {
  const methods = useForm<CheckboxPropsOverrideValues>({
    defaultValues: { flagOpt: false },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizCheckbox<CheckboxPropsOverrideValues>
          name="flagOpt"
          schema={checkboxOverrideMetaSchema}
          title={WIZ_CHECKBOX_OVERRIDE_TITLE_PROPS}
          label={WIZ_CHECKBOX_OVERRIDE_LABEL_PROPS}
          helperText={WIZ_CHECKBOX_OVERRIDE_HELPER_PROPS}
        />
      </Form>
    </FormProvider>
  );
}

export const WIZ_CHECKBOX_SOLO_CONTROL_STATUS = 'solo checkbox form value';

type SoloCheckboxValues = { solo: boolean };

export function WizCheckboxExplicitControlOnlyHarness() {
  const methods = useForm<SoloCheckboxValues>({
    defaultValues: { solo: false },
  });

  return withRosaCt(
    <>
      <WizCheckbox<SoloCheckboxValues>
        control={methods.control}
        name="solo"
        title="Solo control checkbox"
        label="Solo toggle only control prop"
      />
      <WizCtWatchStatus
        control={methods.control}
        name="solo"
        ariaLabel={WIZ_CHECKBOX_SOLO_CONTROL_STATUS}
        format={(v) => String(v)}
      />
    </>
  );
}
