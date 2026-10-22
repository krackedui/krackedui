// krackedui.com/marketplace: every KrackedUI design system, searchable.
import type { Metadata } from 'next';
import { catalog, contractSize } from '@/catalog';
import { MarketplaceGrid } from '@/components/site/MarketplaceGrid';

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse KrackedUI design systems: same components and props, different looks. Each one ships with live templates.',
};

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="kui-code text-[12px] uppercase tracking-[0.12em] text-[var(--kui-accent-text)]">Marketplace</p>
        <h1 className="mt-3 text-[36px] font-semibold leading-tight tracking-[-0.03em] sm:text-[48px]">Pick a look. Keep your code.</h1>
        <p className="mt-4 text-[16px] leading-7 text-[var(--kui-muted)]">
          Every system implements the same {contractSize} components with the same props, passes the same 14-check gate and ships two
          live templates. Browse by style or sector.
        </p>
      </header>
      <div className="mt-10">
        <MarketplaceGrid systems={catalog} />
      </div>
    </div>
  );
}
