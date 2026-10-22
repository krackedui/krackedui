import type { MonthFlow } from './types';

/** Twelve months of money in / out, oldest first; the last entry is the current month (October 2026). */
export const monthlyFlows: MonthFlow[] = [
  { month: 'Nov', moneyIn: 78_420, moneyOut: 66_910 },
  { month: 'Dec', moneyIn: 96_180, moneyOut: 74_350 },
  { month: 'Jan', moneyIn: 71_260, moneyOut: 65_780 },
  { month: 'Feb', moneyIn: 73_940, moneyOut: 63_120 },
  { month: 'Mar', moneyIn: 81_570, moneyOut: 67_440 },
  { month: 'Apr', moneyIn: 84_030, moneyOut: 69_910 },
  { month: 'May', moneyIn: 88_760, moneyOut: 71_280 },
  { month: 'Jun', moneyIn: 86_210, moneyOut: 73_640 },
  { month: 'Jul', moneyIn: 90_480, moneyOut: 72_150 },
  { month: 'Aug', moneyIn: 87_930, moneyOut: 70_860 },
  { month: 'Sep', moneyIn: 85_120, moneyOut: 69_470 },
  { month: 'Oct', moneyIn: 91_640, moneyOut: 71_020 },
];

export const netOf = (m: MonthFlow) => m.moneyIn - m.moneyOut;
