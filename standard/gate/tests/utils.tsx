// Shared helpers for contract tests. Tests import components from '@system' only, never a path,
// so the same test verifies every system.
import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme, ToastProvider } from '@system';

export function renderUI(ui: ReactElement, options?: RenderOptions) {
  const user = userEvent.setup();
  const result = render(<Theme><ToastProvider>{ui}</ToastProvider></Theme>, options);
  return { user, ...result };
}
export * from '@testing-library/react';
