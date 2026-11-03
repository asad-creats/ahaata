import type { AgeState } from '../components/ui';

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  stage: string;
  days: number;
  age: string;
  st: AgeState;
  src: string;
  unit: string;
  budget: string;
  budgetPkr: number;
  owner: string;
  touch: string;
  touchBy: string;
  next: string;
  nextLate: boolean;
};

const R = (name: string, phone: string, stage: string, age: string, st: AgeState, src: string, unit: string, budget: string, budgetPkr: number, owner: string, touch: string, touchBy: string, next: string, nextLate: boolean): LeadRow => ({
  id: name.toLowerCase().replace(/[^a-z]+/g, '-'),
  name,
  phone,
  stage,
  days: age.endsWith('h') ? 0.25 : parseInt(age, 10),
  age,
  st,
  src,
  unit,
  budget,
  budgetPkr,
  owner,
  touch,
  touchBy,
  next,
  nextLate,
});

export const LEADS: LeadRow[] = [
  R('Tariq Mehmood', '0300 845 1290', 'Qualified', '9d', 'r', 'Expo', '3-bed · Tower C', 'PKR 2.40 Cr', 24000000, 'Unassigned', '9 days ago', 'Imported by Sana Malik', 'No next step', true),
  R('Omer Farooq', '0333 102 7781', 'Visit done', '6d', 'r', 'Dealer', 'B-1001', 'PKR 2.05 Cr', 20500000, 'Unassigned', '6 days ago', 'Dealer: Al-Noor Estate', 'No next step', true),
  R('Nida Hassan', '0301 556 2201', 'Contacted', '4d', 'r', 'Facebook', '2-bed', 'PKR 1.70 Cr', 17000000, 'Sana Naveed', '4 days ago', 'Call · Sana Naveed', 'Call · overdue 2d', true),
  R('Imran Shah', '0345 220 9174', 'Visit scheduled', '9d', 'r', 'Facebook', 'B-405', 'PKR 1.80 Cr', 18000000, 'Sana Naveed', '2 days ago', 'Note · Ayesha Khan', 'Rebook visit', true),
  R('Sadia Rehman', '0300 771 0456', 'Qualified', '4d', 'a', 'Zameen', 'A-1203 (hold)', 'PKR 2.10 Cr', 21000000, 'Sana Naveed', 'Today 09:12', 'WhatsApp · Sana Naveed', 'Call today 12:00', false),
  R('Farah Naz', '0322 467 8890', 'Qualified', '1d', 'g', 'Graana', 'Plot 10 marla', 'PKR 1.35 Cr', 13500000, 'Sana Naveed', 'Yesterday', 'Call · Sana Naveed', 'Send plot map', false),
  R('Muhammad Ahsan Ul Haq Siddiqui', '0313 908 4456', 'Qualified', '3d', 'a', 'Website', '2-bed · Tower B', 'PKR 1.75 Cr', 17500000, 'Unassigned', '3 days ago', 'Website form', 'No next step', true),
  R('Lubna Shah', '0300 118 6623', 'Contacted', '2d', 'a', 'Graana', '1-bed', 'PKR 1.10 Cr', 11000000, 'Sana Naveed', '2 days ago', 'Call · Sana Naveed', 'Call Thu 11:00', false),
  R('Rizwan Butt', '+971 50 448 2210', 'Qualified', '2d', 'g', 'Facebook', '3-bed (overseas)', 'AED 420k', 32000000, 'Unassigned', '2 days ago', 'FB Lead Ads', 'No next step', true),
  R('Hassan Raza', '0335 772 0019', 'Contacted', '1d', 'g', 'Walk-in', 'Shop G-12', 'PKR 3.10 Cr', 31000000, 'Sana Naveed', 'Yesterday', 'Visit log · Sana Naveed', 'Share plan', false),
  R('Amna Tariq', '0302 641 7735', 'Qualified', '5d', 'r', 'Zameen', 'Penthouse P-2', 'PKR 5.60 Cr', 56000000, 'Unassigned', '5 days ago', 'Zameen API', 'No next step', true),
  R('Yasir Nawaz', '0346 334 1180', 'Contacted', '6h', 'g', 'Facebook', 'Studio', 'PKR 85 lakh', 8500000, 'Sana Naveed', 'Today 08:40', 'Call · Sana Naveed', 'WhatsApp brochure', false),
];

export const VIEWS = [
  { key: 'stuck', label: 'Unassigned + stuck', n: '214', team: true, alert: true },
  { key: 'all', label: 'All open', n: '1,284', team: false, alert: false },
  { key: 'untouched', label: 'Untouched > 24h', n: '38', team: true, alert: true },
  { key: 'hot', label: 'Hot — token this week', n: '17', team: true, alert: false },
  { key: 'overseas', label: 'Overseas (USD/AED)', n: '61', team: false, alert: false },
  { key: 'gardens', label: 'My saved: Gardens plots', n: '92', team: false, alert: false },
];

export const AGENTS = [
  { ini: 'UT', name: 'Usman Tariq', note: 'Tower B specialist', load: '48 · 4', off: false },
  { ini: 'MB', name: 'Maryam Baig', note: 'Least loaded', load: '31 · 0', off: false },
  { ini: 'FN', name: 'Fahad Nadeem', note: 'Speaks Pashto', load: '44 · 2', off: false },
  { ini: 'SN', name: 'Sana Naveed', note: 'Current owner of 1', load: '52 · 6', off: false },
  { ini: 'KA', name: 'Kashif Abbasi', note: 'On leave until 8 Nov', load: '—', off: true },
];
