-- Фаза 6: Оплата (MVP — ручное подтверждение).
-- Предоплата теперь фиксированная небольшая сумма (не 30%), а не процент от суммы заявки —
-- осознанное решение владельца: маленькая предоплата — конкурентное преимущество, остальное
-- наличными при встрече. Реквизиты для перевода менеджер сообщает лично в переписке
-- (не публикуются на сайте), поэтому платёжных данных в схеме нет — только статус.

insert into settings (key, value) values ('deposit_usd', '{"amount": 80}'::jsonb)
  on conflict (key) do nothing;

alter table bookings add column payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid', 'confirmed'));
alter table bookings add column payment_confirmed_at timestamptz;

-- Подтверждение получения предоплаты — только админ, вручную (реквизиты и приём денег вне сайта).
create or replace function admin_confirm_payment(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  update bookings set payment_status = 'confirmed', payment_confirmed_at = now(), updated_at = now()
  where id = p_booking_id;
end;
$$;

grant execute on function admin_confirm_payment(uuid) to authenticated;
