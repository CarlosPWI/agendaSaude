# Checkpoint — Sessão 10/09/2026

> **Equipe agenda Saúde — PI2**
> Resumo do que foi feito nesta sessão (evoluções de UX, acessibilidade, mobile,
> contato no agendamento e correções). Branch: `integracao-pi2` (PR #1).
> Commit anterior: `b6c7458`.

## 1. Feriados nacionais com opção de exibir/ocultar

- Botão **"Feriados: ativado/desativado"** no Planner (`PlannerPage.tsx`).
- Quando ligado, mostra o selo do feriado no dia (🎌) e na semana; quando
  desligado, oculta. Respeita também a visão mensal.

## 2. Visualização mensal no Planner

- Nova aba **"Visualização Mensal"** com grade Dom–Sáb.
- Cada dia: número, destaque de "hoje", feriado (respeitando o toggle) e até
  3 agendamentos com status (`+N mais`).
- Clicar num dia seleciona e abre a visão diária; setas navegam por mês.

## 3. E-mail e WhatsApp no Novo Agendamento

- Campos **E-mail** (validação de formato) e **WhatsApp** (DDD + 9 números = 11
  dígitos, com máscara `(DD) 99999-9999`).
- Persistidos no próprio agendamento: migration
  `backend/sql/migracao_agendamento_contato.sql` (colunas `email`/`whatsapp`),
  schema Pydantic e response.
- Lembrete Brevo agora **prioriza o e-mail do agendamento** e cai para o do
  paciente.

## 4. Quick wins de usabilidade

- **Confirmação antes de liberar horário** ocupado (Planner) com `AlertDialog`.
- **Cancelamento de consulta** com botão travado durante o envio; `fetch` cru
  trocado por `apiFetch` (refresh de token).
- **Skeletons de carregamento** (`ListSkeleton`) em Planner, Consultas,
  Pacientes e Agentes.
- **Rota 404** (`NotFoundPage`) + **ErrorBoundary** global
  (`RouteErrorBoundary`).
- **Erro inline com "Tentar novamente"** nas listas (antes falha parecia
  "lista vazia").

## 5. Acessibilidade

- `htmlFor`/`id`, `aria-invalid`/`aria-describedby`, `role="alert"` nos
  formulários (Novo Agendamento, Paciente, Editar Paciente, Reagendar, Agente).
- `aria-label` em botões só-ícone (chevrons do Planner, engrenagem, sair, menu).
- Foco visível global em `styles/index.css`.

## 6. Mobile

- **Menu hambúrguer** com drawer (`Sheet`) no `DashboardLayout`; navegação
  horizontal agora só no desktop.
- **Agenda mensal** com scroll horizontal e células menores no celular.

## 7. Ferramentas

- **Busca por paciente** no Planner (dia/semana/mês).
- **Exportar CSV** da visualização atual (dia/semana/mês).
- **Validadores/máscaras centralizados** em `utils/validators.ts`.
- Correção do **cálculo de risco**: as faltas ("Faltou"/"Expirado") passam a
  contar no score (antes só cancelamentos somavam).

## 8. Consistência

- Corrigidas classes inválidas `dark:dark:` (`UpVisualPage`, `OcupacaoCalendar`).
- Toaster (sonner) deixa de depender de `next-themes` e acompanha a classe
  `dark` do app.

## 9. Mocks de faltas/cancelamentos (dados de teste)

- Inseridos 9 agendamentos marcados com `observacoes = '[MOCK] ...'`
  (ids 27–35) para exercitar risco, faltas e cancelamentos.
- Cenários: João Pedro (2 faltas + 1 cancelamento → alto), Ana Clara (1 falta →
  médio), Lucas (1 cancelamento → baixo) e Samuel (2 faltas já existentes →
  alto).
- **Limpeza:** `delete from agendamentos where observacoes like '[MOCK]%';`

## 10. Validação

- **Backend:** 64 testes pytest passando.
- **Frontend:** 17 testes (validadores + risco) via `npm test`; `tsc --noEmit`
  e `npm run build` OK.
- App rodando local: backend `:8001`, frontend `:5173`.

## 11. Pendências

- **Up Visual:** o restante do painel (abaixo do painel real de Perda Primária)
  continua **mock provisório** (`services/upVisualData.ts`) — substituir exige
  campos que não existem no backend (médico, especialidade, valor, distância).
- **Unificar** `NewPatientPage`/`EditPatientPage` num componente único.
- **Recorrência** de agendamentos e **testes e2e** (Playwright).
- **Produção:** merge do PR #1 em `main`; conferir envs (Render/Vercel/Supabase)
  e cron do lembrete.

---
*Documento gerado ao final da sessão (checkpoint).*
