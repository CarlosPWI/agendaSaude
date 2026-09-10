-- Migração: coluna de observações nas ocupações de agenda
-- Execute no SQL Editor do Supabase (uma vez).

ALTER TABLE public.agenda_ocupacoes
  ADD COLUMN IF NOT EXISTS observacoes text NOT NULL DEFAULT '';
