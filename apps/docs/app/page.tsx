// The docs app's root: krackedui.com itself is served by the separate site project (krackedui/site);
// here `/` opens the default system's docs.
import { redirect } from 'next/navigation';
import { defaultSystem, homeSlugs } from '@/systems-meta';
import { pageHref } from '@/lib/nav';

export default function Home() {
  redirect(pageHref(defaultSystem, homeSlugs[defaultSystem]));
}
