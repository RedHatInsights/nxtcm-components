import React, { Dispatch, SetStateAction } from 'react';

export function useLocalStorage(
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
  const item: T = JSON.parse(state);
  const setItem = (value: SetStateAction<T>) => {
    if (value instanceof Function) {
      setState((prevState) => JSON.stringify(value(JSON.parse(prevState))));
      return;
    }
    setState(JSON.stringify(value));
  };
  return [item, setItem, clear];
}
