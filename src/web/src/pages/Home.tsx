import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { calcularCasaScore } from '../lib/scoring';
import { RoomCard } from '../components/RoomCard';
import { Modal } from '../components/Modal';
import { PesosPanel } from '../components/PesosPanel';
import { IconFilter, IconGrid, IconList, IconShield, IconSliders, IconSort, IconWalk } from '../components/Icons';

type Orden = 'score' | 'precio-asc' | 'precio-desc' | 'distancia' | 'recientes';
interface Filtros { precioMax: number; banoPrivado: boolean; internet: boolean; sinHoraLlegada: boolean; visitas: boolean; cocina: boolean }
const FILTROS_DEFECTO: Filtros = { precioMax: 850, banoPrivado: false, internet: false, sinHoraLlegada: false, visitas: false, cocina: false };
const POR_PAGINA = 24;

export function Home() {
  const { cuartos, pesos, setPesos, punto, busqueda } = useApp();
  const [orden, setOrden] = useState<Orden>('score');
  const [vista, setVista] = useState<'grid' | 'lista'>('grid');
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_DEFECTO);
  const [verFiltros, setVerFiltros] = useState(false);
  const [verPesos, setVerPesos] = useState(false);
  const [limite, setLimite] = useState(POR_PAGINA);

  const activos = useMemo(() => cuartos.filter((c) => c.estado === 'activo'), [cuartos]);
  const resultados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const r = activos
      .filter((c) => !q || `${c.titulo} ${c.zona} ${c.direccion}`.toLowerCase().includes(q))
      .filter((c) => c.precio <= filtros.precioMax)
      .filter((c) => !filtros.banoPrivado || c.banoPrivado)
      .filter((c) => !filtros.internet || c.servicios.internet)
      .filter((c) => !filtros.sinHoraLlegada || c.condiciones.horaLlegada === null)
      .filter((c) => !filtros.visitas || c.condiciones.visitas)
      .filter((c) => !filtros.cocina || c.condiciones.cocina)
      .map((c) => ({ c, d: calcularCasaScore(c, pesos, punto) }));
    const f: Record<Orden, (a: (typeof r)[0], b: (typeof r)[0]) => number> = {
      score: (a, b) => b.d.puntaje - a.d.puntaje || a.c.precio - b.c.precio,
      'precio-asc': (a, b) => a.c.precio - b.c.precio,
      'precio-desc': (a, b) => b.c.precio - a.c.precio,
      distancia: (a, b) => a.d.distancia - b.d.distancia,
      recientes: (a, b) => b.c.creadoEn.localeCompare(a.c.creadoEn),
    };
    return r.sort(f[orden]);
  }, [activos, busqueda, filtros, pesos, punto, orden]);

  const nFiltros = Object.entries(filtros).filter(([k, v]) => (k === 'precioMax' ? v !== 850 : v)).length;

  return (
    <main className="contenedor pagina">
      <div className="titulo-fila">
        <h1>Cuartos en Puno</h1>
        <span className="tenue">{Math.min(limite, resultados.length)} de {resultados.length} resultados</span>
      </div>

      <section className="banner">
        <div className="banner-texto">
          <h2>Encuentra el cuarto que <span>sí te conviene</span></h2>
          <p>Un puntaje de 0 a 100 según tus prioridades, con cada punto explicado.</p>
        </div>
        <div className="banner-ventajas">
          <div><span><IconWalk /></span><small>Distancia a tu<br />lugar de estudio</small></div>
          <div><span><IconShield /></span><small>Condiciones<br />declaradas</small></div>
          <div><span><IconSliders /></span><small>Tus propias<br />prioridades</small></div>
        </div>
      </section>

      <div className="barra-herramientas">
        <label className="selector">
          <IconSort width={18} height={18} />
          <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} aria-label="Ordenar">
            <option value="score">Mayor CASA SCORE</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
            <option value="distancia">Más cerca</option>
            <option value="recientes">Más recientes</option>
          </select>
        </label>
        <div className="herramientas-der">
          <button className="btn" onClick={() => setVerPesos(true)}><IconSliders width={18} height={18} /> Prioridades</button>
          <button className="btn" onClick={() => setVerFiltros(true)}><IconFilter width={18} height={18} /> Filtrar{nFiltros > 0 && <span className="contador">{nFiltros}</span>}</button>
          <div className="alternar">
            <button className={vista === 'grid' ? 'activo' : ''} onClick={() => setVista('grid')} aria-label="Vista en cuadrícula"><IconGrid /></button>
            <button className={vista === 'lista' ? 'activo' : ''} onClick={() => setVista('lista')} aria-label="Vista en lista"><IconList /></button>
          </div>
        </div>
      </div>

      {resultados.length === 0 ? (
        <div className="vacio">
          <h3>No hay cuartos con esos criterios</h3>
          <p>Prueba con otra búsqueda o quita algunos filtros.</p>
          <button className="btn" onClick={() => setFiltros(FILTROS_DEFECTO)}>Quitar filtros</button>
        </div>
      ) : (
        <section className={vista === 'grid' ? 'cuadricula' : 'listado'}>
          {resultados.slice(0, limite).map(({ c, d }) => <RoomCard key={c.id} cuarto={c} d={d} lista={vista === 'lista'} />)}
        </section>
      )}
      {limite < resultados.length && <div className="centrado"><button className="btn" onClick={() => setLimite(limite + POR_PAGINA)}>Ver más cuartos</button></div>}

      <p className="nota-pie">El orden de los cuartos depende solo del CASA SCORE; ningún pago cambia su posición. <Link to="/como-funciona">Cómo se calcula</Link></p>

      {verPesos && (
        <Modal titulo="Mis prioridades" onClose={() => setVerPesos(false)} lateral>
          <PesosPanel pesos={pesos} onChange={setPesos} />
          <button className="btn btn-primario ancho" onClick={() => setVerPesos(false)}>Ver resultados</button>
        </Modal>
      )}
      {verFiltros && (
        <Modal titulo="Filtrar" onClose={() => setVerFiltros(false)} lateral>
          <label className="campo">
            <span>Precio máximo: <b>S/ {filtros.precioMax}</b></span>
            <input type="range" min={150} max={850} step={10} value={filtros.precioMax} onChange={(e) => setFiltros({ ...filtros, precioMax: Number(e.target.value) })} />
          </label>
          {([['banoPrivado', 'Baño privado'], ['internet', 'Internet 24 h'], ['sinHoraLlegada', 'Sin hora de llegada'], ['visitas', 'Permite visitas'], ['cocina', 'Permite cocinar']] as const).map(([k, t]) => (
            <label key={k} className="check">
              <input type="checkbox" checked={filtros[k]} onChange={(e) => setFiltros({ ...filtros, [k]: e.target.checked })} /> {t}
            </label>
          ))}
          <div className="acciones">
            <button className="btn" onClick={() => setFiltros(FILTROS_DEFECTO)}>Limpiar</button>
            <button className="btn btn-primario" onClick={() => setVerFiltros(false)}>Ver {resultados.length} cuartos</button>
          </div>
        </Modal>
      )}
    </main>
  );
}
