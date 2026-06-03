import { type FocusEventHandler, useCallback, useRef } from 'react';

/**
 * Skips RHF {@link onBlur} while the select menu stays open after a toggle blur. Focus often
 * leaves the toggle for the portaled listbox during option selection; marking touched in that
 * window flashes errors before {@link onChange} runs. The open check is deferred so an outside
 * click that closes the menu in the same gesture still reaches RHF blur.
 */
export function useSelectMenuToggleBlur(
  open: boolean,
  onBlur?: FocusEventHandler<HTMLElement>
): FocusEventHandler<HTMLElement> {
  const openRef = useRef(open);
  openRef.current = open;

  return useCallback(
    (event) => {
      setTimeout(() => {
        if (!openRef.current) {
          onBlur?.(event);
        }
      }, 0);
    },
    [onBlur]
  );
}
