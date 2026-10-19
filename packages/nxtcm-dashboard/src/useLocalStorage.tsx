import React, { Dispatch, SetStateAction } from 'react';

/**
 * Runtime type guard that validates a parsed value has a compatible structure
 * with the reference value. Checks typeof match for primitives, array vs object
 * distinction, and recursively validates property value shapes and array element
 * types for objects and arrays.
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
    return value === null || value === undefined;
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

  // Arrays: validate element types against first reference element when available
  if (Array.isArray(reference) && Array.isArray(value)) {
    if (reference.length === 0 || value.length === 0) {
      return true;
    }
    return value.every((element: unknown) => hasMatchingStructure(element, reference[0]));
  }

  // Objects: verify every key from the reference exists with a matching value shape
  const refRecord = reference as Record<string, unknown>;
  const valRecord = value as Record<string, unknown>;
  return Object.keys(refRecord).every(
    (key) => key in valRecord && hasMatchingStructure(valRecord[key], refRecord[key])
  );
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
  const parsed = JSON.parse(state) as unknown;
  const item: T = hasMatchingStructure(parsed, initialValue) ? parsed : initialValue;
  const setItem = (value: SetStateAction<T>) => {
    if (value instanceof Function) {
      setState((prevState) => {
        const prevParsed = JSON.parse(prevState) as unknown;
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
