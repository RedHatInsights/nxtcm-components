import { yupResolver } from '@hookform/resolvers/yup';
import { toNestErrors } from '@hookform/resolvers';
import { get } from 'react-hook-form';
import type { FieldErrors, Resolver, ResolverResult } from 'react-hook-form';
import { reach, ValidationError, type Schema } from 'yup';
import { simpleWizardFormSchema, type SimpleWizardFormValues } from './simpleWizardFormSchema';

const baseResolver = yupResolver(simpleWizardFormSchema);

/**
 * When RHF passes a single-wizard-substep set of `options.names` (e.g. only `required.stepA.*`),
 * validate that branch only. Otherwise Yup would validate the whole wizard and surface errors for
 * every later step on each Next/blur.
 */
const wizardSubstepRootFromFieldNames = (names: readonly unknown[] | undefined): string | null => {
  if (names == null || names.length === 0) {
    return null;
  }
  const stringNames = names.filter((n): n is string => typeof n === 'string' && n.length > 0);
  if (stringNames.length === 0 || stringNames.length !== names.length) {
    return null;
  }
  const roots = stringNames.map((n) => {
    const p = n.split('.');
    return p.length >= 2 ? `${p[0]}.${p[1]}` : null;
  });
  const head = roots[0];
  if (head == null || roots.some((r) => r !== head)) {
    return null;
  }
  if (head.startsWith('required.') || head.startsWith('optional.')) {
    return head;
  }
  return null;
};

const joinSubstepPath = (prefix: string, relative: string | undefined): string =>
  relative == null || relative === '' ? prefix : `${prefix}.${relative}`;

/**
 * Forwards RHF’s `options.names` into Yup’s `context` as `rhfFieldNames` for the full-form path.
 * When validating a single substep, only that branch is run against Yup.
 */
export const simpleWizardYupResolver: Resolver<SimpleWizardFormValues> = async (
  values,
  context,
  options
): Promise<ResolverResult<SimpleWizardFormValues>> => {
  const names = options.names;
  const subRoot = wizardSubstepRootFromFieldNames(names);

  if (subRoot != null) {
    const mergedContext = {
      ...(context != null && typeof context === 'object' ? context : {}),
      rhfFieldNames: names,
    };

    try {
      const branchSchema = reach(simpleWizardFormSchema, subRoot) as Schema;
      const branchValue = get(values, subRoot);
      await branchSchema.validate(branchValue, {
        abortEarly: false,
        context: mergedContext,
      });
      return { values, errors: {} } as ResolverResult<SimpleWizardFormValues>;
    } catch (err) {
      if (!(err instanceof ValidationError)) {
        throw err;
      }

      const flat: Record<string, { type: string; message: string }> = {};
      const inners = err.inner?.length ? err.inner : [err];
      for (const inner of inners) {
        const path = joinSubstepPath(subRoot, inner.path);
        if (!flat[path]) {
          flat[path] = {
            type: inner.type ?? 'validation',
            message: inner.message,
          };
        }
      }

      return {
        values: {} as SimpleWizardFormValues,
        errors: toNestErrors(flat as FieldErrors<SimpleWizardFormValues>, options),
      } as ResolverResult<SimpleWizardFormValues>;
    }
  }

  return (await baseResolver(
    values,
    {
      ...(context != null && typeof context === 'object' ? context : {}),
      rhfFieldNames: names,
    } as never,
    options
  )) as ResolverResult<SimpleWizardFormValues>;
};
