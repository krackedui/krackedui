// Small, reusable renderings of transaction fields (status badge, category tag).
import { Badge, Tag } from '@krackedui/motion';
import type { Category, TransactionStatus } from '../data/types';

const statusTone = { Posted: 'success', Pending: 'warning', Failed: 'danger' } as const;

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return <Badge tone={statusTone[status]}>{status}</Badge>;
}

export const categoryColor = {
  Revenue: 'green',
  Payroll: 'purple',
  Rent: 'brown',
  Supplies: 'orange',
  Software: 'blue',
  Marketing: 'pink',
  Travel: 'teal',
  Utilities: 'yellow',
  Taxes: 'red',
} as const satisfies Record<Category, string>;

export function CategoryTag({ category }: { category: Category }) {
  return <Tag color={categoryColor[category]}>{category}</Tag>;
}
