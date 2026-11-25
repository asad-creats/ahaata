import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Area, LatLng } from '../data/gardens';
import type { Status } from '../data/inventory';

/**
 * Satellite (or plain plan) map with clickable shapes coloured by status.
 * Leaflet draws on a canvas so a few hundred plots stay fast.
 */

export type MapShape = { id: string; poly: LatLng[]; status: Status; tip: string };

export const STATUS_VAR: Record<Status, string> = {
  A: '--map-available',
  H: '--map-hold',
  B: '--map-booked',
  S: '--map-sold',
};

const AREA_VAR: Record<Area['kind'], string> = {
  boundary: '--map-society',
  park: '--map-park',
  mosque: '--map-amenity',
  school: '--map-amenity',
  road: '--map-road',
};

const SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

/** Leave room for the Plan/Satellite switch (top), zoom buttons (right) and map key (bottom). */
function fit(m: L.Map, b: L.LatLngBounds) {
  const narrow = m.getSize().x < 520;
  m.fitBounds(b, { paddingTopLeft: [12, 56], paddingBottomRight: [52, narrow ? 76 : 52] });
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#999';

export function ProjectMap({
  shapes,
  areas,
  labels,
  gate,
  selected,
  hidden,
  satellite,
  theme,
  onSelect,
  children,
}: {
  shapes: MapShape[];
  areas: Area[];
  labels: { text: string; at: LatLng }[];
  gate?: LatLng;
  selected: string | null;
  hidden: Record<Status, boolean>;
  satellite: boolean;
  theme: string;
  onSelect: (id: string) => void;
  children?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const bounds = useRef<L.LatLngBounds | null>(null);
  const pick = useRef(onSelect);
  pick.current = onSelect;

  // Create the map once.
  useEffect(() => {
    if (!box.current) return;
    const m = L.map(box.current, { zoomControl: false, attributionControl: true, preferCanvas: true, minZoom: 14, maxZoom: 20, zoomSnap: 0.25 });
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    m.attributionControl.setPrefix(false);
    map.current = m;
    layer.current = L.layerGroup().addTo(m);
    return () => {
      m.remove();
      map.current = null;
      layer.current = null;
      tiles.current = null;
      bounds.current = null;
    };
  }, []);

  // Satellite tiles on or off.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (satellite && !tiles.current) {
      tiles.current = L.tileLayer(SATELLITE, { maxNativeZoom: 18, maxZoom: 20, attribution: 'Imagery © Esri' }).addTo(m);
    } else if (!satellite && tiles.current) {
      tiles.current.remove();
      tiles.current = null;
    }
  }, [satellite]);

  // Draw the society, plots and labels.
  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const renderer = L.canvas({ padding: 0.5 });
    const line = css('--map-plot-line');
    const op = satellite ? 0.88 : 1;

    for (const a of areas) {
      L.polygon(a.poly, {
        renderer,
        interactive: false,
        color: a.kind === 'boundary' ? css('--map-boundary') : a.kind === 'road' ? 'transparent' : line,
        weight: a.kind === 'boundary' ? 2 : 0.5,
        fillColor: css(AREA_VAR[a.kind]),
        fillOpacity: a.kind === 'boundary' ? (satellite ? 0.35 : 1) : op,
      }).addTo(g);
    }

    for (const s of shapes) {
      if (hidden[s.status]) continue;
      const on = s.id === selected;
      const poly = L.polygon(s.poly, {
        renderer,
        color: on ? css('--accent-500') : line,
        weight: on ? 3 : 0.6,
        fillColor: css(STATUS_VAR[s.status]),
        fillOpacity: op,
      });
      poly.bindTooltip(s.tip, { sticky: true, direction: 'top', className: 'pmap-tip' });
      poly.on('click', () => pick.current(s.id));
      poly.addTo(g);
      if (on) poly.bringToFront();
    }

    for (const l of labels) {
      L.marker(l.at, { interactive: false, icon: L.divIcon({ className: 'pmap-label', html: `<span>${l.text}</span>`, iconSize: [0, 0] }) }).addTo(g);
    }
    if (gate) {
      L.marker(gate, { interactive: false, icon: L.divIcon({ className: 'pmap-gate', html: '<span>Main gate</span>', iconSize: [0, 0] }) }).addTo(g);
    }

    const b = L.latLngBounds(areas.filter((a) => a.kind !== 'road').flatMap((a) => a.poly));
    if (!bounds.current || !bounds.current.equals(b)) {
      bounds.current = b;
      fit(m, b);
    }
  }, [shapes, areas, labels, gate, selected, hidden, satellite, theme]);

  // Leaflet needs a nudge when its box changes size.
  useEffect(() => {
    const m = map.current;
    if (!m || !box.current) return;
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`pmap ${satellite ? 'is-sat' : ''}`}>
      <div ref={box} className="pmap__map" />
      {children}
      <button type="button" className="pmap__fit" aria-label="Show the whole project" title="Show the whole project" onClick={() => bounds.current && map.current && fit(map.current, bounds.current)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      </button>
    </div>
  );
}
