import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { WizCtWatchStatus, wizCtSubmitValidationPreview } from '../wizFieldCtSpecHelpers';
import { WizFileUpload } from './WizFileUpload';

export const WIZ_FILE_UPLOAD_EXPLICIT_LABEL = 'Explicit pull secret label';
export const WIZ_FILE_UPLOAD_EXPLICIT_HELPER = 'Explicit helper text for file upload.';
export const WIZ_FILE_UPLOAD_VALUE_STATUS_LABEL = 'pullSecret form value';

export const WIZ_FILE_UPLOAD_YUP_META_LABEL = 'Yup meta file label';
export const WIZ_FILE_UPLOAD_YUP_META_HELPER = 'Yup meta helper text for file upload.';

export const WIZ_FILE_UPLOAD_SUBMIT_ERROR = 'Upload a pull secret file.';

type ExplicitFormValues = { pullSecret: string };

export function WizFileUploadExplicitHarness() {
  const methods = useForm<ExplicitFormValues>({
    defaultValues: { pullSecret: '' },
  });

  return (
    <FormProvider {...methods}>
      <Form>
        <WizFileUpload<ExplicitFormValues>
          name="pullSecret"
          id="wiz-fileupload-ct-explicit"
          label={WIZ_FILE_UPLOAD_EXPLICIT_LABEL}
          helperText={WIZ_FILE_UPLOAD_EXPLICIT_HELPER}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="pullSecret"
          ariaLabel={WIZ_FILE_UPLOAD_VALUE_STATUS_LABEL}
          format={(v) => ((v as string) === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

const yupMetaSchema = yup.object({
  pullSecret: yup.string().meta({
    id: 'wiz-fileupload-ct-yup-meta',
    label: WIZ_FILE_UPLOAD_YUP_META_LABEL,
    helperText: WIZ_FILE_UPLOAD_YUP_META_HELPER,
  }),
});

type YupMetaFormValues = yup.InferType<typeof yupMetaSchema>;

export function WizFileUploadYupMetaHarness() {
  const methods = useForm<YupMetaFormValues>({
    defaultValues: { pullSecret: '' },
  });

  return (
    <FormProvider {...methods}>
      <Form>
        <WizFileUpload<YupMetaFormValues> name="pullSecret" schema={yupMetaSchema} />
      </Form>
    </FormProvider>
  );
}

type SubmitValidationFormValues = { pullSecret: string };

const submitValidationSchema: yup.ObjectSchema<SubmitValidationFormValues> = yup.object({
  pullSecret: yup
    .string()
    .trim()
    .min(1, WIZ_FILE_UPLOAD_SUBMIT_ERROR)
    .required(WIZ_FILE_UPLOAD_SUBMIT_ERROR),
});

export function WizFileUploadSubmitValidationHarness() {
  const methods = useForm<SubmitValidationFormValues>({
    resolver: yupResolver(submitValidationSchema),
    defaultValues: { pullSecret: '' },
    mode: 'onSubmit',
  });

  return (
    <FormProvider {...methods}>
      <Form onSubmit={wizCtSubmitValidationPreview(methods)}>
        <WizFileUpload<SubmitValidationFormValues>
          name="pullSecret"
          schema={submitValidationSchema}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </FormProvider>
  );
}

type NestedBundleFormValues = {
  bundle: {
    manifest: string;
  };
};

export const WIZ_FILE_UPLOAD_NESTED_MANIFEST_STATUS = 'bundle manifest upload value';

export const WIZ_FILE_UPLOAD_NESTED_FIELD_LABEL = 'Nested manifest upload';

export function WizFileUploadNestedFallbackHarness() {
  const methods = useForm<NestedBundleFormValues>({
    defaultValues: { bundle: { manifest: '' } },
  });

  return (
    <FormProvider {...methods}>
      <Form>
        <WizFileUpload<NestedBundleFormValues>
          name="bundle.manifest"
          label={WIZ_FILE_UPLOAD_NESTED_FIELD_LABEL}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="bundle.manifest"
          ariaLabel={WIZ_FILE_UPLOAD_NESTED_MANIFEST_STATUS}
          format={(v) => ((v as string) === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

export const WIZ_FILE_UPLOAD_DOC_CLEAR_STATUS = 'clear-target document contents';

export function WizFileUploadClearViaButtonHarness() {
  const methods = useForm<{ docUpload: string }>({
    defaultValues: { docUpload: '' },
  });

  return (
    <FormProvider {...methods}>
      <Form>
        <WizFileUpload<{ docUpload: string }>
          name="docUpload"
          label="Document clear resets form state"
        />
        <WizCtWatchStatus
          control={methods.control}
          name="docUpload"
          ariaLabel={WIZ_FILE_UPLOAD_DOC_CLEAR_STATUS}
          format={(v) => ((v as string) === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

export const WIZ_FILE_UPLOAD_CONTROL_BODY_STATUS = 'control-only manifest body';

type ControlManifestBodyValues = { bodyText: string };

export function WizFileUploadExplicitControlOnlyHarness() {
  const methods = useForm<ControlManifestBodyValues>({
    defaultValues: { bodyText: '' },
  });

  return (
    <>
      <WizFileUpload<ControlManifestBodyValues>
        control={methods.control}
        name="bodyText"
        label="Uploaded body strictly via control"
      />
      <WizCtWatchStatus
        control={methods.control}
        name="bodyText"
        ariaLabel={WIZ_FILE_UPLOAD_CONTROL_BODY_STATUS}
        format={(v) => ((v as string) === '' ? '(empty)' : String(v))}
      />
    </>
  );
}
