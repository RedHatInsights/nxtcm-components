import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  WizCtWatchStatus,
  wizCtSubmitValidationPreview,
  withRosaCt,
} from '../wizFieldCtSpecHelpers';
import { WizSelect } from './WizSelect';

export const WIZ_SELECT_EXPLICIT_LABEL = 'Explicit region label';
export const WIZ_SELECT_EXPLICIT_HELPER = 'Explicit helper text.';
export const WIZ_SELECT_VALUE_STATUS_LABEL = 'region form value';

export const WIZ_SELECT_YUP_META_LABEL = 'Yup meta zone label';
export const WIZ_SELECT_YUP_META_HELPER = 'Yup meta helper text for zone select.';

export const WIZ_SELECT_SUBMIT_ERROR = 'Please choose a region to continue.';

export const WIZ_SELECT_SUBMIT_DEMO_LABEL = 'Region (submit demo)';

export const WIZ_SELECT_EXPLICIT_TOGGLE_NAME = /select the explicit region label/i;

export const WIZ_SELECT_SUBMIT_TOGGLE_NAME = /select the region \(submit demo\)/i;

export const WIZ_SELECT_TYPEAHEAD_CLEAR_TOGGLE = /select the region/i;
export const WIZ_SELECT_TYPEAHEAD_CLEAR_STATUS = 'region value after typeahead clear';

type ExplicitFormValues = { region?: string };

