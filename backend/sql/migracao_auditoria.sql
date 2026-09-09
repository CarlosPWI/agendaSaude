-- Migração: trilha de auditoria de agendamentos
-- Execute este script no SQL Editor do Supabase (uma vez).
-- Registra QUEM fez o quê e QUANDO em cada agendamento
-- (criação, atualização/reagendamento e cancelamento).

CREATE TABLE IF NOT EXISTS agendamentos_auditoria (
  auditoria_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agendamento_id bigint NOT NULL,
  usuario_id     uuid,
  acao           text NOT NULL CHECK (acao IN ('criado', 'atualizado', 'cancelado')),
  dados          jsonb,
  criado_em      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_auditoria_agendamento
  ON agendamentos_auditoria (agendamento_id);

CREATE INDEX IF NOT EXISTS idx_agendamentos_auditoria_usuario
  ON agendamentos_auditoria (usuario_id);
