import { Children, type ComponentProps, type ReactNode, useContext } from 'react';
import { Radio as PfRadio } from '@patternfly/react-core';
import { LabelHelp } from '../LabelHelp';
import { RadioGroupContext } from '../RadioGroup/RadioGroupContext';

type RadioComponentProps = ComponentProps<typeof PfRadio>;

export interface RadioProps extends Omit<
  RadioComponentProps,
  'id' | 'isChecked' | 'onChange' | 'isDisabled' | 'name' | 'label' | 'readOnly' | 'value' | 'ref'
> {
  id: string;
  label: string;
  value: string | number | boolean | undefined;
  description?: string | ReactNode;
  children?: ReactNode;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
}

export function Radio(props: RadioProps) {
  const { id, label, value, description, children, labelHelp, labelHelpTitle, ...radioRest } =
    props;
  const radioGroupContext = useContext(RadioGroupContext);

  return (
    <PfRadio
      {...radioRest}
      id={radioGroupContext.radioGroup ? id + '-' + radioGroupContext.radioGroup : id}
      label={
        <>
          {label}{' '}
          <LabelHelp id={id} labelHelp={labelHelp} labelHelpTitle={labelHelpTitle} useButton />
        </>
      }
      isChecked={radioGroupContext.value === value}
      onChange={() => radioGroupContext.setValue?.(value)}
      isDisabled={radioGroupContext.disabled}
      readOnly={radioGroupContext.readonly}
      name={radioGroupContext.radioGroup ?? ''}
      description={description}
      body={
        radioGroupContext.value === value && Children.toArray(children).length > 0 ? children : null
      }
    />
  );
}
