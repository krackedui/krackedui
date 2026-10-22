import type { CompanyCard } from './types';

export const initialCards: CompanyCard[] = [
  { id: 'card_1', holder: 'Maya Chen', last4: '4242', limit: 15_000, spent: 6_240.18, status: 'Active' },
  { id: 'card_2', holder: 'Diego Alvarez', last4: '1187', limit: 5_000, spent: 4_310.42, status: 'Active' },
  { id: 'card_3', holder: 'Priya Nair', last4: '5520', limit: 3_000, spent: 980.0, status: 'Frozen' },
  { id: 'card_4', holder: 'Sam Okafor', last4: '7731', limit: 2_000, spent: 412.65, status: 'Active' },
];
