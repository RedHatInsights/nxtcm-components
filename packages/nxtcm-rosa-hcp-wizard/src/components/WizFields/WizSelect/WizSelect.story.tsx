import {
  WIZ_SELECT_RECONCILE_REPLACE_OPTIONS,
  WIZ_SELECT_RECONCILE_STATUS,
  WIZ_SELECT_CONTROL_ONLY_STATUS,
  WIZ_SELECT_OVERRIDE_HELPER,
  WIZ_SELECT_OVERRIDE_LABEL,
  WIZ_SELECT_META_LOSER_HELPER,
  WIZ_SELECT_META_LOSER_LABEL,
  WIZ_SELECT_VPC_SUBNET_FORM_VALUE_LABEL,
  WIZ_SELECT_DEFER_REVEAL_BUTTON,
  WIZ_SELECT_TYPEAHEAD_CLEAR_STATUS,
  WIZ_SELECT_SUBMIT_ERROR,
  WIZ_SELECT_YUP_META_HELPER,
  WIZ_SELECT_YUP_META_LABEL,
  WIZ_SELECT_VALUE_STATUS_LABEL,
  WIZ_SELECT_EXPLICIT_HELPER,
  WIZ_SELECT_EXPLICIT_LABEL,
} from './WizSelect.story-data';
export {
  WIZ_SELECT_RECONCILE_REPLACE_OPTIONS,
  WIZ_SELECT_RECONCILE_STATUS,
  WIZ_SELECT_RECONCILE_TOGGLE,
  WIZ_SELECT_CONTROL_ONLY_STATUS,
  WIZ_SELECT_ONLY_CONTROL_TOGGLE,
  WIZ_SELECT_NUMERIC_TOGGLE,
  WIZ_SELECT_OVERRIDE_HELPER,
  WIZ_SELECT_OVERRIDE_LABEL,
  WIZ_SELECT_META_LOSER_HELPER,
  WIZ_SELECT_META_LOSER_LABEL,
  WIZ_SELECT_VPC_SUBNET_FORM_VALUE_LABEL,
  WIZ_SELECT_NESTED_LABEL_TOGGLE,
  WIZ_SELECT_DEFER_REVEAL_BUTTON,
  WIZ_SELECT_TYPEAHEAD_CLEAR_STATUS,
  WIZ_SELECT_TYPEAHEAD_CLEAR_TOGGLE,
  WIZ_SELECT_SUBMIT_TOGGLE_NAME,
  WIZ_SELECT_EXPLICIT_TOGGLE_NAME,
  WIZ_SELECT_SUBMIT_ERROR,
  WIZ_SELECT_YUP_META_HELPER,
  WIZ_SELECT_YUP_META_LABEL,
  WIZ_SELECT_VALUE_STATUS_LABEL,
  WIZ_SELECT_EXPLICIT_HELPER,
  WIZ_SELECT_EXPLICIT_LABEL,
} from './WizSelect.story-data';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { STEP_IDS } from '../../../constants';
import {
  RosaHcpWizardValidationProvider,
  useRosaHcpWizardValidation,
} from '../../../rosaHcpWizardValidationContext';

import {
  WizCtWatchStatus,
  formatWatchValue,
  wizCtSubmitValidationPreview,
  withRosaCt,
} from '../wizFieldCtSpecHelpers';
import { WizSelect } from './WizSelect';

const WIZ_SELECT_SUBMIT_DEMO_LABEL = 'Region (submit demo)';

const deferValidationSchema = yup.object({
  region: yup.string().required(WIZ_SELECT_SUBMIT_ERROR).default('').meta({
    id: 'region',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
  }),
});

type DeferValidationFormValues = yup.InferType<typeof deferValidationSchema>;

function WizSelectDeferValidationRevealButton() {
  const { markValidationAttempted } = useRosaHcpWizardValidation();
  return (
    <Button type="button" onClick={() => markValidationAttempted(STEP_IDS.DETAILS)}>
      {WIZ_SELECT_DEFER_REVEAL_BUTTON}
    </Button>
  );
}

/** onTouched form mirroring the wizard: required select errors wait for Next / step change. */
export function WizSelectDeferValidationHarness() {
  const methods = useForm<DeferValidationFormValues>({
    resolver: yupResolver(deferValidationSchema),
    defaultValues: { region: '' },
    mode: 'onTouched',
  });

  return withRosaCt(
    <RosaHcpWizardValidationProvider>
      <FormProvider {...methods}>
        <Form>
          <WizSelect<DeferValidationFormValues>
            name="region"
            schema={deferValidationSchema}
            label="Region"
            options={['us-east-1', 'eu-west-1']}
            isTypeAhead
          />
          <WizSelectDeferValidationRevealButton />
        </Form>
      </FormProvider>
    </RosaHcpWizardValidationProvider>
  );
}

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
          format={formatWatchValue}
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
          format={formatWatchValue}
        />
      </Form>
    </FormProvider>
  );
}

const selectPropsOverrideMetaSchema = yup.object({
  sku: yup.string().meta({
    label: WIZ_SELECT_META_LOSER_LABEL,
    helperText: WIZ_SELECT_META_LOSER_HELPER,
  }),
});

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
          format={formatWatchValue}
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
        format={formatWatchValue}
      />
    </>
  );
}

const optionsReconcileSchema = yup.object({
  region: yup.string().default('').meta({
    id: 'region',
    stepId: 'wiz-select-reconcile-ct',
    fieldType: 'select',
    reconcileValueWithOptions: true,
  }),
});

type OptionsReconcileFormValues = yup.InferType<typeof optionsReconcileSchema>;

const WIZ_SELECT_RECONCILE_LABEL = 'Region for reconcile';

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
          format={formatWatchValue}
        />
        <Button type="button" onClick={() => setOptions(['us-east-1'])}>
          {WIZ_SELECT_RECONCILE_REPLACE_OPTIONS}
        </Button>
      </Form>
    </FormProvider>
  );
}
