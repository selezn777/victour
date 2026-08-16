-- Блок 4: колонка для вкл/выкл тура (сезонность) — политика admin update уже есть с прошлой миграции.
alter table tours add column is_active boolean not null default true;
