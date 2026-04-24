import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useFormContext } from 'react-hook-form';
import type { SimpleWizardFormValues } from '../simpleWizardForm';

const entries: { label: string; read: (v: SimpleWizardFormValues) => string }[] = [
  { label: 'Full name', read: (v) => v.required.stepA.fullName },
  { label: 'Selection A-1', read: (v) => v.required.stepA.selectionA1 },
  { label: 'Selection A-2', read: (v) => v.required.stepA.selectionA2 },
  { label: 'Selection A-3', read: (v) => v.required.stepA.selectionA3 },
  { label: 'Selection B-1', read: (v) => v.required.stepB.selectionB1 },
  { label: 'Selection B-2', read: (v) => v.required.stepB.selectionB2 },
  { label: 'Selection B-3', read: (v) => v.required.stepB.selectionB3 },
  { label: 'Selection C-1', read: (v) => v.required.stepC.selectionC1 },
  { label: 'Selection C-2', read: (v) => v.required.stepC.selectionC2 },
  { label: 'Selection C-3', read: (v) => v.required.stepC.selectionC3 },
  { label: 'Selection D-1', read: (v) => v.required.stepD.selectionD1 },
  { label: 'Selection D-2', read: (v) => v.required.stepD.selectionD2 },
  { label: 'Selection D-3', read: (v) => v.required.stepD.selectionD3 },
  { label: 'Option text 1', read: (v) => v.optional.stepE.optionText1 },
  { label: 'Option text 2', read: (v) => v.optional.stepF.optionText2 },
];

const ReviewStep = () => {
  const { watch } = useFormContext<SimpleWizardFormValues>();
  const values = watch();

  return (
    <>
      <Content component="p">Review your choices, then click Finish to submit.</Content>
      <DescriptionList aria-label="Wizard values summary">
        {entries.map(({ label, read }) => {
          const raw = read(values);
          return (
            <DescriptionListGroup key={label}>
              <DescriptionListTerm>{label}</DescriptionListTerm>
              <DescriptionListDescription>
                {raw === '' ? '—' : String(raw)}
              </DescriptionListDescription>
            </DescriptionListGroup>
          );
        })}
      </DescriptionList>
    </>
  );
};

export default ReviewStep;
