import {
  WIZ_MULTI_API_ERROR_DETAIL,
  WIZ_MULTI_API_ERROR_FIELD_LABEL,
  WIZ_MULTI_CONTROL_ONLY_STATUS,
  WIZ_MULTI_EXPLICIT_HELPER,
  WIZ_MULTI_EXPLICIT_LABEL,
  WIZ_MULTI_SUBMIT_ERROR,
  WIZ_MULTI_VALUE_STATUS_LABEL,
  WIZ_MULTI_YUP_META_HELPER,
  WIZ_MULTI_YUP_META_LABEL,
} from './WizMultiSelect.story-data';
export {
  WIZ_MULTI_CONTROL_ONLY_STATUS,
  WIZ_MULTI_ONLY_CONTROL_TOGGLE,
  WIZ_MULTI_API_ERROR_FIELD_LABEL,
  WIZ_MULTI_API_ERROR_DETAIL,
  WIZ_MULTI_SUBMIT_TOGGLE_NAME,
  WIZ_MULTI_EXPLICIT_TOGGLE_NAME,
  WIZ_MULTI_SUBMIT_ERROR,
  WIZ_MULTI_YUP_META_HELPER,
  WIZ_MULTI_YUP_META_LABEL,
  WIZ_MULTI_VALUE_STATUS_LABEL,
  WIZ_MULTI_EXPLICIT_HELPER,
  WIZ_MULTI_EXPLICIT_LABEL,
} from './WizMultiSelect.story-data';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { MAX_SECURITY_GROUPS } from '../../../constants';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { buildClusterValidationSchemaContext } from '../../../utilities/buildClusterValidationSchemaContext';
import { securityGroupsWorkerSchema } from '../../../yupSchemas/machinePoolsFields';
import {
  withRosaCt,
  wizCtSubmitValidationPreview,
  WizCtWatchStatus,
} from '../wizFieldCtSpecHelpers';
import { WizMultiSelect } from './WizMultiSelect';
const WIZ_MULTI_SUBMIT_DEMO_LABEL = 'Tags (submit demo)';

type ExplicitMultiFormValues = { tags?: string[] };

/** Security-group selects use flat options and resource loading. */
export function WizMultiSelectExplicitHarness({ isLoading = false }: { isLoading?: boolean }) {
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
          isLoading={isLoading}
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

const securityGroupsSchema = yup.object({ security_groups_worker: securityGroupsWorkerSchema });
type SecurityGroupsFormValues = yup.InferType<typeof securityGroupsSchema>;
const securityGroupOptions = Array.from(
  { length: MAX_SECURITY_GROUPS + 1 },
  (_, i) => `sg-${i + 1}`
);

/** Mirrors EditSecurityGroups: optional selection, validated against the production limit. */
export function WizMultiSelectSecurityGroupsHarness() {
  const methods = useForm<SecurityGroupsFormValues>({
    resolver: yupResolver(securityGroupsSchema),
    context: buildClusterValidationSchemaContext({}, defaultRosaHcpWizardValidatorStrings),
    defaultValues: { security_groups_worker: [] },
    mode: 'onTouched',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form onSubmit={wizCtSubmitValidationPreview(methods)}>
        <WizMultiSelect<SecurityGroupsFormValues>
          name="security_groups_worker"
          schema={securityGroupsSchema}
          label="Security groups"
          options={securityGroupOptions}
          maxMenuHeight="300px"
        />
        <WizCtWatchStatus
          control={methods.control}
          name="security_groups_worker"
          ariaLabel="Selected security groups"
          format={(value) => String(Array.isArray(value) ? value.length : 0)}
        />
        <Button type="submit">Submit</Button>
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

export function WizMultiSelectApiErrorHarness({ options = ['sg-a'] }: { options?: string[] }) {
  const methods = useForm<ExplicitMultiFormValues>({
    defaultValues: { tags: [] },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizMultiSelect
          name="tags"
          label={WIZ_MULTI_API_ERROR_FIELD_LABEL}
          options={options}
          apiError={WIZ_MULTI_API_ERROR_DETAIL}
          onRefresh={() => undefined}
        />
      </Form>
    </FormProvider>
  );
}
