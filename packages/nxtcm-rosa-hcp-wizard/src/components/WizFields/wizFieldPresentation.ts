import { type ReactNode, useMemo } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import * as yup from 'yup';

import { getYupFieldPresentationMeta } from '../../utilities/yupFieldPresentationMeta';
import type { YupFieldDescribeOptions } from '../../utilities/yupFieldRequired';
import { useRosaHcpWizardStrings } from '../../stringsProvider/RosaHcpWizardStringsContext';
import {
  wizFallbackFieldId,
  wizFallbackLabelFromFieldPath,
  wizResolvePresentationLabelString,
  wizResolvePresentationReactNode,
  wizResolvePresentationString,
} from './wizFieldRhf';

export interface UseWizFieldPresentationArgs<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  schema?: yup.AnyObjectSchema;
  yupDescribeOptions?: YupFieldDescribeOptions;
  idProp?: string;
  labelProp?: string | ReactNode;
  titleProp?: string;
  helperTextProp?: ReactNode;
  labelHelpProp?: ReactNode;
  labelHelpTitleProp?: string;
  placeholderProp?: string;
  /** `stringField` coerces Yup `.meta().label` to string; `checkbox` preserves rich labels and Yup `title`. */
  labelMode: 'stringField' | 'checkbox';
  /** When true, resolves `placeholder` from props, `placeholderKey`, and Yup `.meta().placeholder`. */
  includePlaceholder?: boolean;
}

type WizFieldPresentationBase = {
  id: string;
  helperText: ReactNode | undefined;
  labelHelp: ReactNode | undefined;
  labelHelpTitle: string | undefined;
  /** Only when {@link UseWizFieldPresentationArgs.includePlaceholder} is true; otherwise `undefined`. */
  placeholder: string | undefined;
  fieldSetLegend: boolean | undefined;
};

export type StringFieldPresentation = WizFieldPresentationBase & { label: string };

export type CheckboxFieldPresentation = WizFieldPresentationBase & {
  label: ReactNode;
  /** Group heading from props or Yup `.meta().title`. */
  title?: string;
};

/**
 * Resolves Yup `.meta()` presentation (including `*Key` lookups via `useRosaHcpWizardStrings`) for Rosa `Wiz*` fields.
 */
export function useWizFieldPresentation<TFieldValues extends FieldValues>(
  args: UseWizFieldPresentationArgs<TFieldValues> & { labelMode: 'stringField' }
): StringFieldPresentation;
export function useWizFieldPresentation<TFieldValues extends FieldValues>(
  args: UseWizFieldPresentationArgs<TFieldValues> & { labelMode: 'checkbox' }
): CheckboxFieldPresentation;
export function useWizFieldPresentation<TFieldValues extends FieldValues>(
  args: UseWizFieldPresentationArgs<TFieldValues>
): StringFieldPresentation | CheckboxFieldPresentation {
  const rosaStrings = useRosaHcpWizardStrings();

  const {
    name,
    schema,
    yupDescribeOptions,
    idProp,
    labelProp,
    titleProp,
    helperTextProp,
    labelHelpProp,
    labelHelpTitleProp,
    placeholderProp,
    labelMode,
    includePlaceholder,
  } = args;

  return useMemo(() => {
    const fromYup =
      schema !== undefined
        ? getYupFieldPresentationMeta(schema, String(name), yupDescribeOptions)
        : undefined;

    const fallbackLabel = wizFallbackLabelFromFieldPath(name);
    const id = idProp ?? fromYup?.id ?? wizFallbackFieldId(name);

    const fieldSetLegend = fromYup?.fieldSetLegend;

    const helperText = wizResolvePresentationReactNode(
      helperTextProp,
      fromYup?.helperTextKey,
      rosaStrings,
      fromYup?.helperText
    );
    const labelHelp = wizResolvePresentationReactNode(
      labelHelpProp,
      fromYup?.labelHelpKey,
      rosaStrings,
      fromYup?.labelHelp
    );
    const labelHelpTitle = wizResolvePresentationString(
      labelHelpTitleProp,
      fromYup?.labelHelpTitleKey,
      rosaStrings,
      fromYup?.labelHelpTitle
    );

    const placeholder =
      includePlaceholder === true
        ? wizResolvePresentationString(
            placeholderProp,
            fromYup?.placeholderKey,
            rosaStrings,
            fromYup?.placeholder
          )
        : undefined;

    let label: string | ReactNode;
    let title: string | undefined;
    if (labelMode === 'checkbox') {
      label =
        wizResolvePresentationReactNode(
          labelProp,
          fromYup?.labelKey,
          rosaStrings,
          fromYup?.label
        ) ?? fallbackLabel;
      title = titleProp ?? fromYup?.title;
    } else {
      label = wizResolvePresentationLabelString(
        labelProp as string | undefined,
        fromYup?.labelKey,
        rosaStrings,
        fromYup?.label,
        schema !== undefined,
        fallbackLabel
      );
    }

    if (labelMode === 'checkbox') {
      return {
        id,
        label,
        title,
        helperText,
        labelHelp,
        labelHelpTitle,
        placeholder,
        fieldSetLegend,
      };
    }

    return {
      id,
      label,
      helperText,
      labelHelp,
      labelHelpTitle,
      placeholder,
      fieldSetLegend,
    };
  }, [
    name,
    schema,
    yupDescribeOptions,
    idProp,
    labelProp,
    titleProp,
    helperTextProp,
    labelHelpProp,
    labelHelpTitleProp,
    placeholderProp,
    labelMode,
    includePlaceholder,
    rosaStrings,
  ]);
}
