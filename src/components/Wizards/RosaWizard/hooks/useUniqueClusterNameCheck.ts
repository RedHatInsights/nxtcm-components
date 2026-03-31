import { useRef, useCallback, useEffect } from 'react';

export function useUniqueClusterNameCheck(
  checkFn: ((name: string, region: string) => void) | undefined,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const cancelCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const checkName = useCallback(
    (name: string, region: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (!checkFn) return;
      timeoutRef.current = setTimeout(() => {
        checkFn(name, region);
      }, delay);
    },
    [checkFn, delay]
  );

  useEffect(() => {
    return () => cancelCheck();
  }, [cancelCheck]);

  return { checkName, cancelCheck };
}
