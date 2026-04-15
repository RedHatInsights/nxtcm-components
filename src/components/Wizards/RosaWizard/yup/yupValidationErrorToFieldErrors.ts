import type { FieldErrors, FieldValues, ResolverOptions } from 'react-hook-form';
import type { ValidationError } from 'yup';

function assignPath(
  target: Record<string, unknown>,
  path: string,
  leaf: { type: string; message: string }
) {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) return;
  let cur: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const existing = cur[k];
    if (existing && typeof existing === 'object' && 'message' in existing && 'type' in existing) {
      return;
    }
    if (!existing || typeof existing !== 'object') {
      cur[k] = {};
    }
    cur = cur[k] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = leaf;
}

/** Maps Yup `ValidationError.inner` paths to RHF nested `FieldErrors` (replaces `@hookform/resolvers` `toNestError` for this wizard). */
export function yupValidationErrorToFieldErrors<T extends FieldValues>(
  error: ValidationError,
  _options: ResolverOptions<T>
): FieldErrors<T> {
  const root: Record<string, unknown> = {};
  const inner = error.inner?.length ? error.inner : [error];
  for (const err of inner) {
    if (!err.path) continue;
    assignPath(root, err.path, {
      type: (err.type ?? 'validation') as string,
      message: err.message,
    });
  }
  return root as FieldErrors<T>;
}
