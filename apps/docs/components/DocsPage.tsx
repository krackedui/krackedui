'use client';
import { Fragment, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { systems, systemList } from '@/systems';
import { slugify } from '@/lib/nav';
import type { DocPage, DocsRegistry, InstallStep, Section } from '@/lib/types';
import { completeSnippet } from '@/lib/snippet';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SearchDialog } from './SearchDialog';
import { Toc, type TocEntry } from './Toc';
import { ExampleBlock, H2, H3, P, PageHeader, PropsTable, Rich, RenderBlock, SourceAccess, Steps, exampleId, sourceItemName } from './content';
import { PreviewRootProvider } from './preview-root';
import { ChromeProvider } from './chrome';
import { RegistryProvider } from './registry-context';
import { MobileNav } from './MobileNav';

function placementOf(s: Section): 'start' | 'beforeApi' | 'end' {
  if (s.placement) return s.placement;
  if (/^composition/i.test(s.title ?? '')) return 'beforeApi';
  if (/^(accessibility|evidence)/i.test(s.title ?? '')) return 'end';
  return 'start';
}
const sectionsAt = (page: DocPage, at: 'start' | 'beforeApi' | 'end') => (page.sections ?? []).filter((s) => placementOf(s) === at);

/**
 * Standard install steps for every component page, generated from the package name and the page's own
 * (completed, compile-checked) hero example, so copy-paste always matches the published package.
 */
function standardInstall(page: DocPage, registry: DocsRegistry): InstallStep[] {
  const pkg = registry.packageName;
  const steps: InstallStep[] = [
    { title: `Install the package (first time? see [Installation](/${registry.id}/installation) for registry access):`, packages: [pkg] },
    { title: 'Import the styles once, in your app entry or root layout:', file: { filename: '/src/main.tsx', lang: 'tsx', code: `import '${pkg}/styles.css';` } },
  ];
  if (page.hero?.code && registry.exports) {
    const code = completeSnippet(page.hero.code, { packageName: pkg, exports: registry.exports, name: `${page.title} example` });
    steps.push({ title: 'Use it inside a `.motion-root` element (add `dark` for the dark theme):', file: { filename: `/src/${page.title.replace(/\W+/g, '')}Example.tsx`, lang: 'tsx', code } });
  }
  return steps;
}

