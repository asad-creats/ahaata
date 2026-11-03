import type { Status } from './inventory';

export type Currency = 'PKR' | 'USD' | 'AED' | 'GBP';
export const RATES: Record<Currency, number> = { PKR: 1, USD: 280, AED: 76.3, GBP: 355 };

/** PKR in Cr / lakh; other currencies are indicative, rounded, with thousands separators. */
export function money(pkr: number, cur: Currency) {
  if (cur === 'PKR') return pkr >= 10000000 ? `PKR ${(pkr / 10000000).toFixed(2)} Cr` : `PKR ${(pkr / 100000).toFixed(2)} lakh`;
  return `${cur} ${Math.round(pkr / RATES[cur]).toLocaleString('en-US')}`;
}

export type Plot = { no: string; k: Status };

const pick = (i: number, bias: number): Status => {
  const h = (i * 37 + bias) % 10;
  return h < 3 ? 'S' : h < 6 ? 'B' : h < 7 ? 'H' : 'A';
};

const block = (n: number, prefix: string, start: number, bias: number): Plot[] =>
  Array.from({ length: n }, (_, i) => {
    const no = `${prefix}${start + i}`;
    return { no, k: no === 'C-114' ? 'A' : pick(i, bias) };
  });

export const BLOCK_A = block(40, 'A-', 1, 3);
export const BLOCK_C = block(32, 'C-', 101, 5);
export const SHOPS = block(12, 'S-', 1, 7);

export type Listing = {
  code: string;
  plot: string;
  spec: string;
  price: number;
  plan: string;
  status: Status;
};

export const LISTINGS: Listing[] = [
  { code: 'Plot C-108', plot: 'C-108', spec: '10 marla · 35×65 ft · Block C · 40 ft road', price: 11800000, plan: '25% down + 16 quarterly', status: 'A' },
  { code: 'Plot C-114', plot: 'C-114', spec: '10 marla · corner · park lane · Block C', price: 13200000, plan: '25% down + 16 quarterly', status: 'A' },
  { code: 'Plot C-121', plot: 'C-121', spec: '10 marla · Block C · facing mosque', price: 12400000, plan: '25% down + 16 quarterly', status: 'A' },
  { code: 'Plot C-126', plot: 'C-126', spec: '10 marla · Block C · 40 ft road', price: 12000000, plan: 'On hold for 18h — check back', status: 'H' },
  { code: 'Plot B-212', plot: 'B-212', spec: '10 marla · Block B · boulevard facing', price: 15500000, plan: '30% down + 12 quarterly', status: 'A' },
];

export type UnitDetail = {
  code: string;
  kind: 'apartment' | 'plot';
  project: string;
  title: string;
  sub: string;
  crumb: string[];
  price: number;
  rate: string;
  approval: string;
  possession?: string;
  facts: [string, string][];
  /** Share paid on possession; plots have none. */
  possessionShare: number;
  similar: [string, number][];
};

export const UNITS: Record<string, UnitDetail> = {
  'B-504': {
    code: 'B-504',
    kind: 'apartment',
    project: 'Saffron Residencia',
    title: '2-bed apartment B-504',
    sub: 'Tower B, 5th floor · 1,150 sq ft covered · East facing · 1 covered parking · Gulberg III, Lahore',
    crumb: ['All units', 'Tower B', 'Floor 5', 'B-504'],
    price: 18500000,
    rate: 'PKR 16,087 / sq ft',
    approval: 'LDA approved · Building plan LDA/BP/2025/0441',
    possession: 'Possession Dec 2028',
    facts: [
      ['Covered area', '1,150 sq ft (106.8 m²)'],
      ['Bedrooms / baths', '2 / 2'],
      ['Floor', '5 of 14 · 3 lifts per tower'],
      ['Facing', 'East (morning sun)'],
      ['Parking', '1 covered, basement 2'],
      ['Maintenance', 'PKR 8 / sq ft / month'],
    ],
    possessionShare: 0.1,
    similar: [
      ['B-404 · 4th floor · East', 18100000],
      ['B-702 · 7th floor · West', 19200000],
      ['A-602 · 6th floor · North', 18600000],
    ],
  },
  'C-114': {
    code: 'C-114',
    kind: 'plot',
    project: 'Saffron Gardens',
    title: 'Plot C-114 · 10 marla corner',
    sub: 'Block C · 35×65 ft · corner · faces park lane · 40 ft road · Islamabad',
    crumb: ['All plots', 'Block C', 'C-114'],
    price: 13200000,
    rate: 'PKR 13.2 lakh / marla',
    approval: 'RDA approved · NOC RDA/LUB/2024/118',
    facts: [
      ['Size', '10 marla · 35×65 ft'],
      ['Features', 'Corner · park lane'],
      ['Road', '40 ft, carpeted'],
      ['Utilities', 'Electricity, gas, water — laid'],
      ['Development', 'Block C 85% complete'],
      ['Transfer', 'Allotment letter on 25% payment'],
    ],
    possessionShare: 0,
    similar: [
      ['C-108 · 40 ft road', 11800000],
      ['C-121 · facing mosque', 12400000],
      ['B-212 · boulevard facing', 15500000],
    ],
  },
};

/** Detail for any plot or unit code; plots without a hand-written page reuse the C-114 template. */
export function unitFor(code: string): UnitDetail {
  if (UNITS[code]) return UNITS[code];
  const listing = LISTINGS.find((l) => l.plot === code);
  const base = UNITS['C-114'];
  const blockLetter = code.split('-')[0];
  const size = blockLetter === 'A' ? '5 marla' : blockLetter === 'S' ? 'Shop' : '10 marla';
  const price = listing?.price ?? (blockLetter === 'A' ? 7200000 : blockLetter === 'S' ? 21000000 : 12600000);
  return {
    ...base,
    code,
    title: `${blockLetter === 'S' ? 'Shop' : 'Plot'} ${code} · ${size}`,
    sub: listing ? `${listing.spec} · Islamabad` : `Block ${blockLetter} · ${size} · Islamabad`,
    crumb: ['All plots', `Block ${blockLetter}`, code],
    price,
    facts: [['Size', size], ...base.facts.slice(1)],
  };
}
