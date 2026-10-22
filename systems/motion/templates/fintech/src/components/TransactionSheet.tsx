import { useEffect, useState, type ReactNode } from 'react';
import { Button, Field, FileUpload, Select, Sheet, Textarea, useToast } from '@krackedui/motion';
import type { Category, Transaction } from '../data/types';
import { categories } from '../data/transactions';
import { accountById } from '../data/accounts';
import { formatLongDate } from '../lib/format';
import { useStore } from '../state/store';
import { Money } from './Money';
import { StatusBadge } from './TransactionBits';

const categoryOptions = categories.map((c) => ({ value: c, label: c }));

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-n-border-secondary py-2 last:border-b-0">
      <dt className="shrink-0 text-n-ui text-n-text-secondary">{label}</dt>
      <dd className="m-0 min-w-0 text-right text-n-ui text-n-text-primary [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

interface TransactionSheetProps {
  transaction: Transaction | undefined;
  onClose: () => void;
}

/** Detail panel for one transaction: every field, category change, note editing and receipt upload. */
export function TransactionSheet({ transaction: t, onClose }: TransactionSheetProps) {
  const { dispatch } = useStore();
  const { toast } = useToast();
  const [note, setNote] = useState(t?.note ?? '');
  useEffect(() => setNote(t?.note ?? ''), [t?.id, t?.note]);

  return (
    <Sheet.Root open={!!t} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Sheet.Content side="right" size="md">
        {t && (
          <>
            <div className="flex flex-col gap-1 pr-8">
              <Sheet.Title>{t.merchant}</Sheet.Title>
              <Sheet.Description>{formatLongDate(t.date)} · {accountById[t.account].name} account</Sheet.Description>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <Money amount={t.amount} signed className="text-[28px] font-semibold leading-9" />
              <StatusBadge status={t.status} />
            </div>

            <dl className="m-0 flex flex-col">
              <Detail label="Date">{formatLongDate(t.date)}</Detail>
              <Detail label="Account">{accountById[t.account].name} •• {accountById[t.account].last4}</Detail>
              <Detail label="Method">{t.method}</Detail>
              <Detail label="Status">{t.status}</Detail>
              <Detail label="Receipt">{t.receipt ?? 'None'}</Detail>
              <Detail label="Transaction ID"><span className="font-mono text-n-ui-sm">{t.id}</span></Detail>
            </dl>

            <div className="flex flex-col gap-4 pt-4">
              <Field label="Category">
                <Select
                  options={categoryOptions}
                  value={t.category}
                  onValueChange={(v) => {
                    dispatch({ type: 'transaction/update', id: t.id, patch: { category: v as Category } });
                    toast({ message: 'Category updated', description: `${t.merchant} is now in ${v}.`, tone: 'success' });
                  }}
                />
              </Field>
              <Field label="Note" description="Visible to everyone with access to this account.">
                <Textarea rows={3} value={note} placeholder="Add a note…" onChange={(e) => setNote(e.target.value)} />
              </Field>
              <Field label="Receipt">
                <FileUpload
                  key={t.id}
                  accept=".pdf,image/*"
                  maxSize={10 * 1024 * 1024}
                  label={t.receipt ? 'Replace receipt' : 'Drop a receipt here'}
                  description="PDF or image, up to 10 MB"
                  buttonLabel="Choose file"
                  onFilesChange={(files) => {
                    const file = files[files.length - 1];
                    if (!file) return;
                    dispatch({ type: 'transaction/update', id: t.id, patch: { receipt: file.name } });
                    toast({ message: 'Receipt attached', description: file.name, tone: 'success' });
                  }}
                />
              </Field>
            </div>

            <Sheet.Footer>
              <Sheet.Close asChild><Button variant="secondary">Close</Button></Sheet.Close>
              <Button
                variant="primary"
                disabled={note === t.note}
                onClick={() => {
                  dispatch({ type: 'transaction/update', id: t.id, patch: { note } });
                  toast({ message: 'Note saved', tone: 'success' });
                }}
              >
                Save note
              </Button>
            </Sheet.Footer>
          </>
        )}
      </Sheet.Content>
    </Sheet.Root>
  );
}
