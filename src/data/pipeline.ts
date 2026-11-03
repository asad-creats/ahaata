import type { AgeState } from '../components/ui';

export type Card = { id: string; name: string; unit: string; src: string; owner: string; budget: string; age: string; st: AgeState };
export type Column = { name: string; n: number; value: string; sla: string; late: number; cards: Card[] };

let seq = 0;
const k = (name: string, unit: string, src: string, owner: string, budget: string, age: string, st: AgeState): Card => ({
  id: `c${++seq}`,
  name,
  unit,
  src,
  owner,
  budget,
  age,
  st,
});

/** Stages in order. Token and later cannot be entered without a Booking. */
export const STAGES = ['New', 'Contacted', 'Qualified', 'Units of interest', 'Visit scheduled', 'Visit done', 'Payment plan shared', 'Negotiation', 'Token', 'Agreement', 'Instalments', 'Possession'];
export const BOOKING_FROM = STAGES.indexOf('Token');

export const COLUMNS: Column[] = [
  { name: 'New', n: 64, value: 'PKR 9.8 Cr', sla: '15 min', late: 9, cards: [k('Bilal Hussain', '2-bed', 'Facebook', 'UT', 'PKR 1.5–1.9 Cr', '32m', 'r'), k('Kamran Javed', 'Studio', 'Graana', 'SN', 'PKR 85 lakh', '11m', 'a'), k('Rabia Anwar', '3-bed', 'Website', '?', 'PKR 2.5 Cr', '3m', 'g'), k('Shahid Latif', 'Plot 5 marla', 'Zameen', 'MB', 'PKR 72 lakh', '1m', 'g')] },
  { name: 'Contacted', n: 58, value: 'PKR 10.2 Cr', sla: '2d', late: 4, cards: [k('Nida Hassan', '2-bed', 'Facebook', 'SN', 'PKR 1.7 Cr', '4d', 'r'), k('Asim Raza Khan Niazi', 'Shop G-12', 'Dealer', 'UT', 'PKR 3.1 Cr', '1d', 'a'), k('Saima Iqbal', '1-bed', 'Walk-in', 'MB', 'PKR 1.1 Cr', '6h', 'g')] },
  { name: 'Qualified', n: 71, value: 'PKR 14.6 Cr', sla: '5d', late: 11, cards: [k('Tariq Mehmood', '3-bed', 'Expo', 'UT', 'PKR 2.4 Cr', '9d', 'r'), k('Sadia Rehman', 'A-1203', 'Zameen', 'UT', 'PKR 2.10 Cr', '4d', 'a'), k('Waqas Ali', '2-bed', 'Facebook', 'FN', 'PKR 1.6 Cr', '2d', 'g'), k('Farah Naz', 'Plot 10 marla', 'Graana', 'SN', 'PKR 1.35 Cr', '1d', 'g')] },
  { name: 'Units of interest', n: 49, value: 'PKR 11.0 Cr', sla: '5d', late: 0, cards: [k('Zubair Qureshi', 'B-702', 'Dealer', 'UT', 'PKR 1.92 Cr', '3d', 'g'), k('Nadia Farooq', 'C-1102', 'Facebook', 'MB', 'PKR 2.40 Cr', '4d', 'a'), k('Junaid Akhtar', 'A-304', 'Walk-in', 'FN', 'PKR 1.45 Cr', '1d', 'g')] },
  { name: 'Visit scheduled', n: 32, value: 'PKR 7.4 Cr', sla: '7d', late: 3, cards: [k('Ayesha Malik', 'C-1102', 'Zameen', 'UT', 'PKR 2.40 Cr', '2d', 'g'), k('Imran Shah', 'B-405', 'Facebook', 'SN', 'PKR 1.80 Cr', '9d', 'r'), k('Sana Javed', 'Plot C-118', 'Expo', 'FN', 'PKR 1.35 Cr', '5d', 'a')] },
  { name: 'Visit done', n: 41, value: 'PKR 9.9 Cr', sla: '5d', late: 7, cards: [k('Hamza Siddiqui', 'Plot C-114', 'Expo', 'UT', 'PKR 1.32 Cr', '21d', 'r'), k('Hina Aslam', 'C-1102', 'Walk-in', 'UT', 'PKR 2.40 Cr', '1d', 'g'), k('Omer Farooq', 'B-1001', 'Dealer', 'MB', 'PKR 2.05 Cr', '6d', 'r'), k('Lubna Shah', 'A-605', 'Graana', 'SN', 'PKR 1.50 Cr', '3d', 'g')] },
  { name: 'Payment plan shared', n: 37, value: 'PKR 8.6 Cr', sla: '7d', late: 12, cards: [k('Shahzad Malik', 'C-1401', 'Zameen', 'FN', 'PKR 2.60 Cr', '11d', 'r'), k('Kiran Akhtar', 'B-805', 'Facebook', 'UT', 'PKR 1.90 Cr', '5d', 'a')] },
  { name: 'Negotiation', n: 22, value: 'PKR 5.4 Cr', sla: '7d', late: 5, cards: [k('Faraz Ahmed', 'B-504', 'Facebook', 'UT', 'PKR 1.85 Cr', '12d', 'r'), k('Asma Bano', 'A-702', 'Expo', 'MB', 'PKR 1.95 Cr', '3d', 'g')] },
  { name: 'Token', n: 14, value: 'PKR 3.3 Cr', sla: '10d', late: 0, cards: [k('Hafsa Noor', 'A-505', 'Website', 'UT', 'PKR 1.70 Cr', '2d', 'g')] },
  { name: 'Agreement', n: 11, value: 'PKR 2.6 Cr', sla: '30d', late: 1, cards: [k('Rubina Khalid', 'A-1402', 'Dealer', 'UT', 'PKR 2.30 Cr', '34d', 'r')] },
  { name: 'Instalments', n: 9, value: 'PKR 2.1 Cr', sla: '—', late: 0, cards: [k('Nasir Hussain', 'B-1203', 'Zameen', 'FN', 'PKR 2.02 Cr', '—', 'g')] },
  { name: 'Possession', n: 4, value: 'PKR 0.9 Cr', sla: '—', late: 0, cards: [] },
];

export const LOST_REASONS = ['Price above budget', 'Bought elsewhere', 'Location / distance', 'Payment plan terms', 'Not reachable (5 tries)', 'Wants ready possession', 'Duplicate / fake lead', 'Other (note required)'];
