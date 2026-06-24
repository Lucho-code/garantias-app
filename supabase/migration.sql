-- ============================================================
-- GarantíasApp — Migración inicial
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla principal de garantías
create table if not exists public.warranties (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references auth.users(id) on delete cascade not null,
  name            text        not null,
  brand           text,
  model           text,
  category        text        not null default 'Otros',
  store           text,
  price           numeric,
  purchase_date   date        not null,
  warranty_months integer     not null check (warranty_months > 0),
  expiry_date     date        not null,
  notes           text,
  receipt_url     text,
  image_url       text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- Índices para búsquedas frecuentes
create index if not exists warranties_user_id_idx     on public.warranties(user_id);
create index if not exists warranties_expiry_date_idx on public.warranties(expiry_date);
create index if not exists warranties_category_idx    on public.warranties(category);

-- Row Level Security: cada usuario solo ve y modifica sus propias garantías
alter table public.warranties enable row level security;

create policy "Usuarios ven sus propias garantías"
  on public.warranties for select
  using (auth.uid() = user_id);

create policy "Usuarios insertan sus propias garantías"
  on public.warranties for insert
  with check (auth.uid() = user_id);

create policy "Usuarios actualizan sus propias garantías"
  on public.warranties for update
  using (auth.uid() = user_id);

create policy "Usuarios eliminan sus propias garantías"
  on public.warranties for delete
  using (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger warranties_updated_at
  before update on public.warranties
  for each row execute procedure public.handle_updated_at();
