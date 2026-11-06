import { Link } from 'react-router-dom';
import type { Cuarto, Desglose } from '../types';
import { formatoDistancia } from '../lib/geo';
import { obtenerUsuario } from '../data/repo';
import { useApp } from '../state/AppContext';
import { Img } from './Img';
import { ScoreBadge } from './ScoreBadge';
import { IconCheck, IconHeart, IconShower, IconWalk } from './Icons';

export function RoomCard({ cuarto, d, lista }: { cuarto: Cuarto; d: Desglose; lista?: boolean }) {
  const { favoritos, alternarFavorito, punto } = useApp();
  const fav = favoritos.includes(cuarto.id);
  const prop = obtenerUsuario(cuarto.propietarioId);
  const serv = [cuarto.servicios.agua && 'agua', cuarto.servicios.luz && 'luz', cuarto.servicios.internet && 'internet'].filter(Boolean).join(', ');
  return (
    <article className={`tarjeta ${lista ? 'tarjeta-lista' : ''}`}>
      <Link to={`/cuarto/${cuarto.id}`} className="tarjeta-foto">
        <Img src={cuarto.fotos.habitacion} alt={cuarto.titulo} />
        <ScoreBadge valor={d.puntaje} />
      </Link>
      <button className={`btn-fav ${fav ? 'activo' : ''}`} onClick={() => alternarFavorito(cuarto.id)} aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
        <IconHeart filled={fav} width={18} height={18} />
      </button>
      <div className="tarjeta-info">
        <span className="tarjeta-zona">{cuarto.zona}</span>
        <Link to={`/cuarto/${cuarto.id}`} className="tarjeta-titulo">{cuarto.titulo}, {cuarto.areaM2} m², {cuarto.banoPrivado ? 'baño privado' : 'baño compartido'}</Link>
        <div className="precio">S/ <b>{cuarto.precio.toLocaleString('es-PE')}</b><small>.00 /mes</small></div>
        <hr />
        <p className="dato verde"><IconWalk width={17} height={17} /> <span><b>{formatoDistancia(d.distancia)}</b> · {Math.round(d.minutos)} min a pie de {punto.nombre.split(' (')[0]}</span></p>
        <p className="dato"><IconShower width={17} height={17} /> <span>{serv ? `${serv[0].toUpperCase()}${serv.slice(1)} 24 h` : 'Sin servicios 24 h'}</span></p>
        <p className="dato tenue">Por {prop?.nombre ?? 'Propietario'}</p>
        {cuarto.condiciones.declaradas && <p className="dato azul"><IconCheck width={15} height={15} /> Condiciones declaradas</p>}
      </div>
    </article>
  );
}
