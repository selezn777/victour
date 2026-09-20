-- Виктор: "добавить больше вариантов управления, в том числе смену
-- тургида и перенос даты" — админ должен уметь поменять гида и/или дату
-- у уже созданной позиции заявки (booking_items), с реальным эффектом
-- (гость увидит новые данные у себя, гид больше не считается занятым по
-- старой дате). Если заявка уже подтверждена (confirmed), под старую
-- дату/гида уже стоит запись в guide_availability (см.
-- admin_set_booking_status) — её нужно снять и поставить новую, иначе
-- старый гид навсегда останется "занят" по датам, которые ему уже не
-- принадлежат, а новый гид не будет отмечен занятым вовсе.
create or replace function admin_reschedule_booking_item(
  p_item_id uuid,
  p_guide_id uuid,
  p_date date,
  p_date_end date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id uuid;
  v_old_guide_id uuid;
  v_old_date date;
  v_old_date_end date;
  v_status text;
  v_conflict boolean;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  select bi.booking_id, bi.guide_id, bi.date, bi.date_end, b.status
    into v_booking_id, v_old_guide_id, v_old_date, v_old_date_end, v_status
  from booking_items bi
  join bookings b on b.id = bi.booking_id
  where bi.id = p_item_id;

  if v_booking_id is null then
    raise exception 'booking item not found';
  end if;

  -- Не даём поставить гида, который на новую дату уже занят ДРУГОЙ
  -- бронью (исключаем из проверки его же старую запись по этой позиции,
  -- иначе смена одной только даты у того же гида ложно считалась бы
  -- конфликтом сама с собой).
  if p_guide_id is not null then
    select exists (
      select 1 from guide_availability ga
      where ga.guide_id = p_guide_id
        and ga.date between p_date and coalesce(p_date_end, p_date)
        and not (
          ga.guide_id = v_old_guide_id
          and ga.date between v_old_date and coalesce(v_old_date_end, v_old_date)
        )
    ) into v_conflict;

    if v_conflict then
      raise exception 'guide not available on selected date';
    end if;
  end if;

  update booking_items
  set guide_id = p_guide_id, date = p_date, date_end = p_date_end
  where id = p_item_id;

  if v_status = 'confirmed' then
    if v_old_guide_id is not null then
      delete from guide_availability
      where guide_id = v_old_guide_id
        and date between v_old_date and coalesce(v_old_date_end, v_old_date)
        and status = 'booked';
    end if;

    if p_guide_id is not null then
      insert into guide_availability (guide_id, date, status)
      select p_guide_id, d::date, 'booked'
      from generate_series(p_date, coalesce(p_date_end, p_date), interval '1 day') as d
      on conflict (guide_id, date) do nothing;
    end if;
  end if;
end;
$$;

grant execute on function admin_reschedule_booking_item(uuid, uuid, date, date) to authenticated;
