// Bayrust's interface icons. One 24×24 stroke path per name in `coreIconNames`, drawn for this
// system: 1.75 stroke, round caps and joins, geometry on a 2px grid. A dot is a zero-length segment
// (`h.01`), which the round cap renders as a circle.
//
// These are the system's own drawings. The reference's icon set is not shipped (AGENTS.md).

export const iconPaths = {
  // actions
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M4 12.5l5 5L20 6.5',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20.5 20.5l-4.1-4.1',
  filter: 'M4 6h16M7 12h10M10 18h4',
  sort: 'M4 7h10M4 12h7M4 17h4M17 4v16M17 20l3-3M17 20l-3-3',
  // a cog, not a ring of spokes — spokes read as `sun` at 16px
  settings:
    'M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.4 2.6A7.6 7.6 0 0 0 7 6.1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2.6 1.5L10 22h4l.4-2.4a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  moreVertical: 'M12 6h.01M12 12h.01M12 18h.01',
  menu: 'M4 7h16M4 12h16M4 17h16',
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  link: 'M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7l-1 1M13.5 10.5a4 4 0 0 0-5.7 0L5 13.3a4 4 0 1 0 5.7 5.7l1-1',
  externalLink: 'M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  download: 'M12 3v12M7 11l5 5 5-5M4 20h16',
  upload: 'M12 17V5M7 9l5-5 5 5M4 20h16',
  share: 'M12 3v12M8 7l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6',
  send: 'M21 3L10.5 13.5M21 3l-7 18-3.5-7.5L3 10l18-7Z',
  refresh: 'M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4',
  drag: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  attachment:
    'M19 11l-7.5 7.5a4.6 4.6 0 0 1-6.5-6.5l8-8a3.3 3.3 0 0 1 4.6 4.6l-8 8a2 2 0 0 1-2.8-2.8l7.2-7.2',
  logout: 'M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4M10 12h9M13 9l3 3-3 3',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z',
  heart: 'M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z',
  bookmark: 'M6 4h12v17l-6-4-6 4V4Z',
  pin: 'M9 3h6l-1 6 4 3v2H6v-2l4-3-1-6ZM12 14v7',
  eye: 'M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M4 4l16 16M10 6.2A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.3 3.8M6.5 8.3A17 17 0 0 0 2 12s3.6 6 10 6a9.6 9.6 0 0 0 3.3-.6',
  lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  unlock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 5.7-1.4',

  // navigation
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  chevronsUpDown: 'M8 9l4-4 4 4M8 15l4 4 4-4',
  arrowUp: 'M12 20V4M6 10l6-6 6 6',
  arrowDown: 'M12 4v16M6 14l6 6 6-6',
  arrowLeft: 'M20 12H4M10 6l-6 6 6 6',
  arrowRight: 'M4 12h16M14 6l6 6-6 6',
  arrowUpRight: 'M7 17L17 7M8 7h9v9',
  home: 'M4 11l8-7 8 7M6 10v10h12V10',
  sidebar: 'M4 5h16v14H4zM10 5v14',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  list: 'M4 6h2M9 6h11M4 12h2M9 12h11M4 18h2M9 18h11',

  // objects
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0',
  users: 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 20a7 7 0 0 1 14 0M16 5.1a4 4 0 0 1 0 7.8M18.5 20a6.5 6.5 0 0 0-2.2-4.8',
  bell: 'M6 9a6 6 0 1 1 12 0c0 4 1.5 6 1.5 6h-15S6 13 6 9ZM10 19a2 2 0 0 0 4 0',
  calendar: 'M4 6h16v15H4zM4 10h16M9 3v4M15 3v4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  phone: 'M7 3l3 4-2 2a12 12 0 0 0 5 5l2-2 4 3-2 3c-7 1-15-7-14-14l4-1Z',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5',
  folder: 'M3 6h6l2 2h10v11H3z',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z',
  chart: 'M4 20V4M4 20h16M8 17v-5M12 17V8M16 17v-8',
  board: 'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z',
  table: 'M3 5h18v14H3zM3 10h18M9 10v9M15 10v9',
  timeline: 'M3 6h12M3 12h17M3 18h8',
  tag: 'M4 4h7l9 9-7 7-9-9V4ZM8 8h.01',
  flag: 'M5 21V4M5 5h11l-2 4 2 4H5',
  comment: 'M4 5h16v11H9l-5 4V5Z',
  inbox: 'M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6l2-8Z',
  archive: 'M3 4h18v4H3zM5 8v12h14V8M10 12h4',

  // finance
  wallet: 'M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4V7ZM4 7V5h12M16 13h.01',
  creditCard: 'M3 6h18v12H3zM3 10h18M7 15h3',
  bank: 'M3 9l9-5 9 5M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18',
  currency:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15 9.5A3.3 3.3 0 0 0 12 8c-1.7 0-3 1-3 2.2 0 2.8 6 1.4 6 4.1 0 1.2-1.3 2.2-3 2.2a3.3 3.3 0 0 1-3-1.5M12 6.5v11',
  receipt: 'M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5V3ZM9 8h6M9 12h6',
  trendingUp: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  trendingDown: 'M3 7l6 6 4-4 8 8M15 17h6v-6',

  // status
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7.5h.01',
  warning: 'M12 3l10 17H2L12 3ZM12 9v5M12 17.5h.01',
  error: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  success: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l2.5 2.5L16 9.5',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.8a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.7M12 17.5h.01',

  // appearance
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z',
} as const;

export type IconName = keyof typeof iconPaths;
