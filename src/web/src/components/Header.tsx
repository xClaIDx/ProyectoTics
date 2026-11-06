import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { cerrarSesion } from '../data/repo';
import { Logo } from './Logo';
import { PuntoModal } from './PuntoModal';
import { IconChevron, IconHeart, IconHome, IconLogout, IconMenu, IconPin, IconPlus, IconSearch, IconUser, IconX } from './Icons';

export function Header() {
  const { usuario, setUsuario, punto, busqueda, setBusqueda, favoritos } = useApp();
  const [menu, setMenu] = useState(false);
  const [modalPunto, setModalPunto] = useState(false);
  const nav = useNavigate();
  const salir = () => { cerrarSesion(); setUsuario(undefined); setMenu(false); nav('/'); };

  return (
    <>
      <header className="cabecera">
        <div className="cabecera-fila contenedor">
          <button className="btn-icono" aria-label="Menú" onClick={() => setMenu(true)}><IconMenu /></button>
          <Logo />
          <label className="buscador">
            <IconSearch width={18} height={18} />
            <input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); nav('/'); }} placeholder="Busca por zona, calle o tipo de cuarto" aria-label="Buscar cuartos" />
          </label>
          <div className="cabecera-acciones">
            {(!usuario || usuario.rol === 'propietario') && (
              <Link to="/publicar" className="btn btn-primario btn-publicar"><IconPlus width={18} height={18} /> <span>Publicar</span></Link>
            )}
            <Link to="/perfil?tab=favoritos" className="btn-icono" aria-label="Favoritos">
              <IconHeart />{favoritos.length > 0 && <span className="punto-contador">{favoritos.length}</span>}
            </Link>
            <Link to={usuario ? '/perfil' : '/ingresar'} className="btn-icono" aria-label={usuario ? 'Mi perfil' : 'Ingresar'}><IconUser /></Link>
          </div>
        </div>
        <button className="barra-punto" onClick={() => setModalPunto(true)}>
          <span className="contenedor barra-punto-int">
            <IconPin width={18} height={18} />
            <span><b>{punto.nombre}</b>, Puno</span>
            <IconChevron width={18} height={18} className="empuja" />
          </span>
        </button>
      </header>

      {menu && (
        <div className="velo" onClick={() => setMenu(false)}>
          <nav className="menu-lateral" onClick={(e) => e.stopPropagation()}>
            <div className="menu-cab"><Logo /><button className="btn-icono" onClick={() => setMenu(false)} aria-label="Cerrar"><IconX /></button></div>
            {usuario && <p className="menu-usuario">Hola, <b>{usuario.nombre.split(' ')[0]}</b> · {usuario.rol}</p>}
            <NavLink to="/" onClick={() => setMenu(false)}><IconHome /> Todos los cuartos</NavLink>
            <NavLink to="/perfil?tab=favoritos" onClick={() => setMenu(false)}><IconHeart /> Favoritos</NavLink>
            {usuario?.rol === 'propietario' && <NavLink to="/publicar" onClick={() => setMenu(false)}><IconPlus /> Publicar cuarto</NavLink>}
            {usuario ? (
              <>
                <NavLink to="/perfil" onClick={() => setMenu(false)}><IconUser /> Mi perfil</NavLink>
                <button onClick={salir}><IconLogout /> Cerrar sesión</button>
              </>
            ) : (
              <NavLink to="/ingresar" onClick={() => setMenu(false)}><IconUser /> Ingresar o crear cuenta</NavLink>
            )}
            <NavLink to="/como-funciona" onClick={() => setMenu(false)}>Cómo se calcula el CASA SCORE</NavLink>
          </nav>
        </div>
      )}
      {modalPunto && <PuntoModal onClose={() => setModalPunto(false)} />}
    </>
  );
}
