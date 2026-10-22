'use client';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Tabs } from 'radix-ui';
import type { ApiTable, Block, CodeFile, ColorToken, Example, InstallStep, TypeStyle } from '@/lib/types';
import { highlight } from '@/lib/highlight';
import { docHref, slugify } from '@/lib/nav';
import { cx } from '@/lib/cx';
import { ArrowUpRight, CodeIcon, CopyIcon, CheckIcon, EyeIcon, InfoIcon } from './icons';
import { Separator, useChrome } from './chrome';
import { useRegistry } from './registry-context';
import { completeSnippet } from '@/lib/snippet';
import { usePreviewRoot } from './preview-root';
import { useTheme as useDocsTheme } from './theme';

/* ---------------- text ---------------- */

const codePill =
  'mx-1 inline rounded-md [overflow-wrap:anywhere] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] bg-ln-gray-50 px-2 font-code text-ln-paragraph-xs text-ln-gray-700 shadow-ln-badge md:text-ln-label-sm';

/** Renders `backtick` spans as inline code pills; [label](href) as links. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('`')) return <code key={i} className={codePill}>{p.slice(1, -1)}</code>;
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) return <Link key={i} href={docHref(m[2])} className="text-ln-orange underline">{m[1]}</Link>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-ln-paragraph-sm text-ln-gray-600 md:text-ln-paragraph-md">{children}</p>;
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-2.5 mt-7 scroll-m-6 border-b border-ln-gray-100 pb-4 text-ln-title-h5 text-ln-gray-900 first:mt-0 md:mb-4 md:mt-10 md:pb-6">
      <a href={`#${id}`}>{children}</a>
    </h2>
  );
}

export function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mb-1 mt-6 scroll-m-6 text-ln-title-h6 text-ln-gray-900 md:mt-8 md:text-ln-title-h5">
      <a href={`#${id}`}>{children}</a>
    </h3>
  );
}

export function PageHeader({ eyebrow, title, description, links, wide }: { eyebrow?: string; title: string; description?: string; links?: { label: string; href: string }[]; wide?: boolean }) {
  return (
    <>
      {eyebrow && <p className="mb-2 text-ln-label-sm text-ln-orange">{eyebrow}</p>}
      <h1 className="mb-2 text-[length:var(--docs-title-size,32px)] leading-[var(--docs-title-line,40px)] font-[var(--docs-title-weight,550)] tracking-[var(--docs-title-tracking,-0.028em)] text-ln-gray-900">{title}</h1>
      {description && (
        <p className={cx('text-ln-gray-600', wide ? 'text-ln-paragraph-lg' : 'text-ln-paragraph-md md:text-ln-paragraph-lg')}>{description}</p>
      )}
      {links && links.length > 0 && (
        <div className="mt-5 flex items-center gap-2 md:mt-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1 rounded-docs-md bg-ln-gray-25 px-2 text-ln-label-xs text-ln-gray-600 shadow-ln-badge transition duration-200 ease-out">
              {l.label}
              <ArrowUpRight className="size-3 text-ln-gray-400" />
            </a>
          ))}
        </div>
      )}
      <div className={wide ? 'my-6' : 'mt-5 md:mt-6'}>
        <Separator />
      </div>
    </>
  );
}

/* ---------------- code ---------------- */

function useCopy() {
  const [done, setDone] = useState(false);
  return {
    done,
    copy: (text: string) => {
      navigator.clipboard?.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    },
  };
}

function Highlighted({ code, lang = 'tsx', lines }: { code: string; lang?: string; lines?: boolean }) {
  return <div className={cx('docs-code', lines && 'with-lines')} dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />;
}

/** Gray frame + header row (filename, copy) + white inner card. Used for files and Code tabs. */
export function CodeBlock({ file, lines = true, className }: { file: CodeFile; lines?: boolean; className?: string }) {
  const { done, copy } = useCopy();
  return (
    <div className={cx('my-4 flex flex-col gap-2 rounded-20 bg-ln-gray-25 p-2 md:my-6 md:gap-3 md:p-3', className)}>
      <div className="flex w-full items-center justify-between px-2">
        <span className="font-code text-ln-paragraph-xs font-normal text-ln-gray-500 md:text-ln-paragraph-sm">{file.filename}</span>
        <button type="button" className="cursor-pointer" aria-label="Copy code" onClick={() => copy(file.code)}>
          {done ? <CheckIcon className="size-6 text-ln-gray-500" /> : <CopyIcon className="size-6 text-ln-gray-500" />}
        </button>
      </div>
      <div className="relative flex max-h-[600px] flex-col overflow-hidden rounded-docs-lg bg-ln-gray-0 font-code text-ln-paragraph-xs leading-5 shadow-ln-xs md:text-ln-paragraph-sm md:leading-[22px]">
        <div className={cx('docs-hide-scrollbar h-full w-full overflow-auto py-4 pr-4', !lines && 'pl-4')}>
          <Highlighted code={file.code} lang={file.lang} lines={lines} />
        </div>
      </div>
    </div>
  );
}

