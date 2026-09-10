-- Migração: Ocupações de agenda (reunião, grupo, bloqueio) sem paciente
-- Mantém o layout do Planner atual; horários em UTC (timestamptz), 1h por slot.
-- Execute no SQL Editor do Supabase (uma vez).

CREATE TABLE IF NOT EXISTS public.agenda_ocupacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (usuario_id) on delete cascade,
  data_hora_inicio timestamptz not null,
  data_hora_fim timestamptz not null,
  tipo text not null default 'bloqueio'
    check (tipo in ('reuniao', 'grupo', 'bloqueio')),
  titulo text not null default '',
  criado_em timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_agenda_ocupacoes_inicio
  ON public.agenda_ocupacoes (data_hora_inicio);

-- RLS: usuário autenticado só acessa as próprias ocupações
ALTER TABLE public.agenda_ocupacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ocupacoes select" ON public.agenda_ocupacoes;
DROP POLICY IF EXISTS "ocupacoes insert" ON public.agenda_ocupacoes;
DROP POLICY IF EXISTS "ocupacoes delete" ON public.agenda_ocupacoes;

CREATE POLICY "ocupacoes select" ON public.agenda_ocupacoes
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "ocupacoes insert" ON public.agenda_ocupacoes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "ocupacoes delete" ON public.agenda_ocupacoes
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

GRANT SELECT, INSERT, DELETE ON public.agenda_ocupacoes TO authenticated;
