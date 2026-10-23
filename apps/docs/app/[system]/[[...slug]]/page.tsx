import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DocsPage } from '@/components/DocsPage';
import { homeSlugs } from '@/systems-meta';
import { pageHref } from '@/lib/nav';
import { pageMeta } from '@/page-meta';

type Params = { params: Promise<{ system: string; slug?: string[] }> };

/** Server-rendered title and description, so tabs, search results and link previews name the page. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { system, slug } = await params;
  const registry = pageMeta[system];
  const page = registry?.pages[slug?.join('/') ?? ''];
  if (!registry || !page) return { title: registry ? `${registry.name} · KrackedUI` : 'KrackedUI' };
  return {
    title: `${page.title} · ${registry.name}`,
    description: page.description ?? registry.tagline,
    openGraph: { title: `${page.title} · ${registry.name}`, description: page.description ?? registry.tagline, siteName: 'KrackedUI' },
  };
}

export default async function Page({ params }: Params) {
  const { system, slug } = await params;
  if (!slug?.length) redirect(pageHref(system, homeSlugs[system] ?? 'introduction'));
  return <DocsPage system={system} slug={slug.join('/')} />;
}