const PMS = ['npm', 'pnpm', 'yarn'] as const;
const pmCmd = (pm: (typeof PMS)[number], pkgs: string[]) =>
  pm === 'npm' ? `npm install ${pkgs.join(' ')}` : pm === 'pnpm' ? `pnpm add ${pkgs.join(' ')}` : `yarn add ${pkgs.join(' ')}`;

/** npm / pnpm / yarn tabs with an orange underline and a terminal card. */
export function PackageTabs({ packages }: { packages: string[] }) {
  const [pm, setPm] = useState<(typeof PMS)[number]>('npm');
  const { done, copy } = useCopy();
  return (
    <Tabs.Root value={pm} onValueChange={(v) => setPm(v as typeof pm)} className="my-4 rounded-20 bg-ln-gray-25 md:mb-6">
      <Tabs.List className="group relative flex h-12 items-center gap-5 border-b border-ln-gray-100 px-5 md:h-[52px]">
        {PMS.map((p) => (
          <Tabs.Trigger
            key={p}
            value={p}
            className="relative cursor-pointer text-ln-label-xs text-ln-gray-450 data-[state=active]:text-ln-gray-900 md:text-ln-label-sm data-[state=active]:after:absolute data-[state=active]:after:-bottom-[16px] data-[state=active]:after:left-0 data-[state=active]:after:h-px data-[state=active]:after:w-full data-[state=active]:after:bg-ln-orange"
          >
            {p}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {/* One panel per manager so every tab's aria-controls points at a real element; only the active one shows. */}
      {PMS.map((p) => (
        <Tabs.Content key={p} value={p} forceMount hidden={p !== pm} className="outline-none">
          <div className="flex flex-col gap-3 p-3">
            <div className="flex w-full items-center justify-between px-2 md:py-2">
              <span className="font-code text-ln-paragraph-xs font-normal tracking-normal text-ln-gray-500 md:text-ln-paragraph-sm md:tracking-normal">terminal</span>
              <button type="button" className="cursor-pointer" aria-label="Copy command" onClick={() => copy(pmCmd(p, packages))}>
                {done ? <CheckIcon className="size-6 text-ln-gray-500" /> : <CopyIcon className="size-6 text-ln-gray-500" />}
              </button>
            </div>
            <div className="docs-hide-scrollbar w-full overflow-auto rounded-docs-lg bg-ln-gray-0 p-4 font-code text-ln-paragraph-xs tracking-normal shadow-ln-xs md:text-ln-paragraph-sm md:tracking-normal">
              <Highlighted code={pmCmd(p, packages)} lang="bash" />
            </div>
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function Steps({ steps }: { steps: InstallStep[] }) {
  return (
    <div className="docs-steps mb-10 ml-3.5 mt-[34px] border-l border-ln-gray-100 pl-6 md:pl-8">
      {steps.map((s, i) => (
        <Fragment key={i}>
          <h3 className="docs-step-title relative mt-8 scroll-m-6 text-ln-label-sm text-ln-gray-800 md:mt-[42px] md:text-ln-label-md">
            <Rich text={s.title} />
          </h3>
          {s.packages && <PackageTabs packages={s.packages} />}
          {s.file && <CodeBlock file={s.file} />}
        </Fragment>
      ))}
    </div>
  );
}

/* ---------------- previews ---------------- */

/** The system's preview root (its theme provider) when the chrome provides one, else the scoping class. */
function PreviewRoot({ className, children }: { className?: string; children: ReactNode }) {
  const root = usePreviewRoot();
  const { theme } = useDocsTheme();
  const Root = useChrome().PreviewRoot;
  if (Root) return <Root appearance={theme} className={className}>{children}</Root>;
  return <div className={cx(root, className)}>{children}</div>;
}

export function ExampleBlock({ example, className }: { example: Example; className?: string }) {
  const [tab, setTab] = useState('preview');
  const { done, copy } = useCopy();
  const chrome = useChrome();
  const registry = useRegistry();
  const code = registry?.exports
    ? completeSnippet(example.code, { packageName: registry.packageName, exports: registry.exports, name: `${example.title} example` })
    : example.code;
  const CI = chrome.Icon;
  const trigger = chrome.tabTriggerClassName ??
    'flex h-7 cursor-pointer items-center gap-1.5 rounded-lg pl-2 pr-2.5 text-ln-label-sm text-ln-gray-500 transition data-[state=active]:bg-ln-gray-0 data-[state=active]:text-ln-gray-800 data-[state=active]:shadow-ln-button-white';
  return (
    <div className={cx('mt-5', className)}>
      <Tabs.Root value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between gap-3 pb-4">
          <Tabs.List className="flex gap-2">
            <Tabs.Trigger value="preview" className={trigger}>
              {CI ? <CI name="preview" /> : <EyeIcon className="size-[18px] text-ln-gray-500" />}
              Preview
            </Tabs.Trigger>
            <Tabs.Trigger value="code" className={trigger}>
              {CI ? <CI name="code" /> : <CodeIcon className="size-[18px] text-ln-gray-500" />}
              Code
            </Tabs.Trigger>
          </Tabs.List>
          <button type="button" onClick={() => copy(code)} className={chrome.copyButtonClassName ?? 'flex h-7 cursor-pointer items-center gap-1 rounded-lg bg-ln-gray-25 pl-1.5 pr-3 text-ln-label-sm text-ln-gray-600'}>
            {CI ? <CI name={done ? 'check' : 'copy'} /> : done ? <CheckIcon className="size-5 text-ln-gray-450" /> : <CopyIcon className="size-5 text-ln-gray-450" />}
            {done ? 'Copied' : 'Copy'}
          </button>
        </div>
        <Tabs.Content value="preview" className="relative overflow-x-auto overflow-y-hidden rounded-20 bg-ln-gray-0 ring-1 ring-ln-gray-100 outline-none">
          <PreviewRoot className="docs-preview w-full">
            {/* safe centering: small components center; wide fixed-size ones scroll sideways instead of being clipped */}
            <div
              className={cx(
                'flex min-h-48 w-full justify-center-safe p-4 sm:p-6 md:min-h-64 md:p-10',
                example.align === 'start' ? 'items-start' : 'items-center',
                example.previewClassName,
              )}
            >
              {example.render()}
            </div>
          </PreviewRoot>
        </Tabs.Content>
        <Tabs.Content value="code" className="outline-none">
          <div className="rounded-20 bg-ln-gray-25 p-3">
            <div className="docs-hide-scrollbar max-h-[600px] overflow-auto rounded-docs-lg bg-ln-gray-0 py-4 pr-4 font-code text-ln-paragraph-xs leading-5 shadow-ln-xs md:text-ln-paragraph-sm md:leading-[22px]">
              <Highlighted code={code} lang="tsx" lines />
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

/* ---------------- API tables ---------------- */

const th = 'border border-ln-gray-100 px-4 py-1.5 text-left text-ln-label-sm text-ln-gray-600 md:px-6 md:py-2 md:text-ln-label-md font-medium';
const cell = 'px-4 py-4 md:px-6 md:py-[22px]';

export function PropsTable({ table }: { table: ApiTable }) {
  return (
    <div className="mt-6 w-full overflow-hidden rounded-lg border border-ln-gray-100">
      <div className="-m-px overflow-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full border-collapse">
            <thead className="bg-ln-gray-25">
              <tr>
                <th className={th}>Prop</th>
                <th className={th}>Type</th>
                <th className={th}>Default</th>
              </tr>
            </thead>
            <tbody>
              {table.props.map((p) => {
                const types = Array.isArray(p.type) ? p.type : [p.type];
                return (
                  <tr key={p.name}>
                    <td className="h-auto border border-ln-gray-100">
                      <div className={cx('flex items-center gap-px', cell)}>
                        <span className="font-code text-ln-label-sm text-ln-gray-600">{p.name}</span>
                        {p.description && (
                          <span title={p.description} className="cursor-help">
                            <InfoIcon className="size-5 text-ln-gray-300" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="h-auto border border-ln-gray-100">
                      <div className={cx('flex flex-wrap items-center gap-2', cell)}>
                        {types.map((t, i) => (
                          <Fragment key={i}>
                            {i > 0 && <span className="h-4 w-px bg-ln-gray-200" />}
                            <code className={cx(codePill, 'py-1')}>{t}</code>
                          </Fragment>
                        ))}
                      </div>
                    </td>
                    <td className="h-auto border border-ln-gray-100">
                      <div className={cell}>{p.default && <code className={cx(codePill, 'py-1')}>{p.default}</code>}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- foundations ---------------- */

function HexPill({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-ln-gray-25 px-[7px] py-[3px] font-code text-ln-label-xs lowercase text-ln-gray-500 shadow-ln-badge">
      {children}
    </span>
  );
}

export function ColorGrid({ tokens, columns = 'auto' }: { tokens: ColorToken[]; columns?: 'auto' | 3 }) {
  return (
    <div className={cx('mt-8 grid', columns === 3 ? 'gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3' : 'grid-cols-[repeat(auto-fill,minmax(174px,1fr))] gap-x-4 gap-y-[22px]')}>
      {tokens.map((t) => (
        <div key={t.cssVar} className="w-full overflow-hidden rounded-docs-lg ring-1 ring-ln-gray-100">
          <div className="flex h-20 w-full border-b border-ln-gray-100">
            <div className="flex-1" style={{ background: t.light }} />
            {t.dark && <div className="flex-1" style={{ background: t.dark }} />}
          </div>
          <div className="flex flex-col items-start px-3.5 pb-3.5 pt-2.5">
            <div className="break-all text-ln-label-sm text-ln-gray-800">{t.name}</div>
            <div className="mt-1 break-all text-ln-paragraph-xs text-ln-gray-500">var({t.cssVar})</div>
            <div className="mt-2.5 flex flex-col items-start gap-2">
              <HexPill>{t.light}</HexPill>
              {t.dark && <HexPill>{t.dark}</HexPill>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const weightName = (w: number | string) =>
  ({ 300: 'Light', 400: 'Regular', 500: 'Medium', 550: 'Medium', 600: 'Semibold', 700: 'Bold' } as Record<string, string>)[String(w)] ?? '';

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-docs-md bg-ln-gray-25 px-3 py-1 text-ln-label-xs shadow-ln-badge">
      <span className="text-ln-gray-450">{k}: </span>
      <span className="text-ln-gray-700">{v}</span>
    </div>
  );
}

export function TypeSpecimens({ styles }: { styles: TypeStyle[] }) {
  const root = usePreviewRoot();
  return (
    <div className="flex flex-col gap-12">
      {styles.map((s, i) => (
        <Fragment key={s.name}>
          {i > 0 && <div className="h-px bg-ln-gray-100 lg:-mx-10" />}
          <div className="flex flex-col gap-6">
            <div className="text-ln-label-md text-ln-gray-900">{s.name}</div>
            <div className={cx(root, 'bg-transparent!')}>
              <div
                className="text-ln-gray-950"
                style={{ fontFamily: s.fontFamily, fontSize: s.fontSize, lineHeight: s.lineHeight, fontWeight: Number(s.fontWeight), letterSpacing: s.letterSpacing }}
              >
                {s.sample ?? 'The quick brown fox jumps over the lazy dog.'}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Meta k="Weight" v={`${weightName(s.fontWeight)} / ${s.fontWeight}`} />
              <Meta k="Font Size" v={s.fontSize} />
              <Meta k="Line Height" v={s.lineHeight} />
              <Meta k="Letter Spacing" v={s.letterSpacing && s.letterSpacing !== 'normal' ? s.letterSpacing : '0'} />
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export function IconGrid({ icons }: { icons: { name: string; render: () => ReactNode }[] }) {
  const root = usePreviewRoot();
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
      {icons.map((ic) => (
        <button
          key={ic.name}
          type="button"
          title={`Copy "${ic.name}"`}
          onClick={() => { navigator.clipboard?.writeText(ic.name); setCopied(ic.name); setTimeout(() => setCopied(null), 1000); }}
          className="group flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-docs-lg px-2 pb-3 pt-5 ring-1 ring-ln-gray-100 transition hover:bg-ln-hover [contain-intrinsic-size:auto_96px] [content-visibility:auto]"
        >
          <span className={cx(root, 'flex size-8 items-center justify-center rounded-md bg-transparent! text-ln-gray-800!')}>{ic.render()}</span>
          <span className="w-full truncate text-center text-ln-paragraph-xs text-ln-gray-500">{copied === ic.name ? 'Copied' : ic.name}</span>
        </button>
      ))}
    </div>
  );
}

export function Cards({ cards }: { cards: { title: string; description?: string; href?: string; icon?: () => ReactNode }[] }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      {cards.map((c) => {
        const inner = (
          <>
            {c.icon && <div className="flex size-12 items-center justify-center">{c.icon()}</div>}
            <div className="text-ln-label-md text-ln-gray-800">{c.title}</div>
            {c.description && <div className="text-center text-ln-paragraph-sm text-ln-gray-500">{c.description}</div>}
          </>
        );
        const cls = 'flex h-32 flex-col items-center justify-center gap-1 rounded-docs-xl bg-ln-gray-0 px-6 shadow-ln-xs transition hover:bg-ln-hover';
        return c.href ? <Link key={c.title} href={docHref(c.href)} className={cls}>{inner}</Link> : <div key={c.title} className={cls}>{inner}</div>;
      })}
    </div>
  );
}

/* ---------------- block dispatcher ---------------- */

export function RenderBlock({ block }: { block: Block }) {
  if (typeof block === 'string') return <P><Rich text={block} /></P>;
  if ('list' in block)
    return (
      <ul className="ml-6 mt-4 flex list-disc flex-col gap-3 text-ln-paragraph-sm text-ln-gray-600 md:text-ln-paragraph-md">
        {block.list.map((li, i) => <li key={i}><Rich text={li} /></li>)}
      </ul>
    );
  if ('code' in block) return <CodeBlock file={block.code} />;
  if ('steps' in block) return <Steps steps={block.steps} />;
  if ('example' in block) return <ExampleBlock example={block.example} />;
  if ('colors' in block)
    return (
      <div className="mt-8 first:mt-0">
        {block.title && <div className="border-l-2 border-ln-gray-100 pl-3 text-ln-label-sm text-ln-gray-600">{block.title}</div>}
        <ColorGrid tokens={block.colors} columns={block.columns} />
      </div>
    );
  if ('type' in block) return <TypeSpecimens styles={block.type} />;
  if ('icons' in block) return <IconGrid icons={block.icons} />;
  if ('cards' in block) return <Cards cards={block.cards} />;
  if ('render' in block) return <>{block.render()}</>;
  return null;
}

export const exampleId = (e: Example) => e.id ?? slugify(e.title);


/* ---------------- source access ---------------- */

/** Registry item name for a source file path ("atoms/Button.tsx" → "atoms-button"), same rule as pipeline/source-registry.mjs. */
export function sourceItemName(file: string) {
  return file.replace(/\.(tsx?|css)$/, '').replace(/[/\\]/g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

interface RegistryItemJson { name: string; dependencies?: string[]; registryDependencies?: string[]; files: { path: string; content: string }[] }

/**
 * "Copy the source" for a component page: the shadcn CLI command for its registry item, what it brings
 * along, and the component's full source file(s), loaded from /r/<system>/<item>.json.
 */
export function SourceAccess({ system, item }: { system: string; item: string }) {
  const [data, setData] = useState<RegistryItemJson | null>(null);
  const [origin, setOrigin] = useState('http://localhost:3002');
  useEffect(() => {
    setOrigin(location.origin);
    fetch(`/r/${system}/${item}.json`).then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => setData(null));
  }, [system, item]);
  if (!data) return null;
  const url = `${origin}/r/${system}/${item}.json`;
  const deps = (data.registryDependencies ?? []).map((u) => u.split('/').pop()!.replace('.json', ''));
  return (
    <div className="mt-6">
      <H3 id="copy-the-source">Copy the source</H3>
      <P>
        Every component is plain source you can own. Add it to any React + Tailwind v4 project with the shadcn CLI; it
        installs {deps.length ? <>the pieces it imports (<Rich text={deps.map((d) => '`' + d + '`').join(', ')} />)</> : <>everything it needs</>}
        {data.dependencies?.length ? <> and the npm packages <Rich text={data.dependencies.map((d) => '`' + d + '`').join(', ')} /></> : null}:
      </P>
      <CodeBlock file={{ filename: 'terminal', lang: 'bash', code: `npx shadcn@latest add ${url}` }} lines={false} />
      {/localhost|127\.0\.0\.1/.test(origin) && (
        <P>
          <Rich text={'This URL points at the docs server on this machine; on another computer, run the docs locally or use the hosted docs URL once it exists. Installing the npm package works everywhere.'} />
        </P>
      )}
      {data.files.map((f) => (
        <CodeBlock key={f.path} file={{ filename: f.path.replace(/^components\//, ''), lang: f.path.endsWith('.css') ? 'css' : 'tsx', code: f.content }} />
      ))}
    </div>
  );
}
