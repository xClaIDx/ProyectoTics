import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Cuarto, Pesos, Punto, Usuario } from '../types';
import * as repo from '../data/repo';

interface Ctx {
  usuario?: Usuario;
  setUsuario: (u?: Usuario) => void;
  cuartos: Cuarto[];
  recargar: () => Promise<void>;
  pesos: Pesos;
  setPesos: (p: Pesos) => void;
  punto: Punto;
  setPunto: (p: Punto) => void;
  favoritos: string[];
  alternarFavorito: (id: string) => void;
  busqueda: string;
  setBusqueda: (s: string) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuarioState] = useState<Usuario | undefined>(repo.usuarioActual());
  const [cuartos, setCuartos] = useState<Cuarto[]>(repo.listarCuartos());
  const [pesos, setPesosState] = useState<Pesos>(repo.leerPesos());
  const [punto, setPuntoState] = useState<Punto>(repo.leerPunto());
  const [favoritos, setFavoritos] = useState<string[]>(repo.leerFavoritos());
  const [busqueda, setBusqueda] = useState('');

  const recargar = useCallback(async () => {
    await repo.recargarCuartos();
    setCuartos(repo.listarCuartos());
  }, []);
  /** Al entrar o salir se cargan las prioridades, el punto y los favoritos de la cuenta. */
  const setUsuario = useCallback((u?: Usuario) => {
    setUsuarioState(u);
    setCuartos(repo.listarCuartos());
    setPesosState(repo.leerPesos());
    setPuntoState(repo.leerPunto());
    setFavoritos(repo.leerFavoritos());
  }, []);
  const setPesos = useCallback((p: Pesos) => { repo.guardarPesos(p); setPesosState(p); }, []);
  const setPunto = useCallback((p: Punto) => { repo.guardarPunto(p); setPuntoState(p); }, []);
  const alternarFavorito = useCallback((id: string) => {
    setFavoritos((f) => {
      const n = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      repo.guardarFavoritos(n);
      return n;
    });
  }, []);

  const value = useMemo(
    () => ({ usuario, setUsuario, cuartos, recargar, pesos, setPesos, punto, setPunto, favoritos, alternarFavorito, busqueda, setBusqueda }),
    [usuario, setUsuario, cuartos, recargar, pesos, setPesos, punto, setPunto, favoritos, alternarFavorito, busqueda],
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp debe usarse dentro de AppProvider');
  return c;
}
