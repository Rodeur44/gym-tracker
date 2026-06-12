-- Rate limiting persistant (partagé entre toutes les instances serverless).
-- Remplace le compteur in-memory qui se réinitialise à chaque cold start Vercel.
--
-- À exécuter une fois dans le SQL Editor de Supabase :
-- Dashboard → SQL Editor → New query → coller & exécuter.
--
-- Tant que cette migration n'est pas exécutée, l'app retombe automatiquement
-- sur le rate limiting in-memory (aucune régression).

create table if not exists public.rate_limits (
  key        text not null primary key,
  count      integer not null default 0,
  reset_at   timestamptz not null
);

alter table public.rate_limits enable row level security;
-- Aucune policy : seul le service role (qui contourne RLS) y accède.

-- Consomme un jeton de manière atomique. Retourne (ok, remaining, retry_after).
create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_sec integer
)
returns table (ok boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_count integer;
  v_reset_at timestamptz;
begin
  insert into rate_limits as rl (key, count, reset_at)
  values (p_key, 1, v_now + make_interval(secs => p_window_sec))
  on conflict (key) do update
    set count    = case when rl.reset_at <= v_now then 1 else rl.count + 1 end,
        reset_at = case when rl.reset_at <= v_now
                        then v_now + make_interval(secs => p_window_sec)
                        else rl.reset_at end
  returning rl.count, rl.reset_at into v_count, v_reset_at;

  if v_count > p_limit then
    return query select false, 0,
      greatest(1, ceil(extract(epoch from (v_reset_at - v_now)))::integer);
  else
    return query select true, p_limit - v_count, 0;
  end if;
end;
$$;

-- Nettoyage opportuniste des fenêtres expirées (optionnel, garde la table petite).
-- Peut être planifié via pg_cron si disponible, sinon ignorer.
-- delete from rate_limits where reset_at < now() - interval '1 day';
