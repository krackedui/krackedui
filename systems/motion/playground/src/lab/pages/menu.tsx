import { MenuSurface, MenuList, MenuRow, MenuSeparator, MenuSearch, MenuFooter } from '@krackedui/motion';

/** Static page "Actions" menu. */
export default function MenuLab() {
  return (
    <div className="p-6">
      <MenuSurface width={256}>
        <MenuSearch placeholder="Search actions…" />
        <MenuList>
          <MenuRow icon="link" shortcut="⌘L" highlighted>Copy link</MenuRow>
          <MenuRow icon="duplicate">Copy page contents</MenuRow>
          <MenuRow icon="duplicate" shortcut="⌘D">Duplicate</MenuRow>
          <MenuRow icon="arrowTurnUpRight" shortcut="⌘⇧P">Move to</MenuRow>
        </MenuList>
        <MenuSeparator />
        <MenuList>
          <MenuRow icon="clock">Version history</MenuRow>
          <MenuRow icon="bell" description="Comments" submenu>Notify me</MenuRow>
          <MenuRow icon="trash" tone="danger">Move to Trash</MenuRow>
        </MenuList>
        <MenuFooter>130 words<br />Last edited by Ada Lovelace</MenuFooter>
      </MenuSurface>
    </div>
  );
}
