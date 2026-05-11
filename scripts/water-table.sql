create table if not exists water_logs (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users not null,
  date        date        not null default current_date,
  total_ml    integer     not null default 0,
  created_at  timestamptz default now(),
  unique(user_id, date)
);

alter table water_logs enable row level security;

create policy "Users manage own water logs" on water_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
