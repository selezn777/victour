-- Блок 4: включать/выключать существующие туры без правки кода (сезонность).
create policy "admin update tours" on tours for update using (is_admin()) with check (is_admin());
