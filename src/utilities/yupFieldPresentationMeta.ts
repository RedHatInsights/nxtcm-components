import { isValidElement, type ReactNode } from 'react';
import * as yup from 'yup';

import { type YupFieldDescribeOptions } from './yupFieldRequired';

/**
 * Optional UI fields stored on a Yup schema via {@link yup.BaseSchema.meta}.
 * `id` / `title` / `labelHelpTitle` should stay strings (DOM ids, `title` attr).
 * `label`, `helperText`, and `labelHelp` may be strings or React nodes (Yup keeps them on `spec.meta`;
 * {@link yup.Schema.describe} passes `meta` through unchanged).
 */
export interface YupFieldPresentationMeta {
  id?: string;
  label?: ReactNode;
  /** Dot-path into bundled UI strings (e.g. ROSA wizard) when labels are resolved at runtime. */
  labelKey?: string;
  title?: string;
  helperText?: ReactNode;
  /** Dot-path into bundled UI strings when `helperText` is resolved at runtime. */
  helperTextKey?: string;
  labelHelp?: ReactNode;
  labelHelpKey?: string;
  labelHelpTitle?: string;
  labelHelpTitleKey?: string;
  placeholder?: string;
  /** Dot-path into bundled UI strings when `placeholder` is resolved at runtime. */
  placeholderKey?: string;
  displayLabel?: boolean;
}

function metaFromDescription(description: unknown): Record<string, unknown> {
  if (description === null || typeof description !== 'object' || !('meta' in description)) {
    return {};
  }
  const { meta } = description as { meta?: unknown };
  if (meta !== undefined && meta !== null && typeof meta === 'object' && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return {};
}

function stringFromMeta(
  meta: Record<string, unknown>,
  key:
    | 'id'
    | 'title'
    | 'labelHelpTitle'
    | 'labelKey'
    | 'helperTextKey'
    | 'labelHelpKey'
    | 'labelHelpTitleKey'
    | 'placeholder'
    | 'placeholderKey'
): string | undefined {
  const v = meta[key];
  return typeof v === 'string' ? v : undefined;
}

function booleanFromMeta(meta: Record<string, unknown>, key: 'displayLabel'): boolean | undefined {
  const v = meta[key];
  return typeof v === 'boolean' ? v : undefined;
}

function reactNodeFromMeta(
  meta: Record<string, unknown>,
  key: 'label' | 'helperText' | 'labelHelp'
): ReactNode | undefined {
  const v = meta[key];
  if (typeof v === 'string' || typeof v === 'number') {
    return v;
  }
  if (isValidElement(v)) {
    return v;
  }
  return undefined;
}

/**
 * Reads presentation-related values from `.meta({ ... })` on the schema at `path`
 * (via {@link yup.reach} + {@link yup.Schema.describe}).
 *
 * For conditional schemas, pass the same `describeOptions` / `value` shape you use with
 * {@link isYupFieldRequired} so `.when()` branches resolve consistently.
 */
export function getYupFieldPresentationMeta(
  schema: yup.AnyObjectSchema,
  path: string,
  describeOptions?: YupFieldDescribeOptions
): YupFieldPresentationMeta {
  const fieldSchema = yup.reach(schema, path);
  const meta = metaFromDescription(fieldSchema.describe(describeOptions));

  const out: YupFieldPresentationMeta = {
    id: stringFromMeta(meta, 'id'),
    label: reactNodeFromMeta(meta, 'label'),
    labelKey: stringFromMeta(meta, 'labelKey'),
    title: stringFromMeta(meta, 'title'),
    helperText: reactNodeFromMeta(meta, 'helperText'),
    helperTextKey: stringFromMeta(meta, 'helperTextKey'),
    labelHelp: reactNodeFromMeta(meta, 'labelHelp'),
    labelHelpKey: stringFromMeta(meta, 'labelHelpKey'),
    labelHelpTitle: stringFromMeta(meta, 'labelHelpTitle'),
    labelHelpTitleKey: stringFromMeta(meta, 'labelHelpTitleKey'),
    placeholder: stringFromMeta(meta, 'placeholder'),
    placeholderKey: stringFromMeta(meta, 'placeholderKey'),
    displayLabel: booleanFromMeta(meta, 'displayLabel'),
  };

  return Object.fromEntries(
    Object.entries(out).filter(([, value]) => value !== undefined)
  ) as YupFieldPresentationMeta;
}
