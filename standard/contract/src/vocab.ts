// Shared vocabularies. Every system uses these exact values, so code written for one system
// (by a person or an AI) works unchanged in another.

/** Control and component sizes. Systems may add more (e.g. `xs`, `xl`) but must accept these. */
export type Size = 'sm' | 'md' | 'lg';

/** Semantic intent. Used by Badge, Alert, Progress, Toast, Stat deltas. */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** Categorical palette for labels, tags, chart series and avatars. Systems map these onto their own palette. */
export const colors = ['gray', 'brown', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'red'] as const;
export type Color = (typeof colors)[number];

export type Appearance = 'light' | 'dark';
export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

/**
 * Icon names every system's `<Icon name>` must accept (systems may ship more).
 * Semantic, not pictorial: `close` not `xMark`, `more` not `ellipsis`.
 */
export const coreIconNames = [
  // actions
  'plus', 'minus', 'close', 'check', 'search', 'filter', 'sort', 'settings', 'more', 'moreVertical', 'menu',
  'edit', 'trash', 'copy', 'link', 'externalLink', 'download', 'upload', 'share', 'send', 'refresh', 'drag',
  'attachment', 'logout', 'star', 'heart', 'bookmark', 'pin', 'eye', 'eyeOff', 'lock', 'unlock',
  // navigation
  'chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight', 'chevronsUpDown',
  'arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight', 'arrowUpRight', 'home', 'sidebar', 'grid', 'list',
  // objects
  'user', 'users', 'bell', 'calendar', 'clock', 'mail', 'phone', 'file', 'folder', 'image', 'globe',
  'chart', 'board', 'table', 'timeline', 'tag', 'flag', 'comment', 'inbox', 'archive',
  // finance
  'wallet', 'creditCard', 'bank', 'currency', 'receipt', 'trendingUp', 'trendingDown',
  // status
  'info', 'warning', 'error', 'success', 'help',
  // appearance
  'sun', 'moon',
] as const;
export type CoreIconName = (typeof coreIconNames)[number];
