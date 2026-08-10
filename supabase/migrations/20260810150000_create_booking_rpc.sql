-- Фаза 4: атомарная запись заявки (bookings + booking_items одним вызовом),
-- иначе при сбое между двумя insert'ами анонимного клиента остаётся заявка без позиций
-- (rollback недоступен — RLS разрешает анонимам только insert, без delete/update).

create or replace function create_booking(p_booking jsonb, p_items jsonb)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_booking_id uuid;
begin
  insert into bookings (
    guest_name, contact_channel, contact_value, hotel, adults_total, children_total,
    notes, currency, subtotal_usd, discount_pct, surcharge_usd, total_usd, prepayment_usd,
    exchange_rate_snapshot
  )
  values (
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
