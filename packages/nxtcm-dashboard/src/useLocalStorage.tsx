import React, { Dispatch, SetStateAction } from 'react';

/**
 * Type-safe wrapper around JSON.parse that returns `unknown` instead of `any`,
 * containing the untyped boundary to a single expression.
 */
export function safeJsonParse(json: string): unknown {
  return JSON.parse(json) as unknown;
}

/**
 * Runtime type guard that validates a parsed value has a compatible structure
 * with the reference value. Checks typeof match for primitives, array vs object
 * distinction, and top-level key presence for objects.
 *
 * Returns true (narrowing `value` to `T`) when the parsed value is structurally
 * compatible with `reference`. Returns false when the value is malformed, causing
 * callers to fall back to a safe default.
 */
export function hasMatchingStructure<T>(value: unknown, reference: T): value is T {
  if (value === null || value === undefined) {
    return reference === null || reference === undefined;
  }

  if (reference === null || reference === undefined) {
    return true;
  }

  if (typeof value !== typeof reference) {
    return false;
  }

  // Primitives: typeof match is sufficient for type safety
  if (typeof value !== 'object' || typeof reference !== 'object') {
    return true;
  }

  // Array vs plain-object mismatch
  if (Array.isArray(reference) !== Array.isArray(value)) {
    return false;
  }

  // Arrays: element types can't be validated generically; structural match is enough
  if (Array.isArray(reference)) {
    return true;
  }

  // Objects: verify every top-level key from the reference exists in the parsed value
  return Object.keys(reference).every((key) => key in value);
}

function useLocalStorage(
  key: string,
  initialValue: string = ''
): [string, Dispatch<SetStateAction<string>>, () => void] {
  const [item, setValue] = React.useState(() => {
    const value = localStorage.getItem(key) || initialValue;
    localStorage.setItem(key, value);
    return value;
  });

  const setItem = (action: SetStateAction<string>) => {
    if (action instanceof Function) {
      return setValue((prevState) => {
        const value = action(prevState);
        localStorage.setItem(key, value);
        return value;
      });
    }
    setValue(action);
    localStorage.setItem(key, action);
  };

  const clear = () => {
    localStorage.removeItem(key);
  };

  return [item, setItem, clear];
}

export function useLocalStorageWithObject<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [state, setState, clear] = useLocalStorage(key, JSON.stringify(initialValue));
  const parsed = safeJsonParse(state);
  const item: T = hasMatchingStructure(parsed, initialValue) ? parsed : initialValue;
  const setItem = (value: SetStateAction<T>) => {
    if (value instanceof Function) {
      setState((prevState) => {
        const prevParsed = safeJsonParse(prevState);
        const prevValidated: T = hasMatchingStructure(prevParsed, initialValue)
          ? prevParsed
          : initialValue;
        return JSON.stringify(value(prevValidated));
      });
      return;
    }
    setState(JSON.stringify(value));
  };
  return [item, setItem, clear];
}
