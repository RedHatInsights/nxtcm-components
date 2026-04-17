import { useRef, useCallback, useEffect } from 'react';

/**
 * Debounces `checkFn` for a cluster name (and optional region) and ignores superseded timers via a nonce.
 * Returns `checkName` to schedule a check and `cancelCheck` to clear the timer and invalidate pending runs.
 */
export function useUniqueClusterNameCheck(
  checkFn: ((name: string, region?: string) => void) | undefined,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const nonceRef = useRef(0);

  const cancelCheck = useCallback(() => {
    nonceRef.current++;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const checkName = useCallback(
    (name: string, region?: string) => {
      cancelCheck();
      if (!checkFn) return;
      const capturedNonce = ++nonceRef.current;
      timeoutRef.current = setTimeout(() => {
        if (nonceRef.current !== capturedNonce) return;
        checkFn(name, region);
      }, delay);
    },
    [checkFn, delay, cancelCheck]
  );

  useEffect(() => {
    return () => cancelCheck();
  }, [cancelCheck]);

  return { checkName, cancelCheck };
}
