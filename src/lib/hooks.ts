import { useEffect, useRef, useState } from 'react';

/** Open/close state for a popover that closes on outside click or Escape. */
export function usePopover<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return { open, setOpen, ref, toggle: () => setOpen((o) => !o) };
}

/** Normalise phone / CNIC input so 0300…, +92300… and dashed CNICs all match. */
export function digits(s: string) {
  const d = s.replace(/\D/g, '');
  return d.startsWith('92') && d.length >= 12 ? '0' + d.slice(2) : d;
}
