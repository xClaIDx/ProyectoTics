import { CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export interface Marca {
  lat: number;
  lng: number;
  etiqueta?: string;
  color?: string;
}

function Clic({ onPick }: { onPick?: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick?.(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Mapa de OpenStreetMap. Si recibe onPick, un clic marca un punto. */
export function MapPicker({ centro, marcas, onPick, alto = 280, zoom = 14 }: { centro: [number, number]; marcas: Marca[]; onPick?: (lat: number, lng: number) => void; alto?: number; zoom?: number }) {
  return (
    <div className="mapa" style={{ height: alto }}>
      <MapContainer center={centro} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Clic onPick={onPick} />
        {marcas.map((m, i) => (
          <CircleMarker key={i} center={[m.lat, m.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: m.color ?? '#E4572E', fillOpacity: 1 }}>
            {m.etiqueta && <Tooltip direction="top" offset={[0, -8]} permanent>{m.etiqueta}</Tooltip>}
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
