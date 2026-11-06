import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { borrarBorrador, guardarBorrador, guardarCuarto, leerBorrador, obtenerCuarto } from '../data/repo';
import { comprimirImagen } from '../lib/imagen';
import { calcularCasaScore, nivelSeguridad } from '../lib/scoring';
import { PUNTOS } from '../data/seed';
import { MapPicker } from '../components/MapPicker';
import { ScoreBadge } from '../components/ScoreBadge';
import { Img } from '../components/Img';
import type { CaracteristicaSeguridad, Cuarto, Fotos } from '../types';

type Borrador = Omit<Cuarto, 'id' | 'propietarioId' | 'estado' | 'creadoEn'> & { id?: string };
const VACIO: Borrador = {
  titulo: '', descripcion: '', precio: 0, areaM2: 0, banoPrivado: false, luzNatural: false, direccion: '', zona: '',
  lat: PUNTOS[0].lat, lng: PUNTOS[0].lng, servicios: { agua: true, luz: true, internet: false }, seguridad: {},
  condiciones: { entradaLibre24h: false, horaLlegada: null, visitas: true, cocina: true, mascotas: false, declaradas: true },
  fotos: { fachada: '', habitacion: '', bano: '', ventana: '' },
};
const PASOS = ['Datos básicos', 'Servicios y seguridad', 'Convivencia', 'Ubicación', 'Fotos'];
const SEG: Record<CaracteristicaSeguridad, string> = { porton: 'Portón con llave propia', rejas: 'Rejas en ventanas', iluminacion: 'Iluminación exterior', camara: 'Cámara de vigilancia' };
const FOTOS: Record<keyof Fotos, string> = { fachada: 'Fachada', habitacion: 'Habitación', bano: 'Baño', ventana: 'Ventana' };

