import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Controlled open state for PatternFly {@link Select} wrappers.
 *
 * Notifies {@link onMenuOpenChange} synchronously when the menu opens so parent error
 * suppression stays aligned with the toggle. Defers close notification to the next task
 * so {@link onSelect} / RHF {@link onChange} can run first (PF may close on pointerdown
 * before the value updates).
 */
export function useSelectMenuOpen(onMenuOpenChange?: (isOpen: boolean) => void): {
  open: boolean;
  handleOpenChange: (nextOpen: boolean | ((prev: boolean) => boolean)) => void;
} {
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);
  const closeNotifyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const clearCloseNotifyTimer = useCallback(() => {
    if (closeNotifyTimerRef.current !== undefined) {
      clearTimeout(closeNotifyTimerRef.current);
      closeNotifyTimerRef.current = undefined;
    }
  }, []);

  const notifyMenuOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        clearCloseNotifyTimer();
        onMenuOpenChange?.(true);
        return;
      }
      clearCloseNotifyTimer();
      closeNotifyTimerRef.current = setTimeout(() => {
        closeNotifyTimerRef.current = undefined;
        onMenuOpenChange?.(false);
      }, 0);
    },
    [clearCloseNotifyTimer, onMenuOpenChange]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean | ((prev: boolean) => boolean)) => {
      const prev = openRef.current;
      const resolved = typeof nextOpen === 'function' ? nextOpen(prev) : nextOpen;
      if (resolved === prev) {
        return;
      }
      openRef.current = resolved;
      setOpen(resolved);
      notifyMenuOpenChange(resolved);
    },
    [notifyMenuOpenChange]
  );

  useEffect(() => () => clearCloseNotifyTimer(), [clearCloseNotifyTimer]);

  return { open, handleOpenChange };
}
