-- Migration: Add / Update notification_settings table and SMTP columns
BEGIN;

CREATE TABLE IF NOT EXISTS notification_settings (
  id serial PRIMARY KEY,
  email_enabled boolean DEFAULT false,
  email_to text,
  smtp_host text DEFAULT 'smtp.gmail.com',
  smtp_port numeric DEFAULT 587,
  smtp_secure boolean DEFAULT false,
  smtp_user text,
  smtp_password text,
  sender_name text DEFAULT 'Xe Ghép Liên Tỉnh — Tổng đài',
  sender_email text,
  telegram_enabled boolean DEFAULT false,
  telegram_bot_token text,
  telegram_chat_id text,
  updated_at timestamp(3) with time zone DEFAULT now(),
  created_at timestamp(3) with time zone DEFAULT now()
);

ALTER TABLE notification_settings
  ADD COLUMN IF NOT EXISTS smtp_host text DEFAULT 'smtp.gmail.com',
  ADD COLUMN IF NOT EXISTS smtp_port numeric DEFAULT 587,
  ADD COLUMN IF NOT EXISTS smtp_secure boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS smtp_user text,
  ADD COLUMN IF NOT EXISTS smtp_password text,
  ADD COLUMN IF NOT EXISTS sender_name text DEFAULT 'Xe Ghép Liên Tỉnh — Tổng đài',
  ADD COLUMN IF NOT EXISTS sender_email text,
  ADD COLUMN IF NOT EXISTS email_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_to text,
  ADD COLUMN IF NOT EXISTS telegram_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS telegram_bot_token text,
  ADD COLUMN IF NOT EXISTS telegram_chat_id text;

INSERT INTO notification_settings (id, email_enabled, smtp_host, smtp_port, sender_name)
SELECT 1, false, 'smtp.gmail.com', 587, 'Xe Ghép Liên Tỉnh — Tổng đài'
WHERE NOT EXISTS (SELECT 1 FROM notification_settings WHERE id = 1);

COMMIT;
