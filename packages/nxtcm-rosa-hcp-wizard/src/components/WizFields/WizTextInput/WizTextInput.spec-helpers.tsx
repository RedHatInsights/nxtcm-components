import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  WizCtWatchStatus,
  wizCtSubmitValidationPreview,
  withRosaCt,
} from '../wizFieldCtSpecHelpers';
import { WizTextInput } from './WizTextInput';

export const WIZ_TEXT_INPUT_EXPLICIT_LABEL = 'Explicit text label';
export const WIZ_TEXT_INPUT_EXPLICIT_HELPER = 'Explicit helper text.';
export const WIZ_TEXT_INPUT_VALUE_STATUS_LABEL = 'notes form value';

export const WIZ_TEXT_INPUT_YUP_META_LABEL = 'Yup meta label';
export const WIZ_TEXT_INPUT_YUP_META_HELPER = 'Yup meta helper text.';

export const WIZ_TEXT_INPUT_SUBMIT_ERROR = 'Notes must be filled in.';
/** Label on the Yup submit harness textbox (explicit prop, not from meta). */
export const WIZ_TEXT_INPUT_SUBMIT_DEMO_LABEL = 'Notes (submit demo)';

type ExplicitFormValues = { notes: string };

export function WizTextInputExplicitHarness() {
  const methods = useForm<ExplicitFormValues>({
    defaultValues: { notes: '' },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizTextInput<ExplicitFormValues>
          name="notes"
          id="wiz-text-input-ct-explicit"
          label={WIZ_TEXT_INPUT_EXPLICIT_LABEL}
          helperText={WIZ_TEXT_INPUT_EXPLICIT_HELPER}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="notes"
          ariaLabel={WIZ_TEXT_INPUT_VALUE_STATUS_LABEL}
          format={(v) => ((v as string) === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

const yupMetaSchema = yup.object({
  summary: yup.string().meta({
    id: 'wiz-text-input-ct-yup-meta',
    label: WIZ_TEXT_INPUT_YUP_META_LABEL,
    helperText: WIZ_TEXT_INPUT_YUP_META_HELPER,
  }),
});

type YupMetaFormValues = yup.InferType<typeof yupMetaSchema>;

export function WizTextInputYupMetaHarness() {
  const methods = useForm<YupMetaFormValues>({
    defaultValues: { summary: '' },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizTextInput<YupMetaFormValues> name="summary" schema={yupMetaSchema} />
      </Form>
    </FormProvider>
  );
}

type SubmitValidationFormValues = { notes: string };

const submitValidationSchema: yup.ObjectSchema<SubmitValidationFormValues> = yup.object({
  notes: yup.string().trim().required(WIZ_TEXT_INPUT_SUBMIT_ERROR),
});

export function WizTextInputSubmitValidationHarness() {
  const methods = useForm<SubmitValidationFormValues>({
    resolver: yupResolver(submitValidationSchema),
    defaultValues: { notes: '' },
    mode: 'onSubmit',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form onSubmit={wizCtSubmitValidationPreview(methods)}>
        <WizTextInput<SubmitValidationFormValues>
          name="notes"
          schema={submitValidationSchema}
          label={WIZ_TEXT_INPUT_SUBMIT_DEMO_LABEL}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </FormProvider>
  );
}

type NestedGatewayFormValues = {
  gateway: {
    host: string;
  };
};

/** No Yup schema — exercises `wizFallbackFieldId` + `wizFallbackLabelFromFieldPath` for nested paths. */
export function WizTextInputNestedFallbackHarness() {
  const methods = useForm<NestedGatewayFormValues>({
    defaultValues: { gateway: { host: '' } },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizTextInput<NestedGatewayFormValues> name="gateway.host" />
      </Form>
    </FormProvider>
  );
}

export const WIZ_TEXT_INPUT_META_LOSER_LABEL = 'Label only via Yup meta (should lose)';
export const WIZ_TEXT_INPUT_META_LOSER_HELPER = 'Helper only via Yup meta (should lose)';

const propsOverrideMetaSchema = yup.object({
  slot: yup.string().meta({
    label: WIZ_TEXT_INPUT_META_LOSER_LABEL,
    helperText: WIZ_TEXT_INPUT_META_LOSER_HELPER,
  }),
});

export const WIZ_TEXT_INPUT_OVERRIDE_BEATS_META_LABEL = 'Explicit label beats Yup meta';
export const WIZ_TEXT_INPUT_OVERRIDE_BEATS_META_HELPER = 'Explicit helper beats Yup meta';

type PropsOverrideFormValues = yup.InferType<typeof propsOverrideMetaSchema>;

export function WizTextInputExplicitPropsOverrideMetaHarness() {
  const methods = useForm<PropsOverrideFormValues>({
    defaultValues: { slot: '' },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizTextInput<PropsOverrideFormValues>
          name="slot"
          schema={propsOverrideMetaSchema}
          label={WIZ_TEXT_INPUT_OVERRIDE_BEATS_META_LABEL}
          helperText={WIZ_TEXT_INPUT_OVERRIDE_BEATS_META_HELPER}
        />
      </Form>
    </FormProvider>
  );
}

const numericLabelSchema = yup.object({
  yearCode: yup.string().meta({ label: 2025 }),
});

type NumericLabelFormValues = yup.InferType<typeof numericLabelSchema>;

/** Yup `.meta()` may store numeric labels — `stringLabelFromYupMeta` stringifies them. */
export function WizTextInputNumericMetaLabelHarness() {
  const methods = useForm<NumericLabelFormValues>({
    defaultValues: { yearCode: '' },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizTextInput<NumericLabelFormValues> name="yearCode" schema={numericLabelSchema} />
      </Form>
    </FormProvider>
  );
}

export const WIZ_TEXT_INPUT_ALIAS_BLUR_ERROR = 'Alias is required after blur.';
export const WIZ_TEXT_INPUT_ALIAS_BLUR_LABEL = 'Alias (onBlur validation)';

export const WIZ_TEXT_INPUT_ALIAS_BLUR_PLACEHOLDER = /enter the alias \(onblur validation\)/i;

const blurAliasSchema: yup.ObjectSchema<{ alias: string }> = yup.object({
  alias: yup.string().required(WIZ_TEXT_INPUT_ALIAS_BLUR_ERROR),
});

export function WizTextInputBlurValidationHarness() {
  const methods = useForm<{ alias: string }>({
    resolver: yupResolver(blurAliasSchema),
    defaultValues: { alias: '' },
    mode: 'onTouched',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizTextInput
          name="alias"
          schema={blurAliasSchema}
          label={WIZ_TEXT_INPUT_ALIAS_BLUR_LABEL}
          validateOnBlur
        />
      </Form>
    </FormProvider>
  );
}

const optionalTagSchema = yup.object({
  tag: yup.string().optional(),
});

type TagFormValues = yup.InferType<typeof optionalTagSchema>;

/** Visible label for {@link WizTextInputExplicitIsRequiredHarness}; schema leaf stays optional(). */
export const WIZ_TEXT_INPUT_OPTIONAL_SCHEMA_REQUIRED_UI_LABEL =
  'Tag nevertheless required via prop';

/** Schema optional but `isRequired` prop stays true — UI required affordance wins. */
export function WizTextInputExplicitIsRequiredHarness() {
  const methods = useForm<TagFormValues>({
    defaultValues: { tag: '' },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizTextInput<TagFormValues>
          name="tag"
          schema={optionalTagSchema}
          label={WIZ_TEXT_INPUT_OPTIONAL_SCHEMA_REQUIRED_UI_LABEL}
          isRequired
        />
      </Form>
    </FormProvider>
  );
}

export const WIZ_TEXT_INPUT_REMOTE_ONLY_LABEL = 'Remote control field';
export const WIZ_TEXT_INPUT_REMOTE_ONLY_STATUS_LABEL = 'remote field form value';

type RemoteFieldValues = { remote: string };

export function WizTextInputExplicitControlOnlyHarness() {
  const methods = useForm<RemoteFieldValues>({
    defaultValues: { remote: '' },
  });

  return withRosaCt(
    <>
      <WizTextInput<RemoteFieldValues>
        control={methods.control}
        name="remote"
        label={WIZ_TEXT_INPUT_REMOTE_ONLY_LABEL}
      />
      <WizCtWatchStatus
        control={methods.control}
        name="remote"
        ariaLabel={WIZ_TEXT_INPUT_REMOTE_ONLY_STATUS_LABEL}
        format={(v) => ((v as string) === '' ? '(empty)' : String(v))}
      />
    </>
  );
}
