// The sample company and the fixed "today" every date in the sample data is relative to.
import { parseDate } from '../lib/dates';

export const company = {
  name: 'Lumen Coffee Co.',
  legalName: 'Lumen Coffee Company LLC',
  email: 'finance@lumencoffee.example',
  phone: '(503) 555-0142',
  address: '418 Alder Street, Portland, OR 97205',
  taxId: '93-4417820',
  currency: 'USD',
};

/** Other workspaces in the company switcher. */
export const otherCompanies = ['Lumen Roastery', 'Lumen Cafés West'];

/** The signed-in user. */
export const currentUser = { name: 'Maya Chen', email: 'maya@lumencoffee.example', role: 'Owner' as const };

/** "Today" is fixed so the sample data and the date presets are deterministic. */
export const TODAY_ISO = '2026-10-21';
export const TODAY = parseDate(TODAY_ISO);

/** Below this balance an account shows a low-balance alert. */
export const LOW_BALANCE_THRESHOLD = 25_000;
