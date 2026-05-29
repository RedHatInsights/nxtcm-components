import * as yup from 'yup';

import { shouldReconcileWizSelectValue } from '../hooks/wizSelectOptionsReconcile';
import { clusterValidationSchema } from './index';
import { readWizardFieldMeta } from './readWizardFieldMeta';
import type { WizardFieldMeta } from './types';

function wizardFieldMetaByPath(path: string): WizardFieldMeta | undefined {
  try {
    return readWizardFieldMeta(yup.reach(clusterValidationSchema, path));
  } catch {
    return undefined;
  }
}

export type WizardFieldSelectReconcileEntry = {
  fieldPath: string;
  meta: WizardFieldMeta;
  reconcileEnabled: boolean;
};

function collectSelectFieldPaths(schema: yup.AnySchema, prefix = ''): string[] {
  const fieldSchema = schema as yup.Schema & {
    type?: string;
    innerType?: yup.AnySchema;
    fields?: Record<string, yup.AnySchema>;
  };

  if (fieldSchema.type === 'array') {
    const inner = fieldSchema.innerType;
    if (inner && (inner as yup.Schema & { type?: string }).type === 'object') {
      return collectSelectFieldPaths(inner, prefix ? `${prefix}.0` : '0');
    }
    return [];
  }

  if (fieldSchema.type !== 'object' || !fieldSchema.fields) {
    return [];
  }

  const paths: string[] = [];
  for (const [key, nestedSchema] of Object.entries(fieldSchema.fields)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const meta = readWizardFieldMeta(nestedSchema);
    if (meta?.fieldType === 'select') {
      paths.push(path);
    }
    paths.push(...collectSelectFieldPaths(nestedSchema, path));
  }
  return paths;
}

function readSelectReconcileEntries(): WizardFieldSelectReconcileEntry[] {
  const paths = collectSelectFieldPaths(clusterValidationSchema);
  return paths.map((fieldPath) => {
    const meta = wizardFieldMetaByPath(fieldPath);
    if (!meta) {
      throw new Error(`Missing WizardFieldMeta for select path: ${fieldPath}`);
    }
    return {
      fieldPath,
      meta,
      reconcileEnabled: shouldReconcileWizSelectValue(clusterValidationSchema, fieldPath),
    };
  });
}

export function listWizardFieldSelectReconcileEntries(): WizardFieldSelectReconcileEntry[] {
  return readSelectReconcileEntries();
}

export function isWizardSelectReconcileEnabled(fieldPath: string): boolean {
  return shouldReconcileWizSelectValue(clusterValidationSchema, fieldPath);
}
