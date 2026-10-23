// Motion's test helpers: render inside Motion's Theme + ToastProvider. Tests import components from
// '@system' (the system under test), never a source path.
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
