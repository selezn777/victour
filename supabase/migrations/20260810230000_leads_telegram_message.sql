-- Храним id отправленного в Telegram сообщения о незавершённом контакте, чтобы
-- удалить его, если гость всё же дозаполнит и отправит заявку — без задержек/cron.
alter table leads add column telegram_message_id bigint;
