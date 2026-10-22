import { IconButton, Menu, useTheme } from '@krackedui/motion';
import type { ThemePreference } from '../state/theme';

/** Light / dark / system switch for the top bar. */
export function ThemeMenu({ value, onChange }: { value: ThemePreference; onChange: (next: ThemePreference) => void }) {
  const { resolvedAppearance } = useTheme();
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton icon={resolvedAppearance === 'dark' ? 'moon' : 'sun'} label="Theme" />
      </Menu.Trigger>
      <Menu.Content width={180} align="end">
        <Menu.Label>Theme</Menu.Label>
        <Menu.RadioGroup value={value} onValueChange={(v) => onChange(v as ThemePreference)}>
          <Menu.RadioItem value="system" icon="sliders">System</Menu.RadioItem>
          <Menu.RadioItem value="light" icon="sun">Light</Menu.RadioItem>
          <Menu.RadioItem value="dark" icon="moon">Dark</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}
