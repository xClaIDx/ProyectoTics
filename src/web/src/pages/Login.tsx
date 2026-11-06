import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { iniciarSesion, registrar } from '../data/repo';
import { useApp } from '../state/AppContext';
import type { Rol } from '../types';

export function Login() {
  const [params] = useSearchParams();
  const siguiente = params.get('siguiente') ?? '/';
  const { setUsuario } = useApp();
  const nav = useNavigate();
  const [modo, setModo] = useState<'ingresar' | 'registro'>('ingresar');
  const [f, setF] = useState({ nombre: '', correo: '', password: '', telefono: '', rol: 'arrendatario' as Rol, acepta: false });
  const [error, setError] = useState('');

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (modo === 'ingresar') setUsuario(await iniciarSesion(f.correo, f.password));
      else {
        if (f.nombre.trim().length < 3) throw new Error('Escribe tu nombre completo.');
        if (f.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
        if (!f.acepta) throw new Error('Debes aceptar los términos de uso y la política de privacidad.');
        setUsuario(await registrar({ nombre: f.nombre, correo: f.correo, rol: f.rol, telefono: f.telefono ? `51${f.telefono.replace(/\D/g, '')}` : undefined }, f.password));
      }
      nav(siguiente);
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <main className="contenedor pagina ingreso">
      <form className="caja formulario" onSubmit={enviar}>
        <div className="pestanas">
          <button type="button" className={modo === 'ingresar' ? 'activo' : ''} onClick={() => setModo('ingresar')}>Ingresar</button>
          <button type="button" className={modo === 'registro' ? 'activo' : ''} onClick={() => setModo('registro')}>Crear cuenta</button>
        </div>
        {modo === 'registro' && (
          <>
            <div className="selector-rol">
              {(['arrendatario', 'propietario'] as Rol[]).map((r) => (
                <button type="button" key={r} className={f.rol === r ? 'activo' : ''} onClick={() => setF({ ...f, rol: r })}>
                  <b>{r === 'arrendatario' ? 'Busco cuarto' : 'Publico cuartos'}</b><small>{r === 'arrendatario' ? 'Arrendatario' : 'Propietario'}</small>
                </button>
              ))}
            </div>
            <label className="campo"><span>Nombre completo</span><input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required /></label>
            {f.rol === 'propietario' && <label className="campo"><span>Celular (para que te contacten por WhatsApp)</span><input value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} placeholder="9XXXXXXXX" /></label>}
          </>
        )}
        <label className="campo"><span>Correo</span><input type="email" value={f.correo} onChange={(e) => setF({ ...f, correo: e.target.value })} required /></label>
        <label className="campo"><span>Contraseña</span><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></label>
        {modo === 'registro' && (
          <label className="check"><input type="checkbox" checked={f.acepta} onChange={(e) => setF({ ...f, acepta: e.target.checked })} /> Acepto los términos de uso y la política de privacidad: mis datos solo se usan para el servicio y no se ceden a terceros (Ley N.º 29733).</label>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primario ancho" type="submit">{modo === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}</button>
        {modo === 'ingresar' && (
          <p className="ayuda">Cuentas de prueba: <b>demo@casascore.pe</b> (arrendatario) y <b>propietario@casascore.pe</b> (propietario), contraseña <b>demo123</b>.</p>
        )}
        <p className="ayuda"><Link to="/">Seguir viendo cuartos sin ingresar</Link></p>
      </form>
    </main>
  );
}
