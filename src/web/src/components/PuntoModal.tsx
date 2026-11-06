import { useState } from 'react';
import { PUNTOS } from '../data/seed';
import { useApp } from '../state/AppContext';
import { MapPicker } from './MapPicker';
import { Modal } from './Modal';
import { IconPin } from './Icons';

export function PuntoModal({ onClose }: { onClose: () => void }) {
  const { punto, setPunto } = useApp();
  const [sel, setSel] = useState(punto);
  return (
    <Modal titulo="Tu punto de referencia" onClose={onClose}>
      <p className="ayuda">Elige el lugar al que quieres estar cerca. La distancia y el tiempo a pie de cada cuarto se calculan desde aquí.</p>
      <div className="chips">
        {PUNTOS.map((p) => (
          <button key={p.nombre} className={`chip ${sel.nombre === p.nombre ? 'activo' : ''}`} onClick={() => setSel(p)}>
            <IconPin width={14} height={14} /> {p.nombre}
          </button>
        ))}
      </div>
      <p className="ayuda">O toca el mapa para marcar otro lugar de Puno:</p>
      <MapPicker centro={[sel.lat, sel.lng]} marcas={[{ lat: sel.lat, lng: sel.lng, etiqueta: sel.nombre, color: '#1d4ed8' }]} onPick={(lat, lng) => setSel({ nombre: 'Punto elegido en el mapa', lat, lng })} />
      <div className="acciones">
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primario" onClick={() => { setPunto(sel); onClose(); }}>Usar este punto</button>
      </div>
    </Modal>
  );
}
