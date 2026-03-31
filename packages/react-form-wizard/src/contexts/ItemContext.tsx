/* Copyright Contributors to the Open Cluster Management project */
import { createContext, useContext } from "react";
import get from "get-value";

/** ItemContext is the item context that input components are editing. */
export const ItemContext = createContext({});
ItemContext.displayName = "ItemContext";

export function useItem<T = object>(): T;
export function useItem<T = object>(path: string): unknown;
export function useItem<T = object>(path?: string): T | unknown {
  const item = useContext(ItemContext);
  if (path) {
    return get(item, path);
  }
  return item as unknown as T;
}
