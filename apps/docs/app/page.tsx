import { redirect } from 'next/navigation';
import { defaultSystem, homeSlugs } from '@/systems-meta';
import { pageHref } from '@/lib/nav';

export default function Home() {
  redirect(pageHref(defaultSystem, homeSlugs[defaultSystem]));
}
