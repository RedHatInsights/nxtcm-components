import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import type { FieldPath } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import type { SimpleWizardFormValues } from '../simpleWizardForm';
import { WizardStepForm } from '../WizardStepForm';

const entries: { path: FieldPath<SimpleWizardFormValues>; label: string }[] = [
  { path: 'required.stepA.fullName', label: 'Full name' },
  { path: 'required.stepA.selectionA1', label: 'Selection A-1' },
  { path: 'required.stepA.selectionA2', label: 'Selection A-2' },
  { path: 'required.stepA.selectionA3', label: 'Selection A-3' },
  { path: 'required.stepB.selectionB1', label: 'Selection B-1' },
  { path: 'required.stepB.selectionB2', label: 'Selection B-2' },
  { path: 'required.stepB.selectionB3', label: 'Selection B-3' },
  { path: 'required.stepC.selectionC1', label: 'Selection C-1' },
  { path: 'required.stepC.selectionC2', label: 'Selection C-2' },
  { path: 'required.stepC.selectionC3', label: 'Selection C-3' },
  { path: 'required.stepD.selectionD1', label: 'Selection D-1' },
  { path: 'required.stepD.selectionD2', label: 'Selection D-2' },
  { path: 'required.stepD.selectionD3', label: 'Selection D-3' },
  { path: 'optional.stepE.optionText1', label: 'Option text 1' },
  { path: 'optional.stepF.optionText2', label: 'Option text 2' },
];

const readStringAtPath = (
  root: SimpleWizardFormValues,
  path: FieldPath<SimpleWizardFormValues>
): string => {
  let cur: unknown = root;
  for (const segment of path.split('.')) {
    if (!cur || typeof cur !== 'object' || !(segment in cur)) {
      return '';
    }
    cur = (cur as Record<string, unknown>)[segment];
  }
  return typeof cur === 'string' ? cur : '';
};

const ReviewStep = () => {
  const { watch } = useFormContext<SimpleWizardFormValues>();
  const values = watch();

  return (
    <WizardStepForm>
      <Content component="p">Review your choices, then click Finish to submit.</Content>
      <DescriptionList aria-label="Wizard values summary">
        {entries.map(({ path, label }) => {
          const raw = readStringAtPath(values, path);
          return (
            <DescriptionListGroup key={path}>
              <DescriptionListTerm>{label}</DescriptionListTerm>
              <DescriptionListDescription>{raw === '' ? '—' : raw}</DescriptionListDescription>
            </DescriptionListGroup>
          );
        })}
      </DescriptionList>
    </WizardStepForm>
  );
};

export default ReviewStep;
