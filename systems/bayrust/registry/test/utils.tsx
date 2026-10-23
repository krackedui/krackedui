// Bayrust's test helpers: render inside Bayrust's Theme and ToastProvider, because overlays portal
// into the Theme and the toast hook throws without its provider. Tests import from '@system', never
// a source path, so they exercise the package's public API the way an app does.
import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme, ToastProvider } from '@system';

export function renderUI(ui: ReactElement, options?: RenderOptions) {
  const user = userEvent.setup();
  const result = render(
    <Theme>
      <ToastProvider>{ui}</ToastProvider>
    </Theme>,
    options,
  );
  return { user, ...result };
}

export * from '@testing-library/react';
