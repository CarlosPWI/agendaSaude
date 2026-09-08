# Checkpoint — Sessão 08/09/2026

> **Equipe agenda Saúde — PI2**
> Resumo de tudo que foi feito em 08/09/2026. Branch: `integracao-pi2` (PR #1).

## 1. Correções técnicas (backend)

### 1.1. Row Level Security (RLS) no Supabase — solução correta
- **Problema:** lint do Supabase apontava tabelas públicas sem RLS; `usuarios` tinha policies por `auth.uid()` mas com RLS desabilitado.
- **O que foi feito:**
  - Backend migrado para acessar **tabelas** via cliente `db` (**service role**, que ignora RLS); operações de **Auth** continuam no cliente anon.
  - `ENABLE ROW LEVEL SECURITY` em 7 tabelas + policies por `auth.uid()` em `usuarios` e acesso autenticado nas demais.
  - Migração documentada em `backend/sql/migracao_rls.sql`.
- **Validação:** 50 testes passando + smoke E2E real **8/8** com RLS ativo.

### 1.2. Bug: consultas `.maybe_single()` com HTTP 500
- **Causa:** `execute()` retorna `None` quando não há registro → `AttributeError`.
- **Correção:** helper `_extrair_data()` em `base_repository`, `usuario_repository` e `auth_service` + testes de regressão.

## 2. Novas funcionalidades (frontend)

- **Tela escura (dark mode)** e **Guia passo a passo** — botões **ocultos** até serem habilitados pela **engrenagem (⚙️)** no cabeçalho. Escolha persistida em `localStorage`.
- **Fundo da tela de login** — imagem de fundo somente no login (3 versões testadas; **final: ConsultaFácil.jpeg**), proporção `auto 100%`.
- **Up Visual** — removidos os **cards de valores monetários** (Receita efetivada/perdida); ficou só métricas de agenda/comparecimento.

## 3. Relatório técnico

- `RELATORIO_TECNICO_SESSAO.pdf` gerado na raiz: o que foi feito, por que, o que foi corrigido e o que causou, testes, commits e pendências.

## 4. Commits de 08/09/2026

| Hash | Hora | Descrição |
|------|------|-----------|
| `907a5e1` | 14:12 | feat(ui): fundo final da tela de login (ConsultaFácil) |
| `8f223af` | 13:39 | feat(ui): fundo na tela de login e remoção de valores monetários do Up Visual |
| `df25636` | 13:39 | feat(ui): tela escura (dark mode) + guia passo a passo com toggle de ferramentas |
| `2f3a609` | 13:39 | feat(backend): acesso de dados via service role + migração RLS no Supabase |
| `b24af55` | 10:27 | fix(backend): consultas .maybe_single não quebram com 500 quando registro inexistente |

> Todos enviados ao GitHub (branch `integracao-pi2`).

## 5. Estado atual

- **Backend:** service role para dados · RLS habilitado no banco · 50 testes passando.
- **Frontend:** menu, dark mode, guia, fundo de login, Up Visual sem valores; typecheck e build OK.
- **Banco:** RLS em 7 tabelas com policies.
- **PR #1** aberto em `CarlosPWI/agendaSaude` aguardando merge para autodeploy.

## 6. Pendências

- **Deploy:** merge do PR #1 em `main`; reativar backend no Render (suspenso) + envs; redeploy Vercel; `Site URL` do Supabase para produção.
- **Brevo:** remetente "oficial" verificado.
- **Up Visual:** provisório (dados mock) — integrar com dados reais ou remover.
- **Acesso Vercel:** autorização do Carlos (membro do time) para publicar via CLI, se necessário.

---
*Documento gerado ao final da sessão (checkpoint).*