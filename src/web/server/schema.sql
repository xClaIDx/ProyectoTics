-- Esquema local de CasaScore (PostgreSQL). Lo aplica `npm run db:init`, que borra y vuelve a crear las tablas.
drop table if exists foto, condiciones, servicios, favorito, preferencia, sesion, cuarto, usuario cascade;

create table usuario (
  id text primary key,
  nombre text not null,
  correo text not null,
  rol text not null check (rol in ('arrendatario', 'propietario')),
  telefono text,
  password_hash text not null,
  creado_en timestamptz not null default now()
);
create unique index usuario_correo_unico on usuario (lower(correo));

create table sesion (
  token text primary key,
  usuario_id text not null references usuario on delete cascade,
  creado_en timestamptz not null default now()
);

create table preferencia (
  usuario_id text primary key references usuario on delete cascade,
  peso_precio smallint not null default 4 check (peso_precio between 0 and 5),
  peso_cercania smallint not null default 3 check (peso_cercania between 0 and 5),
  peso_seguridad smallint not null default 2 check (peso_seguridad between 0 and 5),
  peso_servicios smallint not null default 1 check (peso_servicios between 0 and 5),
  peso_bano smallint not null default 2 check (peso_bano between 0 and 5),
  ref_nombre text, ref_latitud double precision, ref_longitud double precision
);

create table cuarto (
  id text primary key,
  propietario_id text not null references usuario on delete cascade,
  titulo text not null, descripcion text not null default '',
  precio numeric(8,2) not null check (precio between 50 and 3000),
  area_m2 numeric(6,2) not null check (area_m2 > 0),
  bano_privado boolean not null, luz_natural boolean not null,
  direccion text not null, zona text not null,
  latitud double precision not null, longitud double precision not null,
  estado text not null default 'activo' check (estado in ('activo', 'oculto')),
  creado_en timestamptz not null default now()
);

create table favorito (
  usuario_id text not null references usuario on delete cascade,
  cuarto_id text not null references cuarto on delete cascade,
  primary key (usuario_id, cuarto_id)
);

create table servicios (
  cuarto_id text primary key references cuarto on delete cascade,
  agua_24h boolean not null, luz_24h boolean not null, internet_24h boolean not null
);

create table condiciones (
  cuarto_id text primary key references cuarto on delete cascade,
  entrada_libre_24h boolean not null, hora_llegada smallint check (hora_llegada between 0 and 23),
  visitas boolean not null, cocina boolean not null, mascotas boolean not null, declaradas boolean not null
);

-- Las 4 fotos del cuarto y la foto que sustenta cada característica de seguridad.
create table foto (
  cuarto_id text not null references cuarto on delete cascade,
  tipo text not null check (tipo in ('fachada', 'habitacion', 'bano', 'ventana', 'porton', 'rejas', 'iluminacion', 'camara')),
  url text not null,
  primary key (cuarto_id, tipo)
);
