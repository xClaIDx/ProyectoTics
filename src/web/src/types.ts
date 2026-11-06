export type Rol = 'arrendatario' | 'propietario';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  telefono?: string;
  creadoEn: string;
}

export interface Punto {
  nombre: string;
  lat: number;
  lng: number;
}

export interface Servicios {
  agua: boolean;
  luz: boolean;
  internet: boolean;
}

export type CaracteristicaSeguridad = 'porton' | 'rejas' | 'iluminacion' | 'camara';

export interface Condiciones {
  entradaLibre24h: boolean;
  /** Hora límite de llegada (20, 21, 22, 23). null = sin hora de llegada. */
  horaLlegada: number | null;
  visitas: boolean;
  cocina: boolean;
  mascotas: boolean;
  declaradas: boolean;
}

export interface Fotos {
  fachada: string;
  habitacion: string;
  bano: string;
  ventana: string;
}

export interface Cuarto {
  id: string;
  propietarioId: string;
  titulo: string;
  descripcion: string;
  precio: number;
  areaM2: number;
  banoPrivado: boolean;
  luzNatural: boolean;
  direccion: string;
  zona: string;
  lat: number;
  lng: number;
  servicios: Servicios;
  /** Cada característica de seguridad guarda la foto que la sustenta. */
  seguridad: Partial<Record<CaracteristicaSeguridad, string>>;
  condiciones: Condiciones;
  fotos: Fotos;
  estado: 'activo' | 'oculto';
  creadoEn: string;
}

export interface Pesos {
  precio: number;
  cercania: number;
  seguridad: number;
  servicios: number;
  bano: number;
}

export interface Ajuste {
  etiqueta: string;
  puntos: number;
}

export interface Desglose {
  distancia: number;
  minutos: number;
  normalizados: Pesos;
  base: number;
  bonificaciones: Ajuste[];
  penalizaciones: Ajuste[];
  puntaje: number;
}
