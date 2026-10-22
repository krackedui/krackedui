// Block editor: interactive editing of a Block[] document, plus its menus.
export { Editor, EDITOR_PLACEHOLDER, blockIds, type EditorProps } from './Editor';
export { SlashMenu, slashItems, type SlashMenuProps } from './SlashMenu';
export { BlockActionMenu, blockLabel, toColorValue, fromColorValue, type BlockActionMenuProps } from './BlockActionMenu';
export { TurnIntoMenu, type TurnIntoMenuProps } from './TurnIntoMenu';
export { TextToolbar, type TextToolbarProps, type ToolbarMark } from './TextToolbar';
export { slashGroups, filterSlash, turnIntoItems, newBlock, isKind, type SlashGroup, type SlashItem, type TurnIntoItem, type BlockKind } from './commands';
export * as blockTree from './tree';
