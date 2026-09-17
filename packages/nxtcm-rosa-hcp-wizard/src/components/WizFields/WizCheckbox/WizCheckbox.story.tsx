import {
  WIZ_CHECKBOX_SOLO_CONTROL_STATUS,
  WIZ_CHECKBOX_OVERRIDE_HELPER_PROPS,
  WIZ_CHECKBOX_OVERRIDE_LABEL_PROPS,
  WIZ_CHECKBOX_OVERRIDE_TITLE_PROPS,
  WIZ_CHECKBOX_META_LOSE_HELPER,
  WIZ_CHECKBOX_META_LOSE_LABEL,
  WIZ_CHECKBOX_META_LOSE_TITLE,
  WIZ_CHECKBOX_SUBMIT_ERROR,
  WIZ_CHECKBOX_YUP_META_HELPER,
  WIZ_CHECKBOX_YUP_META_LABEL,
  WIZ_CHECKBOX_YUP_META_TITLE,
  WIZ_CHECKBOX_VALUE_STATUS_LABEL,
  WIZ_CHECKBOX_EXPLICIT_HELPER,
  WIZ_CHECKBOX_EXPLICIT_LABEL,
  WIZ_CHECKBOX_EXPLICIT_TITLE,
} from './WizCheckbox.story-data';
export {
  WIZ_CHECKBOX_SOLO_CONTROL_STATUS,
  WIZ_CHECKBOX_OVERRIDE_HELPER_PROPS,
  WIZ_CHECKBOX_OVERRIDE_LABEL_PROPS,
  WIZ_CHECKBOX_OVERRIDE_TITLE_PROPS,
  WIZ_CHECKBOX_META_LOSE_HELPER,
  WIZ_CHECKBOX_META_LOSE_LABEL,
  WIZ_CHECKBOX_META_LOSE_TITLE,
  WIZ_CHECKBOX_SUBMIT_ERROR,
  WIZ_CHECKBOX_YUP_META_HELPER,
  WIZ_CHECKBOX_YUP_META_LABEL,
  WIZ_CHECKBOX_YUP_META_TITLE,
  WIZ_CHECKBOX_VALUE_STATUS_LABEL,
  WIZ_CHECKBOX_EXPLICIT_HELPER,
  WIZ_CHECKBOX_EXPLICIT_LABEL,
  WIZ_CHECKBOX_EXPLICIT_TITLE,
} from './WizCheckbox.story-data';
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
