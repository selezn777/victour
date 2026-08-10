-- Фаза 4, фикс: Postgres проверяет RETURNING в INSERT по SELECT-политикам таблицы,
-- а у bookings/booking_items их нет (анонимам намеренно нельзя читать чужие брони) —
-- поэтому `returning id into v_booking_id` внутри create_booking падал с 42501,
-- хотя сам insert (без returning) анонимной ролью проходил. SECURITY DEFINER запускает
-- функцию от имени владельца (обходит RLS изнутри), наружу отдаётся только сгенерированный
-- uuid — читать чужие брони по-прежнему нельзя.

alter function create_booking(jsonb, jsonb) security definer;
