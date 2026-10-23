// Motion's simple, semantic icon names (close, more, chevronDown…), available alongside its detailed
// drawing names. Used by the Icons docs page and the playground lab.
export const semanticIconNames = [
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
export type SemanticIconName = (typeof semanticIconNames)[number];
