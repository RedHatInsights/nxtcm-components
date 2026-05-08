import { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Form } from '@patternfly/react-core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { WizCheckbox } from './WizCheckbox';
type FormValues = {
  enableAdvanced: boolean;
  acceptTerms: boolean;
};
// @ts-expect-error - Yup schema is not typed
const schema: yup.ObjectSchema<FormValues> = yup.object({
  enableAdvanced: yup.boolean().required(),
  acceptTerms: yup
    .boolean()
    .when('enableAdvanced', {
      is: true,
      then: (s) => s.oneOf([true], 'You must accept terms when Advanced is enabled.'),
      otherwise: (s) => s.notRequired(),
    })
    .meta({
      label: 'I accept the terms',
      helperText: 'Required only when Advanced mode is on.',
    }),
});
export function SimpleCheckboxYupExample() {
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { enableAdvanced: false, acceptTerms: false },
    mode: 'onSubmit',
  });
  const enableAdvanced = methods.watch('enableAdvanced');
  // This is the key: pass current form values so Yup resolves `.when(...)` correctly
  const yupDescribeOptions = useMemo(
    () => ({ value: methods.getValues() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableAdvanced, methods]
  );
  return (
    <FormProvider {...methods}>
      {/* eslint-disable-next-line no-console, @typescript-eslint/no-misused-promises */}
      <Form onSubmit={methods.handleSubmit((data) => console.log('submit', data))}>
        <WizCheckbox name="enableAdvanced" label="Enable advanced mode" schema={schema} />
        <WizCheckbox name="acceptTerms" schema={schema} yupDescribeOptions={yupDescribeOptions} />
        <Button type="submit" className="pf-v6-u-mt-md">
          Submit
        </Button>
      </Form>
    </FormProvider>
  );
}
