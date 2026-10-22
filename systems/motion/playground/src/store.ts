// Workspace state for the rebuilt app: page tree + per-database data, persisted to localStorage.
import { useCallback, useEffect, useState } from 'react';
import type { Block, DatabaseData } from '@krackedui/motion';
import { createTasksSample } from '@krackedui/motion';
import { seedWorkspace, type PageNode } from './data/workspace';

const KEY = 'motion-playground:v1';

interface Stored { pages: PageNode[]; databases: Record<string, DatabaseData>; theme: 'light' | 'dark' }

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { pages: seedWorkspace(), databases: {}, theme: 'light' };
}

export function findPage(pages: PageNode[], id: string): PageNode | undefined {
  for (const p of pages) {
    if (p.id === id) return p;
    const hit = findPage(p.children, id);
    if (hit) return hit;
  }
}

export function pathTo(pages: PageNode[], id: string, trail: PageNode[] = []): PageNode[] | undefined {
  for (const p of pages) {
    const next = [...trail, p];
    if (p.id === id) return next;
    const hit = pathTo(p.children, id, next);
    if (hit) return hit;
  }
}

function mapPages(pages: PageNode[], id: string, fn: (p: PageNode) => PageNode): PageNode[] {
  return pages.map((p) => (p.id === id ? fn(p) : { ...p, children: mapPages(p.children, id, fn) }));
}

export function useWorkspace() {
  const [state, setState] = useState<Stored>(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const updatePage = useCallback((id: string, patch: Partial<PageNode>) => {
    setState((s) => ({ ...s, pages: mapPages(s.pages, id, (p) => ({ ...p, ...patch })) }));
  }, []);

  const setBlocks = useCallback((id: string, blocks: Block[]) => updatePage(id, { blocks }), [updatePage]);

  const addPage = useCallback((parentId?: string): string => {
    const page: PageNode = { id: `page-${Date.now().toString(36)}`, title: '', kind: 'page', blocks: [], children: [] };
    setState((s) => ({
      ...s,
      pages: parentId ? mapPages(s.pages, parentId, (p) => ({ ...p, children: [...p.children, page] })) : [...s.pages, page],
    }));
    return page.id;
  }, []);

  const database = useCallback((id: string): DatabaseData => state.databases[id] ?? createTasksSample(), [state.databases]);
  const setDatabase = useCallback((id: string, data: DatabaseData) => {
    setState((s) => ({ ...s, databases: { ...s.databases, [id]: data } }));
  }, []);

  const toggleTheme = useCallback(() => setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })), []);
  const reset = useCallback(() => setState({ pages: seedWorkspace(), databases: {}, theme: state.theme }), [state.theme]);

  return { ...state, updatePage, setBlocks, addPage, database, setDatabase, toggleTheme, reset };
}
