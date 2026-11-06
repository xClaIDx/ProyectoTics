import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { obtenerUsuario, guardarCuarto } from '../data/repo';
import { calcularCasaScore, nivelSeguridad } from '../lib/scoring';
import { formatoDistancia } from '../lib/geo';
import { Img } from '../components/Img';
import { ScoreBadge } from '../components/ScoreBadge';
import { MapPicker } from '../components/MapPicker';
import { NOMBRES_PESOS } from '../components/PesosPanel';
import { IconCheck, IconHeart, IconWalk, IconWhatsapp, IconX } from '../components/Icons';
import type { CaracteristicaSeguridad, Pesos } from '../types';

const SEG: Record<CaracteristicaSeguridad, string> = { porton: 'Portón con llave propia', rejas: 'Rejas en ventanas', iluminacion: 'Iluminación exterior', camara: 'Cámara de vigilancia' };

export function RoomDetail() {
  const { id } = useParams();
  const { cuartos, pesos, punto, usuario, favoritos, alternarFavorito, recargar } = useApp();
  const nav = useNavigate();
  const c = cuartos.find((x) => x.id === id);
  const [foto, setFoto] = useState(0);
  if (!c) return <main className="contenedor pagina vacio"><h3>Este cuarto no existe o fue retirado.</h3><Link to="/" className="btn">Volver</Link></main>;

  const d = calcularCasaScore(c, pesos, punto);
  const prop = obtenerUsuario(c.propietarioId);
  const fotos = [c.fotos.habitacion, c.fotos.fachada, c.fotos.bano, c.fotos.ventana];
  const nombresFotos = ['Habitación', 'Fachada', 'Baño', 'Ventana'];
  const esDueno = usuario?.id === c.propietarioId;
  const mensaje = encodeURIComponent(`Hola, vi su cuarto "${c.titulo}" en CasaScore. ¿Sigue disponible?`);
  const h = c.condiciones.horaLlegada;

  return (
    <main className="contenedor pagina detalle">
      <nav className="migas"><Link to="/">Cuartos en Puno</Link> / <span>{c.zona}</span></nav>
      <div className="detalle-grid">
        <section>
          <div className="galeria">
            <Img src={fotos[foto]} alt={nombresFotos[foto]} className="galeria-principal" />
            <div className="galeria-miniaturas">
              {fotos.map((f, i) => (
                <button key={i} className={i === foto ? 'activo' : ''} onClick={() => setFoto(i)} aria-label={nombresFotos[i]}>
                  <Img src={f} alt={nombresFotos[i]} /><span>{nombresFotos[i]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="caja">
            <h2>Por qué tiene {d.puntaje} puntos</h2>
            <p className="ayuda">Cada criterio se lleva a una escala de 0 a 100 y se pondera con tus prioridades. Luego se suman las bonificaciones y se restan las penalizaciones.</p>
            {(Object.keys(NOMBRES_PESOS) as (keyof Pesos)[]).map((k) => (
              <div key={k} className="barra-criterio">
                <span>{NOMBRES_PESOS[k]} <small>peso {pesos[k]}</small></span>
                <div className="barra"><i style={{ width: `${d.normalizados[k]}%` }} /></div>
                <b>{Math.round(d.normalizados[k])}</b>
              </div>
            ))}
            <div className="linea-total"><span>Promedio ponderado</span><b>{d.base.toFixed(1)}</b></div>
            {d.bonificaciones.map((b) => <div key={b.etiqueta} className="ajuste mas"><IconCheck width={16} height={16} /> {b.etiqueta}<b>+{b.puntos}</b></div>)}
            {d.penalizaciones.map((p) => <div key={p.etiqueta} className="ajuste menos"><IconX width={16} height={16} /> {p.etiqueta}<b>−{p.puntos}</b></div>)}
            <div className="linea-total final"><span>CASA SCORE (entre 0 y 100)</span><b>{d.puntaje}</b></div>
          </div>

          <div className="caja">
            <h2>Ubicación</h2>
            <p className="dato verde"><IconWalk width={17} height={17} /> {formatoDistancia(d.distancia)} en línea recta · {Math.round(d.minutos)} min a pie de {punto.nombre}</p>
            <MapPicker centro={[(c.lat + punto.lat) / 2, (c.lng + punto.lng) / 2]} zoom={14} marcas={[{ lat: c.lat, lng: c.lng, etiqueta: 'Cuarto' }, { lat: punto.lat, lng: punto.lng, etiqueta: 'Tu punto', color: '#1d4ed8' }]} />
            <p className="tenue">{c.direccion}, {c.zona}, Puno</p>
          </div>
        </section>

        <aside>
          <div className="caja pegajosa">
            <span className="tarjeta-zona">{c.zona}</span>
            <h1 className="detalle-titulo">{c.titulo}</h1>
            <div className="fila-entre">
              <div className="precio grande">S/ <b>{c.precio.toLocaleString('es-PE')}</b><small>.00 /mes</small></div>
              <ScoreBadge valor={d.puntaje} grande />
            </div>
            <p className="tenue">Publicado por <b>{prop?.nombre ?? 'Propietario'}</b></p>
            {esDueno ? (
              <div className="pila">
                <Link to={`/publicar/${c.id}`} className="btn btn-primario ancho">Editar cuarto</Link>
                <button className="btn ancho" onClick={() => guardarCuarto({ ...c, estado: c.estado === 'activo' ? 'oculto' : 'activo' }).then(recargar).then(() => nav('/perfil')).catch((e) => alert(e.message))}>
                  {c.estado === 'activo' ? 'Ocultar (ya está alquilado)' : 'Volver a mostrar'}
                </button>
              </div>
            ) : (
              <div className="pila">
                <a className="btn btn-whatsapp ancho" href={`https://wa.me/${prop?.telefono ?? ''}?text=${mensaje}`} target="_blank" rel="noreferrer"><IconWhatsapp /> Contactar por WhatsApp</a>
                <button className="btn ancho" onClick={() => alternarFavorito(c.id)}><IconHeart filled={favoritos.includes(c.id)} width={18} height={18} /> {favoritos.includes(c.id) ? 'En favoritos' : 'Guardar en favoritos'}</button>
              </div>
            )}
            <p className="ayuda">CasaScore no cobra comisiones ni recibe el pago del alquiler. Visita el cuarto antes de pagar.</p>
          </div>

          <div className="caja">
            <h2>Características</h2>
            <ul className="lista-check">
              <li>{c.areaM2} m²</li>
              <li>{c.banoPrivado ? 'Baño privado' : 'Baño compartido'}</li>
              <li className={c.luzNatural ? '' : 'no'}>Ventana con luz natural</li>
              <li className={c.servicios.agua ? '' : 'no'}>Agua 24 h</li>
              <li className={c.servicios.luz ? '' : 'no'}>Luz 24 h</li>
              <li className={c.servicios.internet ? '' : 'no'}>Internet 24 h</li>
            </ul>
            <h3>Seguridad: nivel {nivelSeguridad(c)} de 5</h3>
            <ul className="lista-check">
              {(Object.keys(SEG) as CaracteristicaSeguridad[]).map((k) => <li key={k} className={c.seguridad[k] ? '' : 'no'}>{SEG[k]}</li>)}
            </ul>
            <h3>Condiciones de convivencia</h3>
            <ul className="lista-check">
              <li className={c.condiciones.entradaLibre24h ? '' : 'no'}>Entrada libre 24 h</li>
              <li className={h === null ? '' : 'no'}>{h === null ? 'Sin hora de llegada' : `Hora de llegada: ${h}:00`}</li>
              <li className={c.condiciones.visitas ? '' : 'no'}>Visitas permitidas</li>
              <li className={c.condiciones.cocina ? '' : 'no'}>Se puede cocinar</li>
              <li className={c.condiciones.mascotas ? '' : 'no'}>Mascotas permitidas</li>
            </ul>
            <p className="tenue">{c.descripcion}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
