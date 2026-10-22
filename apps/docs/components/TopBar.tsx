'use client';
import { useState } from 'react';
import type { DocsRegistry } from '@/lib/types';
import { AppIcon, CheckIcon, LinkIcon, MoonIcon, SearchIcon, SunIcon } from './icons';
import { useTheme } from './theme';
import { useChrome } from './chrome';

const iconBtn = 'flex size-8 cursor-pointer items-center justify-center rounded-docs-lg text-ln-gray-450 transition ease-linear hover:bg-ln-hover';

function MenuButton({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" aria-label="Open navigation" onClick={onClick} className="-ml-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-docs-md text-ln-gray-600 hover:bg-ln-hover lg:hidden">
      <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" /></svg>
    </button>
  );
}

export function TopBar({ registry, onSearch, onMenu }: { registry: DocsRegistry; onSearch: () => void; onMenu?: () => void }) {
  const { theme, toggle } = useTheme();
  const [copied, setCopied] = useState(false);
  const chrome = useChrome();
  const copyLink = () => {
    navigator.clipboard?.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  if (chrome.SearchTrigger && chrome.IconButton) {
    const { SearchTrigger, IconButton } = chrome;
    return (
      <header className="flex h-14 w-full items-center justify-between gap-3 border-b border-ln-gray-100 lg:h-[84px] lg:gap-5">
        <MenuButton onClick={onMenu} />
        <div className="min-w-0 flex-1 lg:flex-none"><SearchTrigger onClick={onSearch} /></div>
        <div className="flex shrink-0 gap-1">
          <IconButton icon={theme === 'dark' ? 'theme-light' : 'theme-dark'} label="Toggle theme" onClick={toggle} />
          <IconButton icon={copied ? 'check' : 'link'} label="Copy page link" onClick={copyLink} />
          <IconButton icon="app" label={`Open ${registry.name} app`} href={registry.appUrl ?? '#'} />
        </div>
      </header>
    );
  }
  return (
    <header className="flex h-16 w-full items-center justify-between gap-5 lg:h-[84px] lg:border-b lg:border-ln-gray-100">
      <div className="flex items-center gap-4">
        <MenuButton onClick={onMenu} />
        <button
          type="button"
          onClick={onSearch}
          className="flex size-6 cursor-pointer items-center gap-2 transition lg:h-9 lg:w-[456px] lg:rounded-docs-lg lg:bg-ln-gray-0 lg:pl-2.5 lg:pr-2 lg:text-left lg:ring-1 lg:ring-[var(--ln-search-ring)] lg:hover:bg-ln-hover"
        >
          <SearchIcon className="size-6 text-ln-gray-700 lg:size-[18px] lg:text-ln-gray-400" />
          <span className="hidden flex-1 text-ln-paragraph-sm text-ln-gray-500 lg:block">Quick search...</span>
          <span className="hidden size-5 items-center justify-center rounded-docs-sm bg-ln-gray-50 text-center text-[12px]/[13px] font-medium text-ln-gray-600 lg:flex">
            /
          </span>
        </button>
      </div>
      <div className="hidden gap-2 lg:flex">
        <button type="button" className={iconBtn} aria-label="Toggle theme" title="Toggle theme" onClick={toggle}>
          {theme === 'dark' ? <SunIcon className="size-[18px]" /> : <MoonIcon className="size-[18px]" />}
        </button>
        <button
          type="button"
          className={iconBtn}
          aria-label="Copy page link"
          title="Copy page link"
          onClick={() => {
            navigator.clipboard?.writeText(location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? <CheckIcon className="size-[18px]" /> : <LinkIcon className="size-[18px]" />}
        </button>
        <a className={iconBtn} aria-label={`Open ${registry.name} app`} title={`Open ${registry.name} app`} href={registry.appUrl ?? '#'} target="_blank" rel="noreferrer">
          <AppIcon className="size-[18px]" />
        </a>
      </div>
    </header>
  );
}
