-- Виктор: личный кабинет гостя после подтверждения предоплаты должен
-- показывать время выезда и комментарий от гида по каждому туру в
-- заявке — таких полей раньше не было вообще. Свободный текст (не
-- timestamp) для времени выезда: это не отдельное бронируемое событие,
-- просто заметка админа/гида ("08:00", "после завтрака" и т.п.).
alter table booking_items
  add column departure_time text,
  add column guide_comment text;

-- По образцу admin_reschedule_booking_item — прямой UPDATE с клиента
-- запрещён RLS (на booking_items только select-политики), пишем через
-- security definer RPC с проверкой is_admin(). В отличие от смены
-- гида/даты тут нет побочных эффектов на guide_availability — это чисто
-- информационные поля.
create or replace function admin_update_booking_item_notes(
  p_item_id uuid,
  p_departure_time text,
  p_guide_comment text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  update booking_items
  set departure_time = nullif(p_departure_time, ''),
      guide_comment = nullif(p_guide_comment, '')
  where id = p_item_id;

  if not found then
    raise exception 'booking item not found';
  end if;
end;
$$;

grant execute on function admin_update_booking_item_notes(uuid, text, text) to authenticated;
