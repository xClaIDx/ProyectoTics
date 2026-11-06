import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { cerrarSesion, guardarCuarto, reiniciarDatos } from '../data/repo';
import { calcularCasaScore } from '../lib/scoring';
import { PesosPanel } from '../components/PesosPanel';
import { RoomCard } from '../components/RoomCard';
import { Img } from '../components/Img';

export function Profile() {
  const { usuario, setUsuario, cuartos, pesos, setPesos, punto, favoritos, recargar } = useApp();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? (usuario?.rol === 'propietario' ? 'cuartos' : 'prioridades');

  if (!usuario && tab !== 'favoritos') return <Navigate to="/ingresar?siguiente=/perfil" replace />;
  const misCuartos = cuartos.filter((c) => c.propietarioId === usuario?.id);
  const favs = cuartos.filter((c) => favoritos.includes(c.id) && c.estado === 'activo');
  const tabs = usuario?.rol === 'propietario' ? [['cuartos', 'Mis cuartos'], ['favoritos', 'Favoritos'], ['cuenta', 'Mi cuenta']] : [['prioridades', 'Mis prioridades'], ['favoritos', 'Favoritos'], ['cuenta', 'Mi cuenta']];

  return (
    <main className="contenedor pagina">
      <div className="titulo-fila"><h1>{usuario ? `Hola, ${usuario.nombre.split(' ')[0]}` : 'Favoritos'}</h1>{usuario && <span className="tenue">{usuario.rol}</span>}</div>
      {usuario && (
        <div className="pestanas izquierda">
          {tabs.map(([k, t]) => <button key={k} className={tab === k ? 'activo' : ''} onClick={() => setParams({ tab: k })}>{t}</button>)}
        </div>
      )}

      {tab === 'prioridades' && (
        <section className="caja estrecha">
          <h2>Mis prioridades</h2>
          <p className="ayuda">Se guardan en tu cuenta y ordenan el ranking. Punto de referencia actual: <b>{punto.nombre}</b> (cámbialo desde la barra superior).</p>
          <PesosPanel pesos={pesos} onChange={setPesos} />
        </section>
      )}

      {tab === 'favoritos' && (
        favs.length ? <section className="cuadricula">{favs.map((c) => <RoomCard key={c.id} cuarto={c} d={calcularCasaScore(c, pesos, punto)} />)}</section>
          : <div className="vacio"><h3>Aún no guardas cuartos</h3><p>Toca el corazón de un cuarto para guardarlo aquí.</p><Link to="/" className="btn">Ver cuartos</Link></div>
      )}

      {tab === 'cuartos' && (
        <section>
          <div className="fila-entre"><p className="tenue">{misCuartos.length} cuartos publicados</p><Link to="/publicar" className="btn btn-primario">Publicar cuarto</Link></div>
          <div className="mis-cuartos">
            {misCuartos.map((c) => (
              <div key={c.id} className="caja fila-cuarto">
                <Img src={c.fotos.habitacion} alt={c.titulo} />
                <div className="crece">
                  <b>{c.titulo}</b>
                  <p className="tenue">{c.zona} · S/ {c.precio} /mes</p>
                  <span className={`estado ${c.estado}`}>{c.estado === 'activo' ? 'Activo' : 'Oculto'}</span>
                </div>
                <div className="pila">
                  <Link to={`/publicar/${c.id}`} className="btn">Editar</Link>
                  <button className="btn" onClick={() => guardarCuarto({ ...c, estado: c.estado === 'activo' ? 'oculto' : 'activo' }).then(recargar).catch((e) => alert(e.message))}>{c.estado === 'activo' ? 'Ocultar' : 'Mostrar'}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'cuenta' && usuario && (
        <section className="caja estrecha">
          <h2>Mi cuenta</h2>
          <p><b>Nombre:</b> {usuario.nombre}</p>
          <p><b>Correo:</b> {usuario.correo}</p>
          <p><b>Rol:</b> {usuario.rol}</p>
          <div className="acciones">
            <button className="btn" onClick={() => { cerrarSesion(); setUsuario(undefined); }}>Cerrar sesión</button>
            <button className="btn btn-peligro" onClick={() => reiniciarDatos().then(() => { location.href = '/'; }).catch((e) => alert(e.message))}>Restablecer datos de prueba</button>
          </div>
        </section>
      )}
    </main>
  );
}
