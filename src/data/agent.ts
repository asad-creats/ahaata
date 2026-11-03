import type { Tone } from '../components/ui';

export type CallRow = {
  name: string;
  phone: string;
  why: string;
  source: string;
  unit: string;
  budget: string;
  tone: Tone;
  sla: string;
  pct: number;
};

const row = (name: string, phone: string, why: string, source: string, unit: string, budget: string, tone: Tone, sla: string, pct: number): CallRow => ({
  name,
  phone,
  why,
  source,
  unit,
  budget,
  tone,
  sla,
  pct,
});

/** "Call now" queue — sorted by SLA remaining, not by date created. */
export const CALLS: CallRow[] = [
  row('Bilal Hussain', '0321 448 2093', 'New lead, never contacted', 'Facebook Lead Ads · 32 min ago', '2-bed', 'PKR 1.5–1.9 Cr', 'bad', 'Breached by 17 min', 100),
  row('Sadia Rehman', '0300 771 0456', 'Hold A-1203 expires in 1h', 'Zameen · Qualified', 'A-1203', 'PKR 2.10 Cr', 'bad', 'Breached by 2 min', 100),
  row('Kamran Javed', '0345 902 1187', 'New lead, never contacted', 'Graana · 11 min ago', 'Studio', 'PKR 85 lakh', 'warn', '4 min left', 73),
  row('Hina Aslam', '0332 615 7740', 'Asked for callback 12:30', 'Walk-in · Visit done', 'C-1102', 'PKR 2.40 Cr', 'ok', '1h 20m left', 30),
  row('Zubair Qureshi', '0300 210 3364', 'Opened payment plan twice', 'Dealer · Al-Noor Estate', 'B-702', 'PKR 1.92 Cr', 'ok', '3h 05m left', 18),
  row('Mariam Saleem Chaudhry-Abbasi', '0336 488 9012', 'Re-enquired after 40 days', 'Expo · Nurture', '3-bed', 'PKR 2.5–3 Cr', 'ok', '5h 40m left', 10),
];

export const OVERDUE = [
  { late: '6d late', name: 'Faraz Ahmed', stage: 'Negotiation', note: 'Wants 5% off on B-504, will confirm with wife', by: 'Usman Tariq, 28 Oct' },
  { late: '3d late', name: 'Nadia Farooq', stage: 'Payment plan shared', note: 'Asked for 4-year plan instead of 3', by: 'Usman Tariq, 31 Oct' },
  { late: '2d late', name: 'Imran Shah', stage: 'Visit scheduled', note: 'Missed Saturday visit, rebook', by: 'Ayesha Khan (manager), 1 Nov' },
  { late: '1d late', name: 'Tariq Mehmood', stage: 'Qualified', note: 'Send floor plans for 3-bed', by: 'Usman Tariq, 2 Nov' },
];

export const VISITS = [
  { time: '11:00', name: 'Ayesha Malik + husband', what: 'Show C-1102, B-702 · sample apartment, Tower B', status: 'Confirmed on WhatsApp', tone: 'ok' as Tone },
  { time: '16:30', name: 'Hamza Siddiqui', what: 'Plot C-114 at Saffron Gardens · 45 min drive', status: 'Not confirmed — send reminder', tone: 'warn' as Tone },
];

export const AWAITING = [
  { name: 'Zubair Qureshi', what: 'B-702 · 3-year plan sent 1 Nov', seen: 'Opened twice' },
  { name: 'Nadia Farooq', what: 'C-1102 · 4-year plan sent 31 Oct', seen: 'Not opened' },
  { name: 'Shahzad Malik', what: 'C-1401 · quarterly plan sent 30 Oct', seen: 'Opened once' },
];

export const HOLDS = [
  { unit: 'B-504', for: 'Faraz Ahmed', left: '19h 40m', tone: 'warn' as Tone },
  { unit: 'A-1203', for: 'Sadia Rehman', left: '1h 05m', tone: 'bad' as Tone },
];
