'use client';
import { Dialog } from 'radix-ui';
import type { ReactNode } from 'react';

/** Below the lg breakpoint the sidebar lives in a slide-in drawer opened from the top bar. */
export function MobileNav({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--ln-overlay)] data-[state=open]:animate-fade-in lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 w-[min(300px,85vw)] overflow-hidden bg-ln-gray-0 shadow-ln-button-white outline-none lg:hidden"
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
