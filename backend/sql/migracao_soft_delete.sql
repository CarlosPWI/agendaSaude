-- Migração: soft delete de agendamentos
-- Execute este script no SQL Editor do Supabase (uma vez).

ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS cancelado boolean NOT NULL DEFAULT false;

-- Recomendação: garanta que os horários sejam timestamptz (com fuso),
-- o backend agora envia/espera UTC.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'agendamentos'
      AND column_name IN ('data_hora_inicio', 'data_hora_fim')
  ) THEN
    ALTER TABLE agendamentos
      ALTER COLUMN data_hora_inicio TYPE timestamptz USING data_hora_inicio AT TIME ZONE 'UTC',
      ALTER COLUMN data_hora_fim TYPE timestamptz USING data_hora_fim AT TIME ZONE 'UTC';
  END IF;
END $$;
