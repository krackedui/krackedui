'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '../actions/actions';
import { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from './dialog';

export interface ConfirmDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  /** Rendered as the trigger. Omit it and drive the dialog with `open`. */
  trigger?: ReactNode;
}

/**
 * The question you ask before doing something that cannot be undone.
 *
 * It is a `Dialog` with the two buttons already in the right order and the right tones, because the
 * one thing a confirmation must not do is make the destructive button look like the safe one. While
 * `onConfirm` is settling the confirm button is busy and both buttons are disabled, so a slow
 * delete cannot be fired twice.
 */
export function ConfirmDialog({
  open, defaultOpen, onOpenChange, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive, onConfirm, trigger,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange?.(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent size="sm">
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        <DialogFooter>
          <Button disabled={busy} onClick={() => onOpenChange?.(false)}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} loading={busy} onClick={() => void confirm()}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