export function Publish() {
  const { id } = useParams();
  const { usuario, recargar, pesos, punto } = useApp();
  const nav = useNavigate();
  const existente = id ? obtenerCuarto(id) : undefined;
  const [b, setB] = useState<Borrador>(() => existente ?? leerBorrador<Borrador>() ?? VACIO);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => { if (!existente) guardarBorrador(b); }, [b, existente]);

  const vista = useMemo(() => calcularCasaScore({ ...b, id: 'v', propietarioId: '', estado: 'activo', creadoEn: '' }, pesos, punto), [b, pesos, punto]);

  if (!usuario) return <Navigate to="/ingresar?siguiente=/publicar" replace />;
  if (usuario.rol !== 'propietario') return <main className="contenedor pagina vacio"><h3>Solo los propietarios pueden publicar cuartos.</h3><Link to="/" className="btn">Volver</Link></main>;
  if (existente && existente.propietarioId !== usuario.id) return <Navigate to="/" replace />;

  const set = (p: Partial<Borrador>) => setB((x) => ({ ...x, ...p }));
  const validar = (i: number): string => {
    if (i === 0) {
      if (b.titulo.trim().length < 8) return 'Escribe un título de al menos 8 caracteres.';
      if (b.precio < 50 || b.precio > 3000) return 'Ingresa un precio mensual entre S/ 50 y S/ 3,000.';
      if (b.areaM2 < 4) return 'Ingresa el área de la habitación en m².';
    }
    if (i === 3 && (!b.direccion.trim() || !b.zona.trim())) return 'Escribe la dirección y la zona, y marca el cuarto en el mapa.';
    if (i === 4) {
      const falta = (Object.keys(FOTOS) as (keyof Fotos)[]).find((k) => !b.fotos[k]);
      if (falta) return `Falta la foto: ${FOTOS[falta]}. Las 4 fotos son obligatorias.`;
    }
    return '';
  };
  const siguiente = () => { const e = validar(paso); setError(e); if (!e) setPaso(paso + 1); };
  const publicar = async () => {
    for (let i = 0; i < PASOS.length; i++) { const e = validar(i); if (e) { setError(e); setPaso(i); return; } }
    setCargando(true);
    try {
      const guardado = await guardarCuarto({ ...b, id: existente?.id, propietarioId: usuario.id, estado: existente?.estado ?? 'activo', creadoEn: existente?.creadoEn ?? '' });
      if (!existente) borrarBorrador();
      await recargar();
      nav(`/cuarto/${guardado.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };
  const subirFoto = async (clave: string, archivo?: File, seguridad = false) => {
    if (!archivo) return;
    setCargando(true);
    try {
      const url = await comprimirImagen(archivo);
      if (seguridad) set({ seguridad: { ...b.seguridad, [clave]: url } });
      else set({ fotos: { ...b.fotos, [clave]: url } });
    } catch (e) { setError((e as Error).message); }
    setCargando(false);
  };

  return (
    <main className="contenedor pagina publicar">
      <div className="titulo-fila"><h1>{existente ? 'Editar cuarto' : 'Publicar cuarto'}</h1>{!existente && <span className="tenue">El avance se guarda solo</span>}</div>
      <ol className="pasos">
        {PASOS.map((p, i) => (
          <li key={p} className={i === paso ? 'activo' : i < paso ? 'hecho' : ''}><button onClick={() => i < paso && setPaso(i)}><span>{i + 1}</span>{p}</button></li>
        ))}
      </ol>

      <div className="publicar-grid">
        <section className="caja">
          {paso === 0 && (
            <>
              <label className="campo"><span>Título del anuncio</span><input value={b.titulo} onChange={(e) => set({ titulo: e.target.value })} placeholder="Ej.: Habitación con baño propio cerca de la UNA" /></label>
              <div className="dos">
                <label className="campo"><span>Precio mensual (S/)</span><input type="number" min={0} value={b.precio || ''} onChange={(e) => set({ precio: Number(e.target.value) })} /></label>
                <label className="campo"><span>Área (m²)</span><input type="number" min={0} value={b.areaM2 || ''} onChange={(e) => set({ areaM2: Number(e.target.value) })} /></label>
              </div>
              <div className="dos">
                <label className="check"><input type="checkbox" checked={b.banoPrivado} onChange={(e) => set({ banoPrivado: e.target.checked })} /> Baño privado</label>
                <label className="check"><input type="checkbox" checked={b.luzNatural} onChange={(e) => set({ luzNatural: e.target.checked })} /> Ventana con luz natural directa</label>
              </div>
              <label className="campo"><span>Descripción</span><textarea rows={4} value={b.descripcion} onChange={(e) => set({ descripcion: e.target.value })} placeholder="Cuenta lo que incluye el cuarto y cómo es la casa." /></label>
            </>
          )}
          {paso === 1 && (
            <>
              <h3>Servicios las 24 horas</h3>
              {(['agua', 'luz', 'internet'] as const).map((k) => (
                <label key={k} className="check"><input type="checkbox" checked={b.servicios[k]} onChange={(e) => set({ servicios: { ...b.servicios, [k]: e.target.checked } })} /> {k[0].toUpperCase() + k.slice(1)}</label>
              ))}
              <h3>Seguridad</h3>
              <p className="ayuda">Cada característica suma un punto de seguridad solo si subes su foto. Nivel actual: <b>{nivelSeguridad(b)} de 5</b>.</p>
              <div className="fotos-seg">
                {(Object.keys(SEG) as CaracteristicaSeguridad[]).map((k) => (
                  <label key={k} className={`foto-carga ${b.seguridad[k] ? 'con-foto' : ''}`}>
                    {b.seguridad[k] ? <Img src={b.seguridad[k]} alt={SEG[k]} /> : <span className="mas">+</span>}
                    <small>{SEG[k]}</small>
                    <input type="file" accept="image/*" onChange={(e) => subirFoto(k, e.target.files?.[0], true)} />
                    {b.seguridad[k] && <button type="button" className="quitar" onClick={(e) => { e.preventDefault(); const s = { ...b.seguridad }; delete s[k]; set({ seguridad: s }); }}>Quitar</button>}
                  </label>
                ))}
              </div>
            </>
          )}
          {paso === 2 && (
            <>
              <p className="ayuda">Declara todas las condiciones. Si una condición no se declara y se comprueba, el cuarto pierde 25 puntos.</p>
              <label className="check"><input type="checkbox" checked={b.condiciones.entradaLibre24h} onChange={(e) => set({ condiciones: { ...b.condiciones, entradaLibre24h: e.target.checked } })} /> Entrada libre 24 h con llave propia</label>
              <label className="campo"><span>Hora de llegada</span>
                <select value={b.condiciones.horaLlegada ?? ''} onChange={(e) => set({ condiciones: { ...b.condiciones, horaLlegada: e.target.value ? Number(e.target.value) : null } })}>
                  <option value="">Sin hora de llegada</option>
                  <option value="20">Hasta las 20:00</option>
                  <option value="21">Hasta las 21:00</option>
                  <option value="22">Hasta las 22:00</option>
                  <option value="23">Hasta las 23:00</option>
                </select>
              </label>
              <label className="check"><input type="checkbox" checked={b.condiciones.visitas} onChange={(e) => set({ condiciones: { ...b.condiciones, visitas: e.target.checked } })} /> Se permiten visitas</label>
              <label className="check"><input type="checkbox" checked={b.condiciones.cocina} onChange={(e) => set({ condiciones: { ...b.condiciones, cocina: e.target.checked } })} /> Se puede cocinar</label>
              <label className="check"><input type="checkbox" checked={b.condiciones.mascotas} onChange={(e) => set({ condiciones: { ...b.condiciones, mascotas: e.target.checked } })} /> Se aceptan mascotas</label>
              <label className="check destacado"><input type="checkbox" checked={b.condiciones.declaradas} onChange={(e) => set({ condiciones: { ...b.condiciones, declaradas: e.target.checked } })} /> Declaro que estas condiciones son verdaderas y completas</label>
            </>
          )}
          {paso === 3 && (
            <>
              <div className="dos">
                <label className="campo"><span>Dirección</span><input value={b.direccion} onChange={(e) => set({ direccion: e.target.value })} placeholder="Ej.: Jr. Los Incas 230" /></label>
                <label className="campo"><span>Zona o barrio</span><input value={b.zona} onChange={(e) => set({ zona: e.target.value })} placeholder="Ej.: Barrio Laykakota" /></label>
              </div>
              <p className="ayuda">Toca el mapa en la ubicación exacta del cuarto.</p>
              <MapPicker centro={[b.lat, b.lng]} marcas={[{ lat: b.lat, lng: b.lng, etiqueta: 'Tu cuarto' }]} onPick={(lat, lng) => set({ lat, lng })} alto={340} />
            </>
          )}
          {paso === 4 && (
            <>
              <p className="ayuda">Sube las 4 fotos obligatorias. Se reducen automáticamente para que carguen rápido.</p>
              <div className="fotos-obl">
                {(Object.keys(FOTOS) as (keyof Fotos)[]).map((k) => (
                  <label key={k} className={`foto-carga grande ${b.fotos[k] ? 'con-foto' : ''}`}>
                    {b.fotos[k] ? <Img src={b.fotos[k]} alt={FOTOS[k]} /> : <span className="mas">+</span>}
                    <small>{FOTOS[k]}</small>
                    <input type="file" accept="image/*" onChange={(e) => subirFoto(k, e.target.files?.[0])} />
                  </label>
                ))}
              </div>
              {cargando && <p className="ayuda">Procesando foto…</p>}
            </>
          )}

          {error && <p className="error">{error}</p>}
          <div className="acciones">
            {paso > 0 && <button className="btn" onClick={() => { setError(''); setPaso(paso - 1); }}>Anterior</button>}
            {paso < PASOS.length - 1 ? <button className="btn btn-primario" onClick={siguiente}>Siguiente: {PASOS[paso + 1].toLowerCase()}</button> : <button className="btn btn-primario" onClick={publicar} disabled={cargando}>{cargando ? 'Guardando…' : existente ? 'Guardar cambios' : 'Publicar cuarto'}</button>}
          </div>
        </section>

        <aside className="caja vista-previa">
          <h3>Así lo verán los arrendatarios</h3>
          <div className="previa-foto"><Img src={b.fotos.habitacion} alt="Vista previa" /><ScoreBadge valor={vista.puntaje} /></div>
          <p className="tarjeta-zona">{b.zona || 'Zona'}</p>
          <p className="tarjeta-titulo">{b.titulo || 'Título del anuncio'}</p>
          <div className="precio">S/ <b>{b.precio || 0}</b><small>.00 /mes</small></div>
          <p className="ayuda">Puntaje estimado con tus prioridades actuales desde {punto.nombre}. Cada arrendatario ve su propio puntaje.</p>
        </aside>
      </div>
    </main>
  );
}
