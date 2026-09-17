import {
  WIZ_RADIO_GROUP_HIDE_LABEL_YUP_LABEL,
  WIZ_RADIO_GROUP_CONTROL_ONLY_STATUS,
  WIZ_RADIO_GROUP_OVERRIDE_RADIO_HELPER_WIN,
  WIZ_RADIO_GROUP_OVERRIDE_RADIO_LABEL_WIN,
  WIZ_RADIO_GROUP_META_HELPER_LOSS,
  WIZ_RADIO_GROUP_META_LABEL_LOSS,
  WIZ_RADIO_GROUP_NESTED_STATUS_LABEL,
  WIZ_RADIO_GROUP_SUBMIT_ERROR,
  WIZ_RADIO_GROUP_YUP_META_HELPER,
  WIZ_RADIO_GROUP_YUP_META_LABEL,
  WIZ_RADIO_GROUP_VALUE_STATUS_LABEL,
  WIZ_RADIO_GROUP_OPTION_BETA_LABEL,
  WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL,
  WIZ_RADIO_GROUP_EXPLICIT_HELPER,
  WIZ_RADIO_GROUP_EXPLICIT_LABEL,
} from './WizRadioGroup.story-data';
export {
  WIZ_RADIO_GROUP_HIDE_LABEL_YUP_LABEL,
  WIZ_RADIO_GROUP_CONTROL_ONLY_STATUS,
  WIZ_RADIO_GROUP_OVERRIDE_RADIO_HELPER_WIN,
  WIZ_RADIO_GROUP_OVERRIDE_RADIO_LABEL_WIN,
  WIZ_RADIO_GROUP_META_HELPER_LOSS,
  WIZ_RADIO_GROUP_META_LABEL_LOSS,
  WIZ_RADIO_GROUP_NESTED_STATUS_LABEL,
  WIZ_RADIO_GROUP_SUBMIT_ERROR,
  WIZ_RADIO_GROUP_YUP_META_HELPER,
  WIZ_RADIO_GROUP_YUP_META_LABEL,
  WIZ_RADIO_GROUP_VALUE_STATUS_LABEL,
  WIZ_RADIO_GROUP_OPTION_BETA_LABEL,
  WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL,
  WIZ_RADIO_GROUP_EXPLICIT_HELPER,
  WIZ_RADIO_GROUP_EXPLICIT_LABEL,
} from './WizRadioGroup.story-data';
import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Radio } from '../../Fields/RadioGroup';
import {
  WizCtWatchStatus,
  formatWatchValue,
  wizCtSubmitValidationPreview,
  withRosaCt,
} from '../wizFieldCtSpecHelpers';
import { WizRadioGroup } from './WizRadioGroup';

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
          format={formatWatchValue}
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

const WIZ_RADIO_GROUP_SUBMIT_DEMO_LABEL = 'Tier (submit demo)';

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
          format={formatWatchValue}
        />
      </Form>
    </FormProvider>
  );
}

const radioPropsOverrideMetaSchema = yup.object({
  sizing: yup.string().meta({
    label: WIZ_RADIO_GROUP_META_LABEL_LOSS,
    helperText: WIZ_RADIO_GROUP_META_HELPER_LOSS,
  }),
});

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

type SoloRadioValues = {
  tier?: string;
};

const hideLabelYupSchema = yup.object({
  mode: yup.string().meta({
    label: WIZ_RADIO_GROUP_HIDE_LABEL_YUP_LABEL,
  }),
});

type HideLabelFormValues = yup.InferType<typeof hideLabelYupSchema>;

export function WizRadioGroupHideLabelHarness() {
  const methods = useForm<HideLabelFormValues>({
    defaultValues: { mode: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizRadioGroup<HideLabelFormValues> name="mode" schema={hideLabelYupSchema} hideLabel>
          <Radio id="wiz-radio-hide-a" label="Hidden label option A" value="a" />
          <Radio id="wiz-radio-hide-b" label="Hidden label option B" value="b" />
        </WizRadioGroup>
      </Form>
    </FormProvider>
  );
}

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
        format={formatWatchValue}
      />
    </>
  );
}