/** Source registry item for a page: the file that defines its main API (first API table), if any. */
function sourceItemFor(page: DocPage, registry: DocsRegistry): string | undefined {
  const files = registry.exports?.files;
  if (!files) return;
  const name = page.api?.[0]?.name.split(/[.\s(]/)[0] ?? page.title.replace(/\s+/g, '');
  const file = files[name];
  if (!file) return undefined;
  // styles/, lib/ and icons/ ship together as the "foundation" item (same rule as tooling/pipeline/source-registry.mjs).
  return /^(styles|lib|icons)\//.test(file) ? 'foundation' : sourceItemName(file);
}

function tocFor(page: DocPage, source?: string): TocEntry[] {
  const out: TocEntry[] = [];
  const add = (list: Section[]) => list.forEach((s) => s.title && out.push({ id: s.id ?? slugify(s.title), title: s.title }));
  add(sectionsAt(page, 'start'));
  if (page.install?.length || source) out.push({ id: 'installation', title: 'Installation', children: source ? [{ id: 'copy-the-source', title: 'Copy the source' }] : undefined });
  if (page.examples?.length)
    out.push({ id: 'examples', title: 'Examples', children: page.examples.map((e) => ({ id: exampleId(e), title: e.title })) });
  add(sectionsAt(page, 'beforeApi'));
  if (page.api?.length)
    out.push({ id: 'api-reference', title: 'API Reference', children: page.api.map((t) => ({ id: slugify(t.name), title: t.name })) });
  add(sectionsAt(page, 'end'));
  return out;
}

function Body({ page, registry }: { page: DocPage; registry: DocsRegistry }) {
  const source = sourceItemFor(page, registry);
  const structured = !!(page.install?.length || page.examples?.length || page.api?.length || page.hero);
  if (page.wide) {
    return (
      <div className="flex flex-col gap-12">
        {page.sections?.map((s, i) => (
          <Fragment key={i}>
            {i > 0 && s.title && <div className="h-px bg-ln-gray-100 lg:-mx-10" />}
            <div>
              {s.title && (
                <div id={s.id ?? slugify(s.title)} className="scroll-m-6 text-ln-title-h5 text-ln-gray-900">{s.title}</div>
              )}
              {s.blocks.map((b, j) => <RenderBlock key={j} block={b} />)}
            </div>
          </Fragment>
        ))}
      </div>
    );
  }
  return (
    <div className="md:pt-5">
      {page.hero && <ExampleBlock example={page.hero} />}
      <Sections list={sectionsAt(page, 'start')} structured={structured} />
      {page.install?.length || source ? (
        <>
          <H2 id="installation">Installation</H2>
          {page.install?.length ? <Steps steps={standardInstall(page, registry)} /> : null}
          {source && <SourceAccess system={registry.id} item={source} />}
        </>
      ) : null}
      {page.examples?.length ? (
        <>
          <H2 id="examples">Examples</H2>
          {page.examples.map((e) => (
            <Fragment key={exampleId(e)}>
              <H3 id={exampleId(e)}>{e.title}</H3>
              {typeof e.description === 'string' ? <P><Rich text={e.description} /></P> : e.description}
              <ExampleBlock example={e} />
            </Fragment>
          ))}
        </>
      ) : null}
      <Sections list={sectionsAt(page, 'beforeApi')} structured={structured} />
      {page.api?.length ? (
        <>
          <H2 id="api-reference">API Reference</H2>
          {page.api.map((t) => (
            <Fragment key={t.name}>
              <H3 id={slugify(t.name)}>{t.name}</H3>
              {t.description && <P><Rich text={t.description} /></P>}
              <PropsTable table={t} />
            </Fragment>
          ))}
        </>
      ) : null}
      <Sections list={sectionsAt(page, 'end')} structured={structured} />
    </div>
  );
}

function Sections({ list, structured }: { list: Section[]; structured: boolean }) {
  return list.map((s, i) => {
    const id = s.title ? s.id ?? slugify(s.title) : '';
    return (
      <Fragment key={i}>
        {s.title && (structured ? <H2 id={id}>{s.title}</H2> : <H3 id={id}>{s.title}</H3>)}
        {s.blocks.map((b, j) => <RenderBlock key={j} block={b} />)}
      </Fragment>
    );
  });
}

export function DocsPage({ system, slug }: { system: string; slug: string }) {
  const registry = systems[system];
  const page = registry?.pages[slug];
  if (!registry || !page) notFound();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => setNavOpen(false), [slug]);

  useEffect(() => {
    document.title = `${page.title} | ${registry.name} · Motion Docs`;
  }, [page.title, registry.name]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName);
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toc = page.wide ? [] : tocFor(page, sourceItemFor(page, registry));
  return (
    <RegistryProvider registry={registry}>
    <ChromeProvider chrome={registry.chrome}>
    <PreviewRootProvider className={registry.previewRootClassName}>
      <div className="w-full flex-1 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        <Sidebar registry={registry} systems={systemList} slug={slug} />
        <MobileNav open={navOpen} onOpenChange={setNavOpen}>
          <Sidebar registry={registry} systems={systemList} slug={slug} mobile />
        </MobileNav>
        <div className="flex min-h-screen min-w-0 flex-col px-4 sm:px-6 lg:pl-0 lg:pr-8">
          <TopBar registry={registry} onSearch={() => setSearchOpen(true)} onMenu={() => setNavOpen(true)} />
          <main className={page.wide ? 'relative flex flex-1 flex-col' : 'relative flex-1 xl:grid xl:grid-cols-[minmax(0,1fr)_288px]'}>
            <div className="flex flex-1 flex-col">
              <div className="flex w-full min-w-0 flex-1 flex-col pt-6 md:pt-10 lg:pr-6">
                <PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description} links={page.links} wide={page.wide} />
                <Body page={page} registry={registry} />
                <div className="mt-auto pb-4 pt-10 font-code text-ln-paragraph-xs text-ln-gray-500 md:text-ln-paragraph-sm">
                  © 2026 Motion. Internal documentation.
                </div>
              </div>
            </div>
            {!page.wide && <Toc entries={toc} />}
          </main>
        </div>
      </div>
      <SearchDialog registry={registry} open={searchOpen} onOpenChange={setSearchOpen} />
    </PreviewRootProvider>
    </ChromeProvider>
    </RegistryProvider>
  );
}
