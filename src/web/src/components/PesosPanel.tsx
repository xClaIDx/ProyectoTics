import type { Pesos } from '../types';

export const NOMBRES_PESOS: Record<keyof Pesos, string> = {
  precio: 'Precio',
  cercania: 'Cercanía a mi punto',
  seguridad: 'Seguridad',
  servicios: 'Servicios 24 h',
  bano: 'Baño privado',
};

export const PERFILES: { nombre: string; pesos: Pesos }[] = [
  { nombre: 'Equilibrado', pesos: { precio: 3, cercania: 3, seguridad: 3, servicios: 3, bano: 3 } },
  { nombre: 'Lo más barato', pesos: { precio: 5, cercania: 2, seguridad: 1, servicios: 1, bano: 1 } },
  { nombre: 'Lo más cerca', pesos: { precio: 2, cercania: 5, seguridad: 1, servicios: 1, bano: 1 } },
  { nombre: 'Lo más seguro', pesos: { precio: 2, cercania: 2, seguridad: 5, servicios: 2, bano: 2 } },
];

export function PesosPanel({ pesos, onChange }: { pesos: Pesos; onChange: (p: Pesos) => void }) {
  return (
    <div className="pesos">
      <div className="chips">
        {PERFILES.map((p) => (
          <button key={p.nombre} className={`chip ${JSON.stringify(p.pesos) === JSON.stringify(pesos) ? 'activo' : ''}`} onClick={() => onChange(p.pesos)}>{p.nombre}</button>
        ))}
      </div>
      {(Object.keys(NOMBRES_PESOS) as (keyof Pesos)[]).map((k) => (
        <label key={k} className="peso">
          <span>{NOMBRES_PESOS[k]}</span>
          <input type="range" min={0} max={5} step={1} value={pesos[k]} onChange={(e) => onChange({ ...pesos, [k]: Number(e.target.value) })} />
          <b>{pesos[k]}</b>
        </label>
      ))}
      <p className="ayuda">0 = no me importa · 5 = muy importante</p>
    </div>
  );
}
