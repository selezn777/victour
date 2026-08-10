-- Захват незавершённых контактов: гость оставил телефон/ник, но не дозаполнил и не отправил
-- заявку. Отдельная таблица (не bookings — там обязательны отель/имя/итоги завершённой заявки).
-- Пользователь: "если это первый заход" — должна остаться возможность дожать/допродать тур.

create table leads (
  id uuid primary key default gen_random_uuid(),
  contact_channel text not null check (contact_channel in ('whatsapp', 'telegram', 'max', 'vk')),
  contact_value text not null unique,
  tour_interest text,
  source text,
  contacted boolean not null default false,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table leads enable row level security;

create policy "admin select leads" on leads for select using (is_admin());
create policy "admin update leads" on leads for update using (is_admin()) with check (is_admin());

-- Захват — публичный, но только через функцию (не прямой insert), чтобы избежать спама при
-- каждой перепечатке: апсерт по contact_value, возвращает true только при первой вставке
-- (используется клиентом, чтобы решить, слать ли уведомление Виктору).
create or replace function save_lead(
  p_contact_channel text,
  p_contact_value text,
  p_tour_interest text,
  p_source text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_new boolean;
begin
  insert into leads (contact_channel, contact_value, tour_interest, source)
  values (p_contact_channel, trim(p_contact_value), p_tour_interest, p_source)
  on conflict (contact_value) do update
    set tour_interest = excluded.tour_interest, updated_at = now()
  returning (xmax = 0) into v_is_new;

  return coalesce(v_is_new, false);
end;
$$;

grant execute on function save_lead(text, text, text, text) to anon, authenticated;

create or replace function admin_mark_lead_contacted(p_lead_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  update leads set contacted = true, updated_at = now() where id = p_lead_id;
end;
$$;

grant execute on function admin_mark_lead_contacted(uuid) to authenticated;
