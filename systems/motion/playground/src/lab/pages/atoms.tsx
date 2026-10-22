import { useState, type ReactNode } from 'react';
import {
  Avatar, AvatarGroup, Badge, Button, Checkbox, DisclosureToggle, Divider, DragHandle, IconButton, Kbd, Link, PageIcon,
  Placeholder, Radio, RadioGroup, SearchInput, Shortcut, Spinner, StatusPill, Switch, Tag, Textarea, TextInput, Tooltip,
  TooltipBubble, motionColors,
} from '@krackedui/motion';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 py-1.5 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-[120px] shrink-0 text-[12px] leading-4 text-n-text-tertiary">{label}</div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid pb-4">
      <h2 className="mb-1 text-[12px] font-medium leading-[14.4px] text-n-text-secondary">{title}</h2>
      {children}
    </section>
  );
}

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;

export default function Atoms() {
  const [todo, setTodo] = useState(false);
  const [sw, setSw] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('Design');

  return (
    <div className="columns-1 gap-10 px-4 py-6 text-[14px] sm:px-8 md:columns-2 xl:columns-3">
      <Section title="Checkbox / Radio">
        <Row label="to-do 16">
          <Checkbox aria-label="unchecked" />
          <Checkbox aria-label="checked" defaultChecked />
          <Checkbox aria-label="toggle" checked={todo} onCheckedChange={setTodo} />
          <Checkbox aria-label="disabled" disabled />
          <Checkbox aria-label="disabled checked" disabled defaultChecked />
          <Checkbox aria-label="indeterminate" checked="indeterminate" />
          <Checkbox aria-label="invalid" invalid />
        </Row>
        <Row label="label"><Checkbox label="Remember me" defaultChecked /><Checkbox label="Disabled" disabled /></Row>
        <Row label="to-do row">
          <span className="flex items-center gap-2"><Checkbox aria-label="a" />Unchecked to-do</span>
          <span className="flex items-center gap-2"><Checkbox aria-label="b" defaultChecked /><span className="line-through opacity-70">Checked to-do</span></span>
        </Row>
        <Row label="form sm 14">
          <Checkbox size="sm" aria-label="sm" />
          <Checkbox size="sm" aria-label="sm checked" defaultChecked />
        </Row>
        <Row label="radio label">
          <RadioGroup aria-label="Plan" defaultValue="pro" orientation="horizontal">
            <Radio value="free" label="Free" />
            <Radio value="pro" label="Plus" />
            <Radio value="team" label="Business" disabled />
          </RadioGroup>
        </Row>
        <Row label="radio">
          <RadioGroup aria-label="Letters" defaultValue="b" orientation="horizontal">
            <Radio value="a" aria-label="a" />
            <Radio value="b" aria-label="b" />
            <Radio value="c" aria-label="c" disabled />
            <Radio value="d" aria-label="d" size="sm" />
          </RadioGroup>
        </Row>
      </Section>

      <Section title="Switch">
        <Row label="md 30×18">
          <Switch aria-label="off" />
          <Switch aria-label="on" defaultChecked />
          <Switch aria-label="toggle" checked={sw} onCheckedChange={setSw} />
          <Switch aria-label="disabled" disabled />
          <Switch aria-label="invalid" invalid />
        </Row>
        <Row label="label"><Switch label="Available offline" defaultChecked /></Row>
        <Row label="sm 24×14">
          <Switch size="sm" aria-label="sm off" />
          <Switch size="sm" aria-label="sm on" defaultChecked />
        </Row>
        <Row label="menu row">
          <div className="flex h-7 w-full max-w-[240px] items-center justify-between rounded-n-md px-2 hover:bg-n-button-hover-bg-a">
            <span>Lock page</span><Switch aria-label="Lock page" />
          </div>
        </Row>
      </Section>

      <Section title="TextInput / Textarea / SearchInput">
        <Row label="sizes"><div className="flex w-full max-w-[260px] flex-col gap-2">
          <TextInput size="sm" aria-label="Small" placeholder="Small 24" />
          <TextInput aria-label="Medium" placeholder="Medium 28" />
          <TextInput size="lg" aria-label="Large" placeholder="Large 32" />
        </div></Row>
        <Row label="states"><div className="flex w-full max-w-[260px] flex-col gap-2">
          <TextInput aria-label="Value" defaultValue="Value" />
          <TextInput aria-label="Invite" placeholder="Email or group, separated by commas" />
          <TextInput aria-label="Invalid" invalid defaultValue="not-an-email" />
          <TextInput aria-label="Disabled" disabled placeholder="Disabled" />
        </div></Row>
        <Row label="icon"><div className="flex w-full max-w-[260px] flex-col gap-2">
          <TextInput icon="search" aria-label="Search settings" placeholder="Search settings" trailing={<Kbd>⌘K</Kbd>} />
          <SearchInput aria-label="Filter" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
        </div></Row>
        <Row label="bare search"><div className="w-full max-w-[300px]"><SearchInput variant="bare" aria-label="Search" placeholder="Search or ask a question…" /></div></Row>
        <Row label="textarea"><div className="w-full max-w-[260px]"><Textarea aria-label="Description" placeholder="Add a description…" /></div></Row>
      </Section>

      <Section title="Kbd / Shortcut / Badge">
        <Row label="kbd"><Kbd>⌘K</Kbd><Kbd>⌘P</Kbd><Kbd>Esc</Kbd></Row>
        <Row label="shortcut"><Shortcut>⌘⌃L</Shortcut><Shortcut>⌘D</Shortcut><Shortcut>Del</Shortcut></Row>
        <Row label="badge soft">{tones.map((t) => <Badge key={t} tone={t}>{t}</Badge>)}</Row>
        <Row label="badge solid">{tones.map((t) => <Badge key={t} variant="solid" tone={t}>{t}</Badge>)}<Badge variant="solid" tone="danger">3</Badge></Row>
        <Row label="badge outline">{tones.map((t) => <Badge key={t} variant="outline" tone={t}>{t}</Badge>)}</Row>
      </Section>

      <Section title="Tag (select / multi-select)">
        <Row label="md 20">
          {motionColors.map((c) => <Tag key={c} color={c}>{c === 'default' ? 'High' : c[0].toUpperCase() + c.slice(1)}</Tag>)}
        </Row>
        <Row label="sm 18">
          {motionColors.map((c) => <Tag key={c} size="sm" color={c}>{c}</Tag>)}
        </Row>
        <Row label="removable"><Tag color="pink" onRemove={() => {}}>Medium</Tag><Tag color="brown" onRemove={() => {}}>Design</Tag></Row>
      </Section>

      <Section title="StatusPill">
        <Row label="md 20"><StatusPill color="not-started">Not started</StatusPill><StatusPill color="in-progress">In progress</StatusPill><StatusPill color="done">Done</StatusPill></Row>
        <Row label="sm 18"><StatusPill size="sm" color="not-started">Not started</StatusPill><StatusPill size="sm" color="in-progress">In progress</StatusPill><StatusPill size="sm" color="done">Done</StatusPill></Row>
        <Row label="colors">{motionColors.slice(1).map((c) => <StatusPill key={c} color={c}>{c}</StatusPill>)}</Row>
      </Section>

      <Section title="Avatar">
        <Row label="workspace">{sizes.map((s) => <Avatar key={s} size={s} name="Ada" />)}</Row>
        <Row label="user">{sizes.map((s) => <Avatar key={s} size={s} shape="user" name="Ada" />)}</Row>
        <Row label="image">{sizes.map((s) => <Avatar key={s} size={s} shape="user" name="Img" src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><rect width='2' height='2' fill='%23e3b38f'/><rect width='1' height='1' fill='%23c87f4f'/></svg>`} />)}</Row>
        <Row label="group">
          <AvatarGroup><Avatar name="Ada" /><Avatar name="Bea" /><Avatar name="Cy" /></AvatarGroup>
          <AvatarGroup max={3} size="sm"><Avatar name="A" /><Avatar name="B" /><Avatar name="C" /><Avatar name="D" /><Avatar name="E" /></AvatarGroup>
        </Row>
      </Section>

      <Section title="PageIcon">
        <Row label="default">{([16, 18, 20, 22, 24] as const).map((s) => <PageIcon key={s} size={s} />)}<PageIcon size={22} empty /></Row>
        <Row label="emoji">{([16, 18, 20, 22, 24] as const).map((s) => <PageIcon key={s} size={s} emoji="💡" />)}</Row>
        <Row label="icon">{([16, 20, 22] as const).map((s) => <PageIcon key={s} size={s} icon="book" />)}</Row>
        <Row label="title 78"><PageIcon size={78} emoji="🚀" interactive /><PageIcon size={78} /></Row>
      </Section>

      <Section title="Tooltip">
        <Row label="static">
          <TooltipBubble role="none">Add to your favorites</TooltipBubble>
          <TooltipBubble role="none" shortcut="⌘⇧L">Copy link</TooltipBubble>
        </Row>
        <Row label="hover">
          <Tooltip content="Add to your favorites"><IconButton icon="star" label="Favorite" /></Tooltip>
          <Tooltip content="Toggle sidebar" shortcut="⌘\"><IconButton icon="sidebar" label="Sidebar" /></Tooltip>
          <Tooltip content="Share this page" side="right"><Button>Share</Button></Tooltip>
        </Row>
      </Section>

      <Section title="Link / Placeholder / Divider / Spinner">
        <Row label="link">
          <span>Text with a <Link href="#/lab/atoms">link</Link> inside.</span>
          <Link variant="accent" href="#/lab/atoms">New workspace</Link>
          <Link variant="subtle" href="#/lab/atoms">Learn about sharing</Link>
          <Link variant="accent" href="https://example.com" external>Status</Link>
        </Row>
        <Row label="placeholder">
          <Placeholder>Type '/' for commands</Placeholder>
          <Placeholder variant="ui">Empty</Placeholder>
          <Placeholder variant="title" className="text-[40px] font-bold leading-[1.2]">New page</Placeholder>
        </Row>
        <Row label="divider"><div className="w-full max-w-[260px]"><Divider block /></div><div className="flex h-5 items-center gap-2">a<Divider orientation="vertical" />b</div></Row>
        <Row label="spinner"><Spinner size="sm" /><Spinner /><Spinner size="lg" /><Spinner size={24} /></Row>
      </Section>

      <Section title="DisclosureToggle / DragHandle">
        <Row label="toggle">
          <DisclosureToggle />
          <DisclosureToggle open />
          <DisclosureToggle open={open} onOpenChange={setOpen} />
          <DisclosureToggle size="sm" />
          <DisclosureToggle size="sm" open />
        </Row>
        <Row label="toggle block">
          <div className="flex w-full max-w-[260px] items-center gap-0.5">
            <DragHandle />
            <DisclosureToggle open={open} onOpenChange={setOpen} />
            <span className="pl-1.5">Toggle list item</span>
          </div>
        </Row>
        <Row label="drag handle"><DragHandle /><DragHandle size="sm" /></Row>
      </Section>
    </div>
  );
}
