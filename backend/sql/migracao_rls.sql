-- Migração: Habilitar Row Level Security (RLS) nas tabelas públicas
-- Execute este script no SQL Editor do Supabase (uma vez).
--
-- IMPORTANTE: o backend opera com a SERVICE ROLE key (ignora RLS). As policies
-- abaixo protegem o acesso direto via PostgREST (chave anon/usuários logados).
-- O backend não pode usar a chave anon para tabelas após esta migração.

-- 1) Habilitar RLS em todas as tabelas públicas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agentescomunitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statusagendamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiposusuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos_auditoria ENABLE ROW LEVEL SECURITY;

-- 2) usuarios: cada usuário só acessa os próprios dados (auth.uid())
DROP POLICY IF EXISTS "Usuarios podem ver seus dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios podem inserir seus dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios podem atualizar seus dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios podem deletar seus dados" ON public.usuarios;

CREATE POLICY "Usuarios podem ver seus dados" ON public.usuarios
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios podem inserir seus dados" ON public.usuarios
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuarios podem atualizar seus dados" ON public.usuarios
  FOR UPDATE TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios podem deletar seus dados" ON public.usuarios
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- 3) Tabelas de dados: acesso para usuários autenticados (backend usa service
--    role, que ignora RLS; estas policies permitem operações com sessão direta)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['pacientes','agendamentos','agentescomunitarios','statusagendamento','tiposusuarios'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "acesso_autenticado_%s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "acesso_autenticado_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- 4) agendamentos_auditoria: apenas service role (sem policy para anon/authenticated)