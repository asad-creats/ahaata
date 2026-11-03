export type Status = 'A' | 'H' | 'B' | 'S';

export const STATUS_LABEL: Record<Status, string> = { A: 'Available', H: 'On hold', B: 'Booked', S: 'Sold' };

export const TYPES: [string, number][] = [
  ['3-bed', 1620],
  ['2-bed', 1150],
  ['1-bed', 780],
  ['Studio', 520],
  ['Studio', 520],
  ['1-bed', 780],
  ['2-bed', 1150],
  ['3-bed', 1620],
];

const FACING = ['North-east corner', 'East', 'East', 'East', 'West', 'West', 'West', 'South-west corner'];

export type Unit = {
  code: string;
  floor: number;
  type: string;
  size: number;
  status: Status;
  rate: number;
  price: number;
  facing: string;
  holdFor?: string;
  holdBy?: string;
  holdLeft?: string;
};

/** Short price for grid cells and summaries: 1.85 Cr / 85 L. */
export const fmtShort = (p: number) => (p >= 10000000 ? (p / 10000000).toFixed(2) + ' Cr' : Math.round(p / 100000) + ' L');

/** Lakh grouping for tables: 1,25,000. */
export const fmtLakh = (n: number) => n.toLocaleString('en-IN');

export function buildTower(tower: string): Unit[][] {
  const seed = tower.charCodeAt(0) - 65; // A=0, B=1 …
  const floors: Unit[][] = [];
  for (let f = 14; f >= 1; f--) {
    floors.push(
      TYPES.map(([type, size], i) => {
        const h = (f * 7 + i * 13 + ((f * i) % 5) + seed * 3) % 11;
        let status: Status = f <= 3 ? (h < 6 ? 'S' : h < 9 ? 'B' : 'A') : f <= 8 ? (h < 3 ? 'S' : h < 6 ? 'B' : h < 7 ? 'H' : 'A') : h < 1 ? 'S' : h < 3 ? 'B' : h < 4 ? 'H' : 'A';
        const code = `${tower}-${f}${String(i + 1).padStart(2, '0')}`;
        if (code === 'B-504') status = 'H';
        const rate = 15500 + f * 117 + (i === 0 || i === 7 ? 400 : 0);
        const unit: Unit = { code, floor: f, type, size, status, rate, price: size * rate, facing: FACING[i] };
        if (status === 'H') {
          unit.holdFor = code === 'B-504' ? 'Faraz Ahmed' : ['Sadia Rehman', 'Hina Aslam', 'Zubair Qureshi'][(f + i) % 3];
          unit.holdBy = code === 'B-504' ? 'Usman Tariq' : ['Sana Naveed', 'Maryam Baig', 'Fahad Nadeem'][(f + i) % 3];
          unit.holdLeft = code === 'B-504' ? '19h 40m' : `${(f * 5 + i) % 47}h ${(f * i * 7) % 60}m`;
        }
        // B-504 is the 2-bed, east-facing unit Faraz Ahmed is holding (price list quote).
        if (code === 'B-504') Object.assign(unit, { type: '2-bed', size: 1150, facing: 'East', price: 18500000 });
        return unit;
      }),
    );
  }
  return floors;
}

export type Band = { band: string; old: number; next: number; prem: string };

export const BANDS: Band[] = [
  { band: 'Floors 1–3', old: 15700, next: 15700, prem: 'Corner +400/sq ft' },
  { band: 'Floors 4–8', old: 16050, next: 16350, prem: 'Corner +400 · East facing +250' },
  { band: 'Floors 9–12', old: 16550, next: 16950, prem: 'Corner +400 · Margalla view +600' },
  { band: 'Floors 13–14', old: 17100, next: 17100, prem: 'Penthouse terrace priced per unit' },
];
