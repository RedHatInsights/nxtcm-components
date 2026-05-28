import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  WizCtWatchStatus,
  wizCtSubmitValidationPreview,
  withRosaCt,
} from '../wizFieldCtSpecHelpers';
import { WizMultiSelect } from './WizMultiSelect';

export const WIZ_MULTI_EXPLICIT_LABEL = 'Explicit multi label';
export const WIZ_MULTI_EXPLICIT_HELPER = 'Explicit multi helper.';
export const WIZ_MULTI_VALUE_STATUS_LABEL = 'multi form value';

export const WIZ_MULTI_YUP_META_LABEL = 'Yup meta tags label';
export const WIZ_MULTI_YUP_META_HELPER = 'Yup meta helper text for tags multiselect.';

export const WIZ_MULTI_SUBMIT_ERROR = 'Choose at least one value.';
export const WIZ_MULTI_SUBMIT_DEMO_LABEL = 'Tags (submit demo)';

export const WIZ_MULTI_EXPLICIT_TOGGLE_NAME = /select the explicit multi label/i;
export const WIZ_MULTI_SUBMIT_TOGGLE_NAME = /select the tags \(submit demo\)/i;

export const WIZ_MULTI_API_ERROR_DETAIL = 'VPC options failed to load.';
export const WIZ_MULTI_API_ERROR_FIELD_LABEL = 'Security groups';

export const WIZ_MULTI_ONLY_CONTROL_TOGGLE = /select the tag identifiers/i;
export const WIZ_MULTI_CONTROL_ONLY_STATUS = 'tags control prop status';

type ExplicitMultiFormValues = { tags?: string[] };

export function WizMultiSelectExplicitHarness() {
  const methods = useForm<ExplicitMultiFormValues>({
    defaultValues: { tags: [] },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizMultiSelect
          name="tags"
          id="wiz-multi-ct-explicit"
          label={WIZ_MULTI_EXPLICIT_LABEL}
          helperText={WIZ_MULTI_EXPLICIT_HELPER}
          options={['us-east-1', 'eu-west-1']}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="tags"
          ariaLabel={WIZ_MULTI_VALUE_STATUS_LABEL}
          format={(v) =>
            !Array.isArray(v) || v.length === 0 ? '(empty)' : (v as string[]).join(',')
          }
        />
      </Form>
    </FormProvider>
  );
}

const yupMetaSchema = yup.object({
  tags: yup.array().of(yup.string()).meta({
    id: 'wiz-multi-ct-yup-meta',
    label: WIZ_MULTI_YUP_META_LABEL,
    helperText: WIZ_MULTI_YUP_META_HELPER,
  }),
});

type YupMetaFormValues = yup.InferType<typeof yupMetaSchema>;

export function WizMultiSelectYupMetaHarness() {
  const methods = useForm<YupMetaFormValues>({
    defaultValues: { tags: [] },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizMultiSelect<YupMetaFormValues>
          name="tags"
          schema={yupMetaSchema}
          options={['alpha', 'bravo']}
        />
      </Form>
    </FormProvider>
  );
}

type SubmitMultiFormValues = { tags?: string[] };

const submitMultiSchema = yup.object({
  tags: yup.array().of(yup.string()).min(1, WIZ_MULTI_SUBMIT_ERROR),
}) as yup.ObjectSchema<SubmitMultiFormValues>;

export function WizMultiSelectSubmitValidationHarness() {
  const methods = useForm<SubmitMultiFormValues>({
    resolver: yupResolver(submitMultiSchema),
    defaultValues: { tags: [] },
    mode: 'onSubmit',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form onSubmit={wizCtSubmitValidationPreview(methods)}>
        <WizMultiSelect
          name="tags"
          id="wiz-multi-ct-submit"
          schema={submitMultiSchema}
          label={WIZ_MULTI_SUBMIT_DEMO_LABEL}
          options={['us-east-1', 'eu-west-1']}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </FormProvider>
  );
}

type ControlOnlyTagsValues = { tags?: string[] };

/** No surrounding FormProvider — uses `control` from `useForm` via the prop. */
export function WizMultiSelectExplicitControlOnlyHarness() {
  const methods = useForm<ControlOnlyTagsValues>({
    defaultValues: { tags: [] },
  });

  return withRosaCt(
    <>
      <WizMultiSelect<ControlOnlyTagsValues>
        control={methods.control}
        name="tags"
        id="wiz-multi-ct-control-only"
        label="Tag identifiers"
        options={['alpha', 'bravo']}
      />
      <WizCtWatchStatus
        control={methods.control}
        name="tags"
        ariaLabel={WIZ_MULTI_CONTROL_ONLY_STATUS}
        format={(v) =>
          !Array.isArray(v) || v.length === 0 ? '(empty)' : (v as string[]).join(',')
        }
      />
    </>
  );
}

export function WizMultiSelectApiErrorHarness() {
  const methods = useForm<ExplicitMultiFormValues>({
    defaultValues: { tags: [] },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizMultiSelect
          name="tags"
          label={WIZ_MULTI_API_ERROR_FIELD_LABEL}
          options={['sg-a']}
          apiError={WIZ_MULTI_API_ERROR_DETAIL}
          onRefresh={() => undefined}
        />
      </Form>
    </FormProvider>
  );
}
