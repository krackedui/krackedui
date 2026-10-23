import { useState } from 'react';
import { Button, IconButton, Icon, iconNames } from '@krackedui/motion';
import { semanticIconNames } from '../../../../docs/semantic-icons';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-[120px] shrink-0 text-[12px] leading-4 text-n-text-tertiary">{label}</div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/** Lab: Button, IconButton and Icon in every state. */
export default function Basics() {
  const [saving, setSaving] = useState(false);
  return (
    <div className="px-4 py-6 sm:px-8">
      <Row label="variants">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button>Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="danger-ghost">Danger ghost</Button>
      </Row>
      <Row label="sizes">
        <Button variant="secondary" size="sm">Small</Button>
        <Button variant="secondary">Medium</Button>
        <Button variant="secondary" size="lg">Large</Button>
        <Button variant="secondary" size="xl">Extra large</Button>
      </Row>
      <Row label="icons"><Button icon="plus">Add a page</Button><Button variant="primary" trailingIcon="chevronDown">New</Button></Row>
      <Row label="loading">
        <Button variant="primary" loading={saving} onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1500); }}>Save changes</Button>
        <Button variant="secondary" loading>Exporting</Button>
        <Button variant="danger" loading size="sm">Delete</Button>
      </Row>
      <Row label="disabled"><Button variant="primary" disabled>Primary</Button><Button variant="secondary" disabled>Secondary</Button></Row>
      <Row label="full"><div className="w-full max-w-80"><Button variant="primary" size="lg" full>Continue</Button></div></Row>
      <Row label="icon button">
        <IconButton size="xs" icon="plus" label="Add xs" />
        <IconButton size="sm" icon="plus" label="Add sm" />
        <IconButton icon="more" label="More" />
        <IconButton size="lg" icon="star" label="Favorite" />
        <IconButton variant="secondary" icon="settings" label="Settings" />
        <IconButton active icon="sidebar" label="Sidebar" />
        <IconButton tooltip icon="bell" label="Updates" />
        <IconButton tone="tertiary" icon="drag" label="Drag" />
        <IconButton disabled icon="trash" label="Delete" />
      </Row>
      <Row label="core icons">
        <div className="flex flex-wrap gap-2 text-n-icon-primary">{semanticIconNames.map((n) => <span key={n} title={n}><Icon name={n} /></span>)}</div>
      </Row>
      <Row label="all icons">
        <div className="flex flex-wrap gap-2 text-n-icon-secondary">{iconNames.map((n) => <span key={n} title={n}><Icon name={n} /></span>)}</div>
      </Row>
    </div>
  );
}
