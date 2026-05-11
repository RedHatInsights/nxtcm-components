import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Radio } from '../../Fields/RadioGroup';
import {
  WizCtWatchStatus,
  wizCtSubmitValidationPreview,
  withRosaCt,
} from '../wizFieldCtSpecHelpers';
import { WizRadioGroup } from './WizRadioGroup';

export const WIZ_RADIO_GROUP_EXPLICIT_LABEL = 'Explicit radio group label';
export const WIZ_RADIO_GROUP_EXPLICIT_HELPER = 'Explicit helper text.';
export const WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL = 'Option Alpha';
export const WIZ_RADIO_GROUP_OPTION_BETA_LABEL = 'Option Beta';
export const WIZ_RADIO_GROUP_VALUE_STATUS_LABEL = 'tier form value';

export const WIZ_RADIO_GROUP_YUP_META_LABEL = 'Yup meta label';
export const WIZ_RADIO_GROUP_YUP_META_HELPER = 'Yup meta helper text.';

export const WIZ_RADIO_GROUP_SUBMIT_ERROR = 'Choose a tier.';

type ExplicitFormValues = { tier?: string };

export function WizRadioGroupExplicitHarness() {
  const methods = useForm<ExplicitFormValues>({
    defaultValues: { tier: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizRadioGroup<ExplicitFormValues>
          name="tier"
          id="wiz-radio-group-ct-explicit"
          label={WIZ_RADIO_GROUP_EXPLICIT_LABEL}
          helperText={WIZ_RADIO_GROUP_EXPLICIT_HELPER}
        >
          <Radio id="wiz-radio-alpha" label={WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL} value="alpha" />
          <Radio id="wiz-radio-beta" label={WIZ_RADIO_GROUP_OPTION_BETA_LABEL} value="beta" />
        </WizRadioGroup>
        <WizCtWatchStatus
          control={methods.control}
          name="tier"
          ariaLabel={WIZ_RADIO_GROUP_VALUE_STATUS_LABEL}
          format={(v) => (v === undefined || v === null || v === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

const yupMetaSchema = yup.object({
  channel: yup.string().meta({
    id: 'wiz-radio-group-ct-yup-meta',
    label: WIZ_RADIO_GROUP_YUP_META_LABEL,
    helperText: WIZ_RADIO_GROUP_YUP_META_HELPER,
  }),
});

type YupMetaFormValues = yup.InferType<typeof yupMetaSchema>;

export function WizRadioGroupYupMetaHarness() {
  const methods = useForm<YupMetaFormValues>({
    defaultValues: { channel: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizRadioGroup<YupMetaFormValues> name="channel" schema={yupMetaSchema}>
          <Radio id="wiz-radio-stable" label="Stable" value="stable" />
          <Radio id="wiz-radio-fast" label="Fast" value="fast" />
        </WizRadioGroup>
      </Form>
    </FormProvider>
  );
}

type SubmitValidationFormValues = { tier?: string };

const submitValidationSchema: yup.ObjectSchema<SubmitValidationFormValues> = yup.object({
  tier: yup
    .string()
    .oneOf(['alpha', 'beta'], WIZ_RADIO_GROUP_SUBMIT_ERROR)
    .required(WIZ_RADIO_GROUP_SUBMIT_ERROR),
});

export const WIZ_RADIO_GROUP_SUBMIT_DEMO_LABEL = 'Tier (submit demo)';

export function WizRadioGroupSubmitValidationHarness() {
  const methods = useForm<SubmitValidationFormValues>({
    resolver: yupResolver(submitValidationSchema),
    defaultValues: { tier: undefined },
    mode: 'onSubmit',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form onSubmit={wizCtSubmitValidationPreview(methods)}>
        <WizRadioGroup<SubmitValidationFormValues>
          name="tier"
          schema={submitValidationSchema}
          label={WIZ_RADIO_GROUP_SUBMIT_DEMO_LABEL}
        >
          <Radio
            id="wiz-radio-submit-alpha"
            label={WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL}
            value="alpha"
          />
          <Radio
            id="wiz-radio-submit-beta"
            label={WIZ_RADIO_GROUP_OPTION_BETA_LABEL}
            value="beta"
          />
        </WizRadioGroup>
        <Button type="submit">Submit</Button>
      </Form>
    </FormProvider>
  );
}

type NestedPlanFormValues = {
  plan: {
    target?: string;
  };
};

export const WIZ_RADIO_GROUP_NESTED_STATUS_LABEL = 'plan target radios';

export function WizRadioGroupNestedFallbackHarness() {
  const methods = useForm<NestedPlanFormValues>({
    defaultValues: { plan: { target: undefined } },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizRadioGroup<NestedPlanFormValues> name="plan.target">
          <Radio id="wiz-radio-plan-a" label="Plan target option one" value="one" />
          <Radio id="wiz-radio-plan-b" label="Plan target option two" value="two" />
        </WizRadioGroup>
        <WizCtWatchStatus
          control={methods.control}
          name="plan.target"
          ariaLabel={WIZ_RADIO_GROUP_NESTED_STATUS_LABEL}
          format={(v) => (v === undefined || v === '' ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

export const WIZ_RADIO_GROUP_META_LABEL_LOSS = 'Meta radio label loser';
export const WIZ_RADIO_GROUP_META_HELPER_LOSS = 'Meta radio helper loser';

const radioPropsOverrideMetaSchema = yup.object({
  sizing: yup.string().meta({
    label: WIZ_RADIO_GROUP_META_LABEL_LOSS,
    helperText: WIZ_RADIO_GROUP_META_HELPER_LOSS,
  }),
});

export const WIZ_RADIO_GROUP_OVERRIDE_RADIO_LABEL_WIN = 'Override radio label wins';
export const WIZ_RADIO_GROUP_OVERRIDE_RADIO_HELPER_WIN = 'Override radio helper wins';

type SizingRadioFormValues = yup.InferType<typeof radioPropsOverrideMetaSchema>;

export function WizRadioGroupExplicitPropsOverrideMetaHarness() {
  const methods = useForm<SizingRadioFormValues>({
    defaultValues: { sizing: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizRadioGroup<SizingRadioFormValues>
          name="sizing"
          schema={radioPropsOverrideMetaSchema}
          label={WIZ_RADIO_GROUP_OVERRIDE_RADIO_LABEL_WIN}
          helperText={WIZ_RADIO_GROUP_OVERRIDE_RADIO_HELPER_WIN}
        >
          <Radio id="wiz-radio-small" label="Small" value="s" />
          <Radio id="wiz-radio-big" label="Big" value="l" />
        </WizRadioGroup>
      </Form>
    </FormProvider>
  );
}

const numericRadioMetaSchema = yup.object({
  lane: yup.string().meta({ label: 909 }),
});

type NumericRadioFormValues = yup.InferType<typeof numericRadioMetaSchema>;

export function WizRadioGroupNumericMetaLabelHarness() {
  const methods = useForm<NumericRadioFormValues>({
    defaultValues: { lane: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizRadioGroup<NumericRadioFormValues> name="lane" schema={numericRadioMetaSchema}>
          <Radio id="wiz-radio-lane-fast" label="Fast lane radio" value="fast" />
        </WizRadioGroup>
      </Form>
    </FormProvider>
  );
}

export const WIZ_RADIO_GROUP_CONTROL_ONLY_STATUS = 'solo radio field';

type SoloRadioValues = {
  tier?: string;
};

export function WizRadioGroupExplicitControlOnlyHarness() {
  const methods = useForm<SoloRadioValues>({
    defaultValues: { tier: undefined },
  });

  return withRosaCt(
    <>
      <WizRadioGroup<SoloRadioValues>
        control={methods.control}
        name="tier"
        label="Standalone tier radios"
      >
        <Radio id="wiz-radio-tier-a" label="Tier standalone A" value="a-standalone" />
        <Radio id="wiz-radio-tier-b" label="Tier standalone B" value="b-standalone" />
      </WizRadioGroup>
      <WizCtWatchStatus
        control={methods.control}
        name="tier"
        ariaLabel={WIZ_RADIO_GROUP_CONTROL_ONLY_STATUS}
        format={(v) => (v === undefined || v === '' ? '(empty)' : String(v))}
      />
    </>
  );
}