export function WizSelectExplicitHarness() {
  const methods = useForm<ExplicitFormValues>({
    defaultValues: { region: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizSelect<ExplicitFormValues>
          name="region"
          id="wiz-select-ct-explicit"
          label={WIZ_SELECT_EXPLICIT_LABEL}
          helperText={WIZ_SELECT_EXPLICIT_HELPER}
          options={['us-east-1', 'eu-west-1']}
          isTypeAhead={false}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="region"
          ariaLabel={WIZ_SELECT_VALUE_STATUS_LABEL}
          format={(v) => (v === undefined || v === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

const yupMetaSchema = yup.object({
  zone: yup.string().meta({
    id: 'wiz-select-ct-yup-meta',
    label: WIZ_SELECT_YUP_META_LABEL,
    helperText: WIZ_SELECT_YUP_META_HELPER,
  }),
});

type YupMetaFormValues = yup.InferType<typeof yupMetaSchema>;

export function WizSelectYupMetaHarness() {
  const methods = useForm<YupMetaFormValues>({
    defaultValues: { zone: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizSelect<YupMetaFormValues>
          name="zone"
          schema={yupMetaSchema}
          options={['a', 'b']}
          isTypeAhead={false}
        />
      </Form>
    </FormProvider>
  );
}

type SubmitValidationFormValues = { region?: string };

const submitValidationSchema: yup.ObjectSchema<SubmitValidationFormValues> = yup.object({
  region: yup.string().required(WIZ_SELECT_SUBMIT_ERROR),
});

export function WizSelectSubmitValidationHarness() {
  const methods = useForm<SubmitValidationFormValues>({
    resolver: yupResolver(submitValidationSchema),
    defaultValues: { region: undefined },
    mode: 'onSubmit',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form onSubmit={wizCtSubmitValidationPreview(methods)}>
        <WizSelect<SubmitValidationFormValues>
          name="region"
          schema={submitValidationSchema}
          label={WIZ_SELECT_SUBMIT_DEMO_LABEL}
          options={['us-east-1', 'eu-west-1']}
          isTypeAhead={false}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </FormProvider>
  );
}

type NestedVpcFormValues = {
  vpc: {
    subnet?: string;
  };
};

export const WIZ_SELECT_NESTED_LABEL_TOGGLE = /select the subnet/i;

/** `aria-label` on the live value readout for {@link WizSelectNestedFallbackHarness}. */
export const WIZ_SELECT_VPC_SUBNET_FORM_VALUE_LABEL = 'vpc subnet form value';

export function WizSelectNestedFallbackHarness() {
  const methods = useForm<NestedVpcFormValues>({
    defaultValues: { vpc: { subnet: undefined } },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizSelect<NestedVpcFormValues>
          name="vpc.subnet"
          options={['subnet-a', 'subnet-b']}
          isTypeAhead={false}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="vpc.subnet"
          ariaLabel={WIZ_SELECT_VPC_SUBNET_FORM_VALUE_LABEL}
          format={(v) => (v === undefined || v === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

export const WIZ_SELECT_META_LOSER_LABEL = 'Yup selects this unless overridden';
export const WIZ_SELECT_META_LOSER_HELPER = 'Hidden when explicit helper wins';

const selectPropsOverrideMetaSchema = yup.object({
  sku: yup.string().meta({
    label: WIZ_SELECT_META_LOSER_LABEL,
    helperText: WIZ_SELECT_META_LOSER_HELPER,
  }),
});

export const WIZ_SELECT_OVERRIDE_LABEL = 'Override select label beats Yup';
export const WIZ_SELECT_OVERRIDE_HELPER = 'Override helper beats Yup';

type SkuSelectFormValues = yup.InferType<typeof selectPropsOverrideMetaSchema>;

export function WizSelectExplicitPropsOverrideMetaHarness() {
  const methods = useForm<SkuSelectFormValues>({
    defaultValues: { sku: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizSelect<SkuSelectFormValues>
          name="sku"
          schema={selectPropsOverrideMetaSchema}
          label={WIZ_SELECT_OVERRIDE_LABEL}
          helperText={WIZ_SELECT_OVERRIDE_HELPER}
          options={['small', 'large']}
          isTypeAhead={false}
        />
      </Form>
    </FormProvider>
  );
}

const numericSelectMetaSchema = yup.object({
  qtyBucket: yup.string().meta({ label: 8 }),
});

type NumericLabelSelectValues = yup.InferType<typeof numericSelectMetaSchema>;

/** Placeholder stays “Select the 8…” after stringifying Yup’s numeric meta label. */
export const WIZ_SELECT_NUMERIC_TOGGLE = /select the 8/i;

export function WizSelectNumericMetaLabelHarness() {
  const methods = useForm<NumericLabelSelectValues>({
    defaultValues: { qtyBucket: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizSelect<NumericLabelSelectValues>
          name="qtyBucket"
          schema={numericSelectMetaSchema}
          options={['x', 'y']}
          isTypeAhead={false}
        />
      </Form>
    </FormProvider>
  );
}

type ControlOnlyVpcValues = {
  vpcId?: string;
};

export const WIZ_SELECT_ONLY_CONTROL_TOGGLE = /select the vpc identifier/i;
export const WIZ_SELECT_CONTROL_ONLY_STATUS = 'vpcId control prop status';

type TypeaheadClearFormValues = { region: string };

/** Mirrors Details step typeahead selects: Yup default `''`, clear via toggle X. */
export function WizSelectTypeaheadClearHarness() {
  const methods = useForm<TypeaheadClearFormValues>({
    defaultValues: { region: '' },
    mode: 'onTouched',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizSelect<TypeaheadClearFormValues>
          name="region"
          label="Region"
          options={['us-east-1', 'eu-west-1']}
          isTypeAhead
        />
        <WizCtWatchStatus
          control={methods.control}
          name="region"
          ariaLabel={WIZ_SELECT_TYPEAHEAD_CLEAR_STATUS}
          format={(v) => (v === undefined || v === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

/** No surrounding FormProvider — uses `control` from `useForm` via the prop. */
export function WizSelectExplicitControlOnlyHarness() {
  const methods = useForm<ControlOnlyVpcValues>({
    defaultValues: { vpcId: undefined },
  });

  return withRosaCt(
    <>
      <WizSelect<ControlOnlyVpcValues>
        control={methods.control}
        name="vpcId"
        label="VPC identifier"
        options={['alpha', 'bravo']}
        isTypeAhead={false}
      />
      <WizCtWatchStatus
        control={methods.control}
        name="vpcId"
        ariaLabel={WIZ_SELECT_CONTROL_ONLY_STATUS}
        format={(v) => (v === undefined || v === '' ? '(empty)' : String(v))}
      />
    </>
  );
}

const optionsReconcileSchema = yup.object({
  region: yup.string().default(''),
});

type OptionsReconcileFormValues = yup.InferType<typeof optionsReconcileSchema>;

const WIZ_SELECT_RECONCILE_LABEL = 'Region for reconcile';
export const WIZ_SELECT_RECONCILE_TOGGLE = /select the region for reconcile/i;
export const WIZ_SELECT_RECONCILE_STATUS = 'region reconcile form value';
export const WIZ_SELECT_RECONCILE_REPLACE_OPTIONS = 'Replace region options';

/** Swaps option lists to exercise {@link useReconcileWizSelectValueWithOptions}. */
export function WizSelectOptionsReconcileHarness() {
  const [options, setOptions] = useState<string[]>(['us-east-1', 'eu-west-1']);
  const methods = useForm<OptionsReconcileFormValues>({
    defaultValues: { region: '' },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizSelect<OptionsReconcileFormValues>
          name="region"
          schema={optionsReconcileSchema}
          label={WIZ_SELECT_RECONCILE_LABEL}
          options={options}
          isTypeAhead={false}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="region"
          ariaLabel={WIZ_SELECT_RECONCILE_STATUS}
          format={(v) => (v === undefined || v === '' ? '(empty)' : String(v))}
        />
        <Button type="button" onClick={() => setOptions(['us-east-1'])}>
          {WIZ_SELECT_RECONCILE_REPLACE_OPTIONS}
        </Button>
      </Form>
    </FormProvider>
  );
}
