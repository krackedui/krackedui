import { redirect } from 'next/navigation';
import { DocsPage } from '@/components/DocsPage';
import { homeSlugs } from '@/systems-meta';
import { pageHref } from '@/lib/nav';

export default async function Page({ params }: { params: Promise<{ system: string; slug?: string[] }> }) {
  const { system, slug } = await params;
  if (!slug?.length) redirect(pageHref(system, homeSlugs[system] ?? 'introduction'));
  return <DocsPage system={system} slug={slug.join('/')} />;
}
