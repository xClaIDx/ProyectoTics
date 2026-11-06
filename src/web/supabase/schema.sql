-- Esquema de CasaScore para Supabase (PostgreSQL). Se usará al pasar de los datos locales a la nube.
create table usuario (
  id uuid primary key references auth.users on delete cascade,
  nombre text not null,
  correo text not null unique,
  rol text not null check (rol in ('arrendatario', 'propietario')),
  telefono text,
  creado_en timestamptz default now()
);

create table preferencia (
  usuario_id uuid primary key references usuario on delete cascade,
  peso_precio smallint default 4, peso_cercania smallint default 3, peso_seguridad smallint default 2,
  peso_servicios smallint default 1, peso_bano smallint default 2,
  ref_nombre text, ref_latitud double precision, ref_longitud double precision
);

create table cuarto (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references usuario on delete cascade,
  titulo text not null, descripcion text, precio numeric(8,2) not null, area_m2 numeric(6,2) not null,
  bano_privado boolean not null, luz_natural boolean not null,
  direccion text not null, zona text not null, latitud double precision not null, longitud double precision not null,
  estado text not null default 'activo' check (estado in ('activo', 'oculto')),
  creado_en timestamptz default now()
);

create table servicios (cuarto_id uuid primary key references cuarto on delete cascade, agua_24h boolean, luz_24h boolean, internet_24h boolean);
create table condiciones (
  cuarto_id uuid primary key references cuarto on delete cascade,
  entrada_libre_24h boolean, hora_llegada smallint, visitas boolean, cocina boolean, mascotas boolean, declaradas boolean
);
create table foto (
  id uuid primary key default gen_random_uuid(),
  cuarto_id uuid not null references cuarto on delete cascade,
  tipo text not null check (tipo in ('fachada', 'habitacion', 'bano', 'ventana', 'porton', 'rejas', 'iluminacion', 'camara')),
  url text not null
);

alter table usuario enable row level security;
alter table preferencia enable row level security;
alter table cuarto enable row level security;
alter table servicios enable row level security;
alter table condiciones enable row level security;
alter table foto enable row level security;

create policy "usuario propio" on usuario for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "preferencia propia" on preferencia for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
create policy "leer cuartos activos" on cuarto for select using (estado = 'activo' or auth.uid() = propietario_id);
create policy "propietario escribe sus cuartos" on cuarto for all using (auth.uid() = propietario_id) with check (auth.uid() = propietario_id);
create policy "leer servicios" on servicios for select using (true);
create policy "leer condiciones" on condiciones for select using (true);
create policy "leer fotos" on foto for select using (true);
create policy "dueño escribe servicios" on servicios for all using (exists (select 1 from cuarto c where c.id = cuarto_id and c.propietario_id = auth.uid()));
create policy "dueño escribe condiciones" on condiciones for all using (exists (select 1 from cuarto c where c.id = cuarto_id and c.propietario_id = auth.uid()));
create policy "dueño escribe fotos" on foto for all using (exists (select 1 from cuarto c where c.id = cuarto_id and c.propietario_id = auth.uid()));
