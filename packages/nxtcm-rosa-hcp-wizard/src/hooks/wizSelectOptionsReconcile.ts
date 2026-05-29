import * as yup from 'yup';

import { reconcileFieldValueWithNewOptions } from '@/utilities/reconcileFieldValueWithNewOptions';
import type { ReconcileFieldOption } from '@/utilities/reconcileFieldValueWithNewOptions';

import { getNestedValue } from '../helpers';
import { normalizeOption } from '../components/Fields/Select/SelectOptions';
import type { Option, OptionGroup } from '../components/Fields/Select/SelectTypes';
import { readWizardFieldMeta } from '../yupSchemas/readWizardFieldMeta';
import type { WizardFieldMeta } from '../yupSchemas/types';

export function flattenWizSelectOptionsForReconcile<T>(params: {
  options?: (Option<T> | string | number)[];
  optionGroups?: OptionGroup<T>[];
  keyPath?: string;
}): ReconcileFieldOption[] {
  const { options, optionGroups, keyPath = 'value' } = params;
  const flat: ReconcileFieldOption[] = [];

  if (options) {
    for (const option of options) {
      const normalized = normalizeOption(option, keyPath);
      flat.push({ label: normalized.label, value: normalized.keyedValue });
    }
  }

  if (optionGroups) {
    for (const group of optionGroups) {
      for (const option of group.options ?? []) {
        const normalized = normalizeOption(option, keyPath);
        flat.push({ label: normalized.label, value: normalized.keyedValue });
      }
    }
  }

  return flat;
}

export function readWizSelectFieldMeta(
  schema: yup.AnySchema | undefined,
  name: string
): WizardFieldMeta | undefined {
  if (!schema) {
    return undefined;
  }
  try {
    return readWizardFieldMeta(yup.reach(schema, name));
  } catch {
    return undefined;
  }
}

/** Whether {@link WizSelect} should reconcile this field when its options list changes. */
export function shouldReconcileWizSelectValue(
  schema: yup.AnySchema | undefined,
  name: string
): boolean {
  const meta = readWizSelectFieldMeta(schema, name);
  if (meta?.reconcileValueWithOptions === false) {
    return false;
  }
  if (meta?.reconcileValueWithOptions === true) {
    return true;
  }
  return meta?.fieldType === 'select';
}

export function getWizSelectFieldDefaultValue(
  schema: yup.AnySchema | undefined,
  name: string
): unknown {
  if (!schema) {
    return '';
  }
  try {
    return (yup.reach(schema, name) as yup.Schema).getDefault();
  } catch {
    return '';
  }
}

export function wizSelectValueToReconcileString(value: unknown, keyPath: string): string {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'object') {
    const keyed = getNestedValue(value, keyPath);
    if (keyed != null && keyed !== '') {
      return String(keyed);
    }
    const id = (value as { id?: string }).id;
    if (id) {
      return id;
    }
  }
  return String(value);
}

/** Form value written when a select clears or reconciles back to the Yup default. */
export function toWizSelectFormValueFromSchemaDefault(schemaDefault: unknown): unknown {
  return schemaDefault === undefined || schemaDefault === null ? '' : schemaDefault;
}

export function reconcileWizSelectFormValue(params: {
  currentValue: unknown;
  newOptions: readonly ReconcileFieldOption[];
  schema?: yup.AnySchema;
  name: string;
  keyPath?: string;
}): unknown {
  const { currentValue, newOptions, schema, name, keyPath = 'value' } = params;
  const schemaDefault = getWizSelectFieldDefaultValue(schema, name);
  const defaultForReconcile =
    schemaDefault == null || schemaDefault === '' ? '' : String(schemaDefault);
  const currentForReconcile = wizSelectValueToReconcileString(currentValue, keyPath);
  const reconciled = reconcileFieldValueWithNewOptions({
    currentValue: currentForReconcile,
    newOptions,
    defaultValue: defaultForReconcile,
  });

  if (reconciled === currentForReconcile) {
    return currentValue;
  }

  return toWizSelectFormValueFromSchemaDefault(schemaDefault);
}
