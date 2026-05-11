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
import { WizNumberInput } from './WizNumberInput';

export const WIZ_NUMBER_INPUT_EXPLICIT_LABEL = 'Explicit number label';
export const WIZ_NUMBER_INPUT_EXPLICIT_HELPER = 'Explicit helper text.';
export const WIZ_NUMBER_INPUT_VALUE_STATUS_LABEL = 'nodeCount form value';

export const WIZ_NUMBER_INPUT_YUP_META_LABEL = 'Yup meta label';
export const WIZ_NUMBER_INPUT_YUP_META_HELPER = 'Yup meta helper text.';

export const WIZ_NUMBER_INPUT_SUBMIT_ERROR = 'Node count must be filled in.';

export const WIZ_NUMBER_INPUT_SUBMIT_DEMO_LABEL = 'Node count (submit demo)';

export const WIZ_NUMBER_INPUT_TOPOLOGY_POOL_STATUS_LABEL = 'topology pool spinbutton value';

type ExplicitFormValues = { nodeCount?: number };

export function WizNumberInputExplicitHarness() {
  const methods = useForm<ExplicitFormValues>({
    defaultValues: { nodeCount: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizNumberInput<ExplicitFormValues>
          name="nodeCount"
          id="wiz-number-input-ct-explicit"
          label={WIZ_NUMBER_INPUT_EXPLICIT_LABEL}
          helperText={WIZ_NUMBER_INPUT_EXPLICIT_HELPER}
          min={0}
        />
        <WizCtWatchStatus
          control={methods.control}
          name="nodeCount"
          ariaLabel={WIZ_NUMBER_INPUT_VALUE_STATUS_LABEL}
          format={(v) => (v === undefined || v === null ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

const yupMetaSchema = yup.object({
  replicas: yup.number().meta({
    id: 'wiz-number-input-ct-yup-meta',
    label: WIZ_NUMBER_INPUT_YUP_META_LABEL,
    helperText: WIZ_NUMBER_INPUT_YUP_META_HELPER,
  }),
});

type YupMetaFormValues = yup.InferType<typeof yupMetaSchema>;

export function WizNumberInputYupMetaHarness() {
  const methods = useForm<YupMetaFormValues>({
    defaultValues: { replicas: undefined },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizNumberInput<YupMetaFormValues> name="replicas" schema={yupMetaSchema} min={0} />
      </Form>
    </FormProvider>
  );
}

type SubmitValidationFormValues = { nodeCount?: number };

const submitValidationSchema: yup.ObjectSchema<SubmitValidationFormValues> = yup.object({
  nodeCount: yup
    .number()
    .typeError(WIZ_NUMBER_INPUT_SUBMIT_ERROR)
    .integer('Use a whole number.')
    .min(1, 'At least one node.')
    .required(WIZ_NUMBER_INPUT_SUBMIT_ERROR),
});

export function WizNumberInputSubmitValidationHarness() {
  const methods = useForm<SubmitValidationFormValues>({
    resolver: yupResolver(submitValidationSchema),
    defaultValues: { nodeCount: undefined },
    mode: 'onSubmit',
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form onSubmit={wizCtSubmitValidationPreview(methods)}>
        <WizNumberInput<SubmitValidationFormValues>
          name="nodeCount"
          schema={submitValidationSchema}
          label={WIZ_NUMBER_INPUT_SUBMIT_DEMO_LABEL}
          min={1}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </FormProvider>
  );
}

type NestedTopologyFormValues = {
  topology: {
    poolSize?: number;
  };
};

export function WizNumberInputNestedFallbackHarness() {
  const methods = useForm<NestedTopologyFormValues>({
    defaultValues: { topology: { poolSize: undefined } },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizNumberInput<NestedTopologyFormValues> name="topology.poolSize" min={0} />
        <WizCtWatchStatus
          control={methods.control}
          name="topology.poolSize"
          ariaLabel={WIZ_NUMBER_INPUT_TOPOLOGY_POOL_STATUS_LABEL}
          format={(v) => (v === undefined || v === null ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

export const WIZ_NUMBER_INPUT_SLOT_STATUS_LABEL = 'slot counter value';

export function WizNumberInputMinusClearsHarness() {
  const methods = useForm<{ slots?: number }>({
    defaultValues: { slots: 2 },
  });

  return withRosaCt(
    <FormProvider {...methods}>
      <Form>
        <WizNumberInput<{ slots?: number }> name="slots" label="Slots counter" min={0} />
        <WizCtWatchStatus
          control={methods.control}
          name="slots"
          ariaLabel={WIZ_NUMBER_INPUT_SLOT_STATUS_LABEL}
          format={(v) => (v === undefined || v === null ? '(empty)' : String(v))}
        />
      </Form>
    </FormProvider>
  );
}

export const WIZ_NUMBER_INPUT_CONTROL_ONLY_LABEL = 'Control-only shards';
export const WIZ_NUMBER_INPUT_CONTROL_ONLY_STATUS = 'shard count status';

type ShardCounterValues = { shards?: number };

export function WizNumberInputExplicitControlOnlyHarness() {
  const methods = useForm<ShardCounterValues>({
    defaultValues: { shards: undefined },
  });

  return withRosaCt(
    <>
      <WizNumberInput<ShardCounterValues>
        control={methods.control}
        name="shards"
        label={WIZ_NUMBER_INPUT_CONTROL_ONLY_LABEL}
        min={0}
      />
      <WizCtWatchStatus
        control={methods.control}
        name="shards"
        ariaLabel={WIZ_NUMBER_INPUT_CONTROL_ONLY_STATUS}
        format={(v) => (v === undefined || v === null ? '(empty)' : String(v))}
      />
    </>
  );
}
