-- Фаза 5: вход через Google (админка Виктора + личный кабинет гостя),
-- уведомления о заявках, действия по бронированию.
--
-- Единственный админ определяется по email (не по роли/таблице) — на MVP это
-- проще отдельной таблицы profiles с одной строкой, вынесено в константу ниже.

create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'selezn.777@gmail.com';
$$;

alter table bookings add column user_id uuid references auth.users(id) on delete set null;
alter table bookings add column admin_notified_at timestamptz;

create index bookings_user_id_idx on bookings(user_id);

-- Гость видит свои брони, админ — все
create policy "guest select own bookings" on bookings for select using (auth.uid() = user_id);
create policy "admin select bookings" on bookings for select using (is_admin());
create policy "admin update bookings" on bookings for update using (is_admin()) with check (is_admin());

create policy "guest select own booking_items" on booking_items for select using (
  exists (select 1 from bookings b where b.id = booking_items.booking_id and b.user_id = auth.uid())
);
create policy "admin select booking_items" on booking_items for select using (is_admin());

-- Подтверждение брони помечает даты гида занятыми
create policy "admin write guide_availability" on guide_availability for all
  using (is_admin()) with check (is_admin());

-- create_booking теперь привязывает заявку к вошедшему гостю, если он есть
create or replace function create_booking(p_booking jsonb, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id uuid;
begin
  insert into bookings (
    user_id, guest_name, contact_channel, contact_value, hotel, adults_total, children_total,
    notes, currency, subtotal_usd, discount_pct, surcharge_usd, total_usd, prepayment_usd,
    exchange_rate_snapshot
  )
  values (
    auth.uid(),
    p_booking->>'guest_name',
    p_booking->>'contact_channel',
    p_booking->>'contact_value',
    p_booking->>'hotel',
    (p_booking->>'adults_total')::smallint,
    coalesce((p_booking->>'children_total')::smallint, 0),
    p_booking->>'notes',
    coalesce(p_booking->>'currency', 'USD'),
    (p_booking->>'subtotal_usd')::numeric,
    (p_booking->>'discount_pct')::smallint,
    (p_booking->>'surcharge_usd')::numeric,
    (p_booking->>'total_usd')::numeric,
    (p_booking->>'prepayment_usd')::numeric,
    p_booking->'exchange_rate_snapshot'
  )
  returning id into v_booking_id;

  insert into booking_items (booking_id, tour_id, guide_id, date, date_end, adults, children, price_snapshot_usd)
  select
    v_booking_id,
    (item->>'tour_id')::uuid,
    nullif(item->>'guide_id', '')::uuid,
    (item->>'date')::date,
    nullif(item->>'date_end', '')::date,
    (item->>'adults')::smallint,
    coalesce((item->>'children')::smallint, 0),
    (item->>'price_snapshot_usd')::numeric
  from jsonb_array_elements(p_items) as item;

  return v_booking_id;
end;
$$;

grant execute on function create_booking(jsonb, jsonb) to anon, authenticated;

-- Действия админа: подтвердить (занимает даты гида), отклонить, предложить другую дату.
-- SECURITY DEFINER — чтобы одной транзакцией обновить bookings и вставить guide_availability;
-- сама функция проверяет is_admin() внутри, а не полагается только на RLS вызывающей роли.
create or replace function admin_set_booking_status(p_booking_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  if p_status not in ('confirmed', 'alt_proposed', 'cancelled') then
    raise exception 'invalid status';
  end if;

  update bookings set status = p_status, updated_at = now() where id = p_booking_id;

  if p_status = 'confirmed' then
    insert into guide_availability (guide_id, date, status)
    select bi.guide_id, d::date, 'booked'
    from booking_items bi
    cross join lateral generate_series(bi.date, coalesce(bi.date_end, bi.date), interval '1 day') as d
    where bi.booking_id = p_booking_id and bi.guide_id is not null
    on conflict (guide_id, date) do nothing;
  end if;
end;
$$;

grant execute on function admin_set_booking_status(uuid, text) to authenticated;
