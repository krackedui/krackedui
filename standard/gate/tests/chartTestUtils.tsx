// Shared expectations for chart contract tests: named image, hidden data table, keyboard readout.
import { expect } from 'vitest';
import { screen, within } from './utils';
import type { UserEvent } from '@testing-library/user-event';

export function expectAccessibleChart(label: string, columns: string[], firstRow: string[]) {
  expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  const table = screen.getByRole('table', { name: label });
  expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(columns);
  const row = within(table).getAllByRole('row')[1];
  expect(row).toBeDefined();
  expect([...(row as HTMLElement).querySelectorAll('th, td')].map((c) => c.textContent)).toEqual(firstRow);
}

/** Tabs to the chart, presses keys, returns the live-region text. */
export async function readWithKeyboard(user: UserEvent, label: string, keys: string) {
  const chart = screen.getByRole('img', { name: label });
  await user.tab();
  expect(chart).toHaveFocus();
  await user.keyboard(keys);
  const live = document.querySelector('[aria-live="polite"]');
  return live?.textContent ?? '';
}
