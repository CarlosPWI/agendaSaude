# Checkpoint — Sessão 07/09/2026

> **Equipe agenda Saúde — PI2**
> Documento de checkpoint (commit `0995436` na branch `integracao-pi2`, PR #1).

## 1. Resumo da sessão

Sessão focada em encerrar as pendências estruturais do sistema, corrigir bugs
descobertos em testes de integração e elevar a maturidade de produto (navegação,
listagens, trilha de auditoria e notificação por e-mail). Suíte de testes saltou
de 17 para **47 casos**; typecheck e build aprovados; integração contra o Supabase
real validada; envio real via Brevo confirmado.

## 2. Pendências estruturais resolvidas

| # | Pendência | Solução |
|---|-----------|---------|
| P1 | A-6 — exclusão não removia do Supabase Auth | Cliente service-role + `admin.delete_user()`; guard de FK (400) quando há agendamentos |
| P2 | Sessão sem renovação | `POST /auth/refresh`; frontend `apiFetch` com refresh automático (single-flight) |
| P3 | Sem recuperação de senha | `forgot-password`/`reset-password` + telas `/forgot-password` e `/reset-password` |
| P4 | Sem trilha de auditoria | Tabela `agendamentos_auditoria` + registro em criar/alterar/cancelar + endpoint de leitura |
| P5 | Rate limit só em memória | `RedisRateLimiter` (INCR+EXPIRE) com fallback em memória |

## 3. Bugs descobertos nos testes E2E (e corrigidos)

- Leitura da auditoria retornava vazio: `embed` PostgREST sem FK → resolvido por consulta separada de nomes.
- `DELETE /usuarios/{id}` com agendamentos → HTTP 500 (FK) → convertido em 400 claro.
- `/pacientes` e `/agentescomunitarios` sem barra final → 307; services passaram a usar a URL canônica.
- CSS Tailwind v4: ordem de `@import` (fonts vazio + tw-animate-css após `@source`) quebrava o stylesheet no dev → `index.css`/`tailwind.css` corrigidos.

## 4. Novas telas / componentes

- Menu de navegação no dashboard (pills) — Planner, Consultas, Novo Agendamento, Pacientes, Agentes.
- `PacientesPage` (listagem + filtros) e `AgentesComunitariosPage` (listagem + renomear).
- Botão e diálogo **Histórico** (auditoria) em Consultas.
- E-mail obrigatório do paciente com validação visível (novo/editar).
- Notificação de confirmação de agendamento por e-mail (**Brevo**).

## 5. Banco de dados (Supabase)

- Migração `migracao_soft_delete.sql` aplicada (`agendamentos.cancelado`).
- Migração `migracao_auditoria.sql` aplicada (`agendamentos_auditoria`).
- Verificação: `backend/scripts/verificar_migracoes.py` → OK.

## 6. Validação

- `pytest`: **47 passed**.
- `tsc --noEmit`: OK · `npm run build`: OK.
- E2E real (Supabase): cadastro → login → refresh → CRUD agendamento → auditoria → cancelamento → A-6.
- Brevo: e-mail transacional real recebido.

## 7. Arquivos-chave (backend)

- `config/database.py` (cliente service-role), `services/auth_service.py`,
  `services/usuario_service.py`, `services/agendamento_service.py`,
  `services/notificacao_service.py` (novo), `repositories/agendamento_auditoria_repository.py` (novo),
  `utils/rate_limit.py`, `schemas/paciente_schema.py`, `sql/migracao_auditoria.sql`,
  `requirements.txt`, `scripts/verificar_migracoes.py`, `scripts/testar_brevo.py`.

## 8. Arquivos-chave (frontend)

- `services/apiClient.ts` (novo), `services/pacienteService.ts`/`agenteService.ts` (novos),
  `pages/ForgotPasswordPage.tsx`/`ResetPasswordPage.tsx`/`PacientesPage.tsx`/`AgentesComunitariosPage.tsx` (novos),
  `components/DashboardLayout.tsx`, `routes.tsx`, `pages/AppointmentsPage.tsx`,
  `pages/NewPatientPage.tsx`/`EditPatientPage.tsx`, `styles/index.css`, `styles/tailwind.css`,
  `vercel.json`.

## 9. Commits da branch `integracao-pi2`

| Hash | Mensagem |
|------|----------|
| `0995436` | fix(ui): restyle do menu e correção de ordem de @import no CSS Tailwind v4 |
| `b7428e8` | feat: entrega equipe agenda Saúde PI2 — pendências estruturais, novas telas, auditoria e notificações via Brevo |

## 10. Pendências remanescentes

- Publicar: push para GitHub concluído via PR #1; aguarda **merge em `main`** para autodeploy.
- Render: reativar serviço suspenso e ajustar envs (`SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`, `CORS_ORIGINS`).
- Vercel: redeploy do frontend (após merge).
- Supabase: trocar `Site URL` para o domínio de produção.
- Brevo: definir remetente "oficial" verificado (hoje usa e-mail pessoal).
- Evoluções: lembretes automáticos, exclusão de pacientes/agentes com regras, telas administrativas.

---

## 11. Nova tela "Up Visual" (Inteligência & Performance) — ⚠️ PROVISÓRIO

> **Status: experimental/demonstração — pode ser REMOVIDA ou MODIFICADA** sem
> impacto nas demais telas. Foi solicitada como prova de conceito de um
> dashboard analítico (bento grid) com cruzamento de agendamentos, perfil de
> pacientes e impacto financeiro.

### O que foi feito (commit)
- Botão **"Up Visual"** no menu do dashboard (rota `/dashboard/inteligencia`).
- **Mini-calendário de ocupação** (heatmap mensal): cores por taxa de ocupação
  (<50% esmeralda · 50–89% âmbar · ≥90% rose). Clique no dia → filtra KPIs,
  gráficos e lista de risco para aquele dia.
- **Barra sticky de filtros**: Período (mês/hoje), Médico, Especialidade.
- **KPIs**: agendamentos, % comparecimento, receita efetivada, receita perdida
  (cancelamentos+faltas × ticket) e taxa de falta.
- **Gráficos** (Recharts): sazonalidade (faltas vs. comparecimentos por dia da
  semana / por horário) e rosca de engajamento por faixa etária.
- **Insights dinâmicos** (ex.: alerta de sextas após 16h → sugerir lista de
  espera/confirmação dupla).
- **Risco de no-show**: pacientes com score alto (faltas recentes, distância)
  e ação rápida **WhatsApp**.

### Arquivos
- `frontend/src/app/pages/UpVisualPage.tsx` (nova)
- `frontend/src/app/components/upvisual/OcupacaoCalendar.tsx` (nova)
- `frontend/src/app/services/upVisualData.ts` (novo — dados mock determinísticos + insights)
- `frontend/src/app/routes.tsx` (rota `inteligencia`)
- `frontend/src/app/components/DashboardLayout.tsx` (item "Up Visual")

### Observações / pendências da tela
- **Dados 100% mock** (determinísticos). Para produção, integrar com a API real
  mantendo as interfaces de `upVisualData.ts`.
- Cruzamentos completos do escopo original (distância × CEP via dispersão,
  modal com lista nominal + WhatsApp, variação percentual em tooltip) ainda não
  foram todos implementados — apenas versões resumidas.
- Como é provisória, **não foi conectada a dados reais nem incluída em rotas de
  menu críticas**; pode ser removida seguindo as instruções no cabeçalho do
  arquivo da página.

---
*Documento gerado automaticamente ao final da sessão (checkpoint).*
