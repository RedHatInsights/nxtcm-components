import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { useFormContext } from 'react-hook-form';
import type { SimpleWizardFormValues } from '../simpleWizardForm';

const entries: { key: keyof SimpleWizardFormValues; label: string }[] = [
  { key: 'fullName', label: 'Full name' },
  { key: 'selectionA1', label: 'Selection A-1' },
  { key: 'selectionA2', label: 'Selection A-2' },
  { key: 'selectionA3', label: 'Selection A-3' },
  { key: 'selectionB1', label: 'Selection B-1' },
  { key: 'selectionB2', label: 'Selection B-2' },
  { key: 'selectionB3', label: 'Selection B-3' },
  { key: 'selectionC1', label: 'Selection C-1' },
  { key: 'selectionC2', label: 'Selection C-2' },
  { key: 'selectionC3', label: 'Selection C-3' },
  { key: 'selectionD1', label: 'Selection D-1' },
  { key: 'selectionD2', label: 'Selection D-2' },
  { key: 'selectionD3', label: 'Selection D-3' },
  { key: 'optionText1', label: 'Option text 1' },
  { key: 'optionText2', label: 'Option text 2' },
];

const ReviewStep = () => {
  const { watch } = useFormContext<SimpleWizardFormValues>();
  const values = watch();

  return (
    <>
      <Content component="p">Review your choices, then click Finish to submit.</Content>
      <DescriptionList aria-label="Wizard values summary">
        {entries.map(({ key, label }) => (
          <DescriptionListGroup key={key}>
            <DescriptionListTerm>{label}</DescriptionListTerm>
            <DescriptionListDescription>
              {values[key] === '' ? '—' : String(values[key])}
            </DescriptionListDescription>
          </DescriptionListGroup>
        ))}
      </DescriptionList>
    </>
  );
};

export default ReviewStep;
