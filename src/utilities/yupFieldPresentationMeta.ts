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
  title?: string;
  helperText?: ReactNode;
  labelHelp?: ReactNode;
  labelHelpTitle?: string;
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
  key: 'id' | 'title' | 'labelHelpTitle'
): string | undefined {
  const v = meta[key];
  return typeof v === 'string' ? v : undefined;
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

  return {
    id: stringFromMeta(meta, 'id'),
    label: reactNodeFromMeta(meta, 'label'),
    title: stringFromMeta(meta, 'title'),
    helperText: reactNodeFromMeta(meta, 'helperText'),
    labelHelp: reactNodeFromMeta(meta, 'labelHelp'),
    labelHelpTitle: stringFromMeta(meta, 'labelHelpTitle'),
  };
}
