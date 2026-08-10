-- FAQ: статичные вопросы из брифа + возможность гостя задать свой вопрос.
-- Вопрос падает в админку неотвеченным (не публикуется), Виктор отвечает — после
-- этого вопрос появляется в общем FAQ и/или на странице привязанного тура.

create table faq_items (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete set null,
  question text not null,
  answer text,
  is_seed boolean not null default false,
  admin_notified_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

create index faq_items_tour_id_idx on faq_items(tour_id);
create index faq_items_created_at_idx on faq_items(created_at desc);

alter table faq_items enable row level security;

-- Публично видны только отвеченные вопросы — неотвеченные не публикуются сами по себе.
create policy "public select answered faq" on faq_items for select using (answer is not null);
create policy "admin select faq" on faq_items for select using (is_admin());
create policy "admin update faq" on faq_items for update using (is_admin()) with check (is_admin());
create policy "admin delete faq" on faq_items for delete using (is_admin());

-- Вставка вопроса — только через функцию (не прямой insert), чтобы не упереться в RLS
-- RETURNING (у анонима нет SELECT-политики на свежий неотвеченный вопрос) и не давать
-- гостю писать произвольные поля (answer/is_seed/admin_notified_at).
create or replace function ask_faq_question(p_question text, p_tour_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if trim(coalesce(p_question, '')) = '' then
    raise exception 'question is empty';
  end if;

  insert into faq_items (tour_id, question)
  values (p_tour_id, trim(p_question))
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function ask_faq_question(text, uuid) to anon, authenticated;

create or replace function admin_answer_faq(p_id uuid, p_answer text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  if trim(coalesce(p_answer, '')) = '' then
    raise exception 'answer is empty';
  end if;

  update faq_items set answer = trim(p_answer), answered_at = now() where id = p_id;
end;
$$;

grant execute on function admin_answer_faq(uuid, text) to authenticated;

-- Сид: общий FAQ из брифа (питание, дети, Камрань/Amiana, отмены, погода, оплата).
insert into faq_items (question, answer, is_seed, answered_at) values
(
  'Питание включено в стоимость экскурсии?',
  'Где питание не включено в программу, вы выбираете блюда сами по меню в выбранном месте — мы бронируем хорошее заведение и берём на себя всю логистику, а не готовое меню на всех. Что именно включено в конкретном туре — смотрите в описании программы на странице тура.',
  true, now()
),
(
  'Можно ли поехать с детьми?',
  'Да, туры private — маршрут и темп подстраиваются под семью, в том числе под жару, усталость и интересы детей. Цена по каждому туру считается отдельно для взрослых и детей — это уже учтено в калькуляторе на странице тура.',
  true, now()
),
(
  'Мы живём в Камрани или Amiana — заберёте оттуда?',
  'Да. Забор из Нячанга включён в стоимость, а для Камрани и Amiana действует доплата за дальний трансфер — около 500 000 VND за группу туда и обратно (для premium-автомобиля сумма подтверждается по факту). Она показывается отдельно при расчёте и не участвует в пакетной скидке.',
  true, now()
),
(
  'Что если нужно отменить или перенести тур?',
  'При отмене заранее или по уважительной причине — полный возврат предоплаты. При отмене менее чем за 24 часа до тура или неявке — предоплата ($80) не возвращается, остальное не взимается. Если выбранная дата не подтверждается, сначала предложим альтернативу; если не подходит — вернём предоплату в течение 3–5 дней.',
  true, now()
),
(
  'Что будет с туром, если пойдёт дождь?',
  'Мы не обещаем то, что зависит от погоды, расписания или внешнего оператора, но маршрут гибкий — гид подстраивает программу на месте под условия дня. Если поездка становится невозможной из-за погоды, действуют те же правила возврата, что и при отмене по уважительной причине.',
  true, now()
),
(
  'Как оплатить тур?',
  'Нужна небольшая предоплата — от $80, чтобы забронировать дату у гида. Остаток — наличными на месте, в день тура после прибытия на первую точку. Реквизиты для предоплаты Виктор присылает лично после того, как заявка подтверждена.',
  true, now()
);
