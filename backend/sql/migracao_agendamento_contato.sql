-- Migração: campos de contato (e-mail e WhatsApp) no agendamento
-- Execute no SQL Editor do Supabase (uma vez).

ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS whatsapp text;
