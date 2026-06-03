-- Notifications de fin de repos.
-- Une seule ligne par utilisateur (le repos en cours). Écrite/lue uniquement
-- par le service role côté serveur ; RLS activé pour bloquer l'accès client.
--
-- À exécuter une fois dans le SQL Editor de Supabase.

create table if not exists public.rest_timers (
  user_id    uuid not null references auth.users(id) on delete cascade,
  token      text not null,
  fire_at    timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id)
);

alter table public.rest_timers enable row level security;
-- Aucune policy : seul le service role (qui contourne RLS) y accède.
