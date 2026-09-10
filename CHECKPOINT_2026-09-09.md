# Checkpoint — Sessão 09/09/2026

> **Equipe agenda Saúde — PI2**
> Resumo do que foi feito por último. Branch: `integracao-pi2` (PR #1).
> Commit: `458204e`.

## 1. Ocupações de agenda (bloquear/liberar + tipos)

- Nova tabela `agenda_ocupacoes` (reunião/grupo/bloqueio, 30 min) + RLS.
- Rotas autenticadas: `GET/POST/DELETE /ocupacoes`.
- Conflito: criar agendamento em horário com ocupação → 409.
- Planner: grade de **30 em 30 min** (08:00–18:00); botões **📅 Reunião · 👥 Grupo · 🔒 Bloquear** sempre visíveis nos horários livres; card colorido com **🔓 Liberar**.
- **Popup estilo Google Agenda** ao clicar nos botões: **Título** + **Observações** (persistidas em coluna nova, exibidas no card).

## 2. Consultas de 30 minutos

- Backend aceita `:00` e `:30`; duração de **30 min** (antes 1h). Ajustado schema, service, conflito e testes.

## 3. Perda Primária (absenteísmo) — dados REAIS

- Endpoint `GET /dashboard/perda-primaria?inicio=&fim=` agrega `agendamentos` + status:
  - KPIs (marcados, compareceu, no-show, cancelados, taxa de absenteísmo, horas perdidas)
  - série diária, motivos e funil.
- Painel real **"Faltas & Perda Primária"** no **Up Visual** (barras por dia + rosca de motivos + KPIs, com botões 7/30 dias/Mês).
- Mapeamento de status: `Realizado`=compareceu · `Faltou`/`Expirado`=no-show · `Cancelado`=cancelamento.

## 4. Risco gamificado (operador)

- Botão **"Risco"** em Consultas com legenda de pontos (base 10, +20/cancelamento, +30/falta, máx 100; faixas baixo/médio/alto).
- Coluna **"Risco de falta"** por consulta + ação **"contato feito?"** (marca e persiste em `localStorage`).

## 5. Encaixe (Substituir por Encaixe)

- Em Consultas, status de **falta** → botão verde **"Encaixar"**: escolhe outro paciente e o app **cancela o faltoso (libera) e cria o encaixe no mesmo horário**.

## 6. Feriados dinâmicos

- `constants/feriados.ts` agora calcula **Carnaval, Sexta-feira Santa e Corpus Christi** pela Páscoa (algoritmo de Meeus), por ano — não fixo em 2026. Exibido no Planner (selo no dia e 🎌 na semana).

## 7. Lembrete Brevo (D-1)

- `backend/scripts/enviar_lembretes.py`: envia lembrete ~24h antes para consultas Agendado/Confirmado com e-mail, com **cache anti-duplicidade**. Para automatizar: agendar via cron/Render.

## 8. Outros

- Guia com **destaque visual** (spotlight no elemento real); dark mode; fundo de login; menu; listagens.
- **CI**: `.github/workflows/ci.yml` (pytest backend + tsc/build frontend a cada push/PR).

## 9. Validação

- **54 testes pytest** passando · `tsc --noEmit` OK · `npm run build` OK.
- E2E real: ocupação criada/liberada, conflito 409, consulta 30 min, observações salvas, endpoint de perda primária com dados reais.

## 10. Pendências

- **CI**: só roda após o push (já enviado); considera que o repositório é o do Carlos — conferir que o Actions está habilitado.
- **Produção**: merge do PR #1 em `main`; Render suspenso + envs; Vercel autorização; `Site URL` do Supabase; cron do lembrete no Render.
- **Up Visual**: o restante do painel (abaixo do real) ainda é **mock provisório** — remover é passo separado.
- **Evoluções**: modelo médico/UBS, exclusão de pacientes/agentes com regras, lembrete via agendador embutido.

---
*Documento gerado ao final da sessão (checkpoint).*
