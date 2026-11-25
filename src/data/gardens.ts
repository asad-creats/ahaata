import type { Status } from './inventory';

/**
 * Saffron Gardens: a plotted housing society laid out in metres (x east,
 * y north) and placed on the map around CENTER. Sample data: the site is a
 * stand-in location, not a real survey.
 */

export type LatLng = [number, number];

export const GARDENS_CENTER: LatLng = [33.4952, 73.0006];

export type Plot = {
  no: string;
  block: string;
  marla: number;
  size: string;
  price: number;
  status: Status;
  corner: boolean;
  facing: string;
  holdFor?: string;
  holdLeft?: string;
  poly: LatLng[];
};

export type Area = { name: string; kind: 'park' | 'mosque' | 'school' | 'boundary' | 'road'; poly: LatLng[] };

const M_LAT = 111320;
const M_LNG = 111320 * Math.cos((GARDENS_CENTER[0] * Math.PI) / 180);
/** Layout origin sits south-west of the centre so the society is centred. */
const ORIGIN = { x: -185, y: -165 };

const toLatLng = (x: number, y: number): LatLng => [GARDENS_CENTER[0] + (y + ORIGIN.y) / M_LAT, GARDENS_CENTER[1] + (x + ORIGIN.x) / M_LNG];
const rect = (x: number, y: number, w: number, h: number): LatLng[] => [toLatLng(x, y), toLatLng(x + w, y), toLatLng(x + w, y + h), toLatLng(x, y + h)];

const HOLDERS = ['Faraz Ahmed', 'Sadia Rehman', 'Hina Aslam', 'Zubair Qureshi', 'Hamza Siddiqui'];

function statusFor(i: number, bias: number, sold: number): Status {
  const h = (i * 37 + bias * 11 + ((i * i) % 7)) % 20;
  return h < sold ? 'S' : h < sold + 5 ? 'B' : h < sold + 6 ? 'H' : 'A';
}

type BlockSpec = {
  block: string;
  first: number;
  prefix: string;
  x: number;
  y: number;
  cols: number;
  pairs: number;
  w: number;
  d: number;
  street: number;
  marla: number;
  size: string;
  base: number;
  sold: number;
};

function buildBlock(b: BlockSpec): Plot[] {
  const plots: Plot[] = [];
  let n = 0;
  for (let p = 0; p < b.pairs; p++) {
    for (let side = 0; side < 2; side++) {
      const y = b.y + p * (2 * b.d + b.street) + side * b.d;
      for (let c = 0; c < b.cols; c++) {
        const no = `${b.prefix}${b.first + n}`;
        const corner = c === 0 || c === b.cols - 1;
        let status = statusFor(n, b.first, b.sold);
        if (no === 'C-114' || no === 'C-108' || no === 'C-121') status = 'A';
        if (no === 'C-126') status = 'H';
        const plot: Plot = {
          no,
          block: b.block,
          marla: b.marla,
          size: b.size,
          price: Math.round((b.base * (corner ? 1.1 : 1)) / 100000) * 100000,
          status,
          corner,
          facing: side === 0 ? 'South, facing the street' : 'North, facing the street',
          poly: rect(b.x + c * b.w, y, b.w - 0.6, b.d - 0.6),
        };
        if (no === 'C-114') Object.assign(plot, { price: 13200000, corner: true, facing: 'Corner, park lane' });
        if (status === 'H') Object.assign(plot, { holdFor: HOLDERS[n % HOLDERS.length], holdLeft: `${(n * 7) % 47 + 1}h ${(n * 13) % 60}m` });
        plots.push(plot);
        n++;
      }
    }
  }
  return plots;
}

export const GARDEN_PLOTS: Plot[] = [
  // Shops along the main boulevard
  ...buildBlock({ block: 'Commercial', first: 1, prefix: 'S-', x: 20, y: 40, cols: 30, pairs: 1, w: 8, d: 15, street: 0, marla: 4, size: '25×45 ft', base: 16000000, sold: 9 }).slice(0, 30),
  ...buildBlock({ block: 'Block A', first: 1, prefix: 'A-', x: 20, y: 80, cols: 18, pairs: 3, w: 7.6, d: 13.7, street: 9, marla: 5, size: '25×45 ft', base: 6200000, sold: 10 }),
  ...buildBlock({ block: 'Block B', first: 201, prefix: 'B-', x: 175, y: 80, cols: 14, pairs: 3, w: 10.7, d: 19.8, street: 12, marla: 10, size: '35×65 ft', base: 11800000, sold: 8 }),
  ...buildBlock({ block: 'Block C', first: 101, prefix: 'C-', x: 20, y: 210, cols: 12, pairs: 2, w: 10.7, d: 19.8, street: 12, marla: 10, size: '35×65 ft', base: 12000000, sold: 5 }),
];

export const GARDEN_AREAS: Area[] = [
  { name: 'Saffron Gardens', kind: 'boundary', poly: [toLatLng(8, 22), toLatLng(340, 22), toLatLng(352, 80), toLatLng(345, 330), toLatLng(250, 345), toLatLng(150, 338), toLatLng(8, 318)] },
  { name: 'Main boulevard', kind: 'road', poly: rect(-40, 0, 440, 20) },
  { name: 'Central park', kind: 'park', poly: rect(160, 255, 110, 60) },
  { name: 'Jamia mosque', kind: 'mosque', poly: rect(280, 255, 50, 30) },
  { name: 'School', kind: 'school', poly: rect(280, 292, 50, 30) },
];

/** Labels drawn on the map. */
export const GARDEN_LABELS: { text: string; at: LatLng }[] = [
  { text: 'Block A', at: toLatLng(88, 196) },
  { text: 'Block B', at: toLatLng(250, 242) },
  { text: 'Block C', at: toLatLng(84, 318) },
  { text: 'Commercial', at: toLatLng(140, 60) },
  { text: 'Main Boulevard · 120 ft', at: toLatLng(290, 10) },
  { text: 'Park', at: toLatLng(215, 285) },
  { text: 'Mosque', at: toLatLng(305, 270) },
  { text: 'School', at: toLatLng(305, 307) },
];

export const GATE: LatLng = toLatLng(150, 10);

/** Building footprints for Saffron Residencia (towers), placed the same way. */
export const RESIDENCIA_CENTER: LatLng = [31.4712, 74.4021];
const R_LNG = 111320 * Math.cos((RESIDENCIA_CENTER[0] * Math.PI) / 180);
const rRect = (x: number, y: number, w: number, h: number): LatLng[] =>
  [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ].map(([px, py]) => [RESIDENCIA_CENTER[0] + (py - 60) / M_LAT, RESIDENCIA_CENTER[1] + (px - 80) / R_LNG] as LatLng);

export const RESIDENCIA_BUILDINGS: Record<string, LatLng[]> = {
  A: rRect(10, 75, 55, 32),
  B: rRect(10, 20, 55, 36),
  C: rRect(95, 75, 55, 32),
  G: rRect(95, 20, 40, 30),
};
export const RESIDENCIA_AREAS: Area[] = [
  { name: 'Saffron Residencia', kind: 'boundary', poly: rRect(0, 8, 160, 108) },
  { name: 'Podium garden', kind: 'park', poly: rRect(140, 20, 16, 30) },
];
export const RESIDENCIA_LABELS: { text: string; at: LatLng }[] = [{ text: 'Ferozepur Road', at: rRect(70, 0, 0, 0)[0] }];
