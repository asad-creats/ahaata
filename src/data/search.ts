import { digits } from '../lib/hooks';
import { leadPath } from '../lib/leadLink';

export type SearchHit = { group: 'Leads' | 'Contacts' | 'Units' | 'Bookings'; title: string; meta: string; to: string; keys: string[] };

const lead = (name: string, phone: string, meta: string, cnic = ''): SearchHit => ({
  group: 'Leads',
  title: name,
  meta: `${phone} · ${meta}`,
  to: leadPath(name),
  keys: [name.toLowerCase(), digits(phone), digits(cnic)].filter(Boolean),
});

const INDEX: SearchHit[] = [
  lead('Faraz Ahmed', '0300 512 3478', 'Negotiation · B-504', '37405-1234567-3'),
  lead('Bilal Hussain', '0321 448 2093', 'New · Facebook'),
  lead('Sadia Rehman', '0300 771 0456', 'Qualified · A-1203'),
  lead('Kamran Javed', '0345 902 1187', 'New · Graana'),
  lead('Hina Aslam', '0332 615 7740', 'Visit done · C-1102'),
  lead('Zubair Qureshi', '0300 210 3364', 'Units of interest · B-702'),
  lead('Tariq Mehmood', '0300 845 1290', 'Qualified · Unassigned'),
  lead('Nadia Farooq', '0301 220 4419', 'Payment plan shared'),
  lead('Omer Farooq', '0333 102 7781', 'Visit done · B-1001'),
  lead('Imran Shah', '0345 220 9174', 'Visit scheduled · B-405'),
  { group: 'Contacts', title: 'Ayesha Malik', meta: 'Buyer contact · 0333 410 9921', to: leadPath('Ayesha Malik'), keys: ['ayesha malik', '03334109921'] },
  { group: 'Units', title: 'B-504', meta: 'Tower B · 2-bed · On hold · PKR 1.85 Cr', to: '/inventory?unit=B-504', keys: ['b-504', 'b504'] },
  { group: 'Units', title: 'B-702', meta: 'Tower B · 2-bed · Available · PKR 1.92 Cr', to: '/inventory?unit=B-702', keys: ['b-702', 'b702'] },
  { group: 'Units', title: 'Plot C-114', meta: 'Saffron Gardens · 10 marla · Available', to: '/site', keys: ['c-114', 'c114', 'plot c-114'] },
  { group: 'Units', title: 'C-1102', meta: 'Tower C · 3-bed · Booked', to: '/inventory', keys: ['c-1102', 'c1102'] },
  { group: 'Bookings', title: 'BK-0412 · Nasir Hussain', meta: 'B-1203 · Q3 overdue 21d', to: '/bookings', keys: ['bk-0412', 'nasir hussain', 'b-1203'] },
  { group: 'Bookings', title: 'BK-0277 · Asif Mehmood Chaudhry', meta: 'A-902 · Q5 overdue 94d', to: '/bookings', keys: ['bk-0277', 'asif mehmood chaudhry', 'a-902'] },
];

/** Matches name, phone (any format), CNIC (with or without dashes) and unit code. */
export function search(q: string): SearchHit[] {
  const t = q.trim().toLowerCase();
  if (t.length < 2) return [];
  const d = digits(t);
  return INDEX.filter((h) => h.keys.some((k) => k.includes(t) || (d.length >= 4 && /^\d+$/.test(k) && k.includes(d)))).slice(0, 8);
}
