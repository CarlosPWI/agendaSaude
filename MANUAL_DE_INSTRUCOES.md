# 📘 Manual de Instruções — Agenda Saúde

> Sistema web de agendamento de atendimentos (Projeto Integrador — PI2).
> Este manual descreve **todas as funções do aplicativo hoje** e como usá-las.

---

## 1. Visão geral

| Item | Descrição |
|------|-----------|
| **Nome** | Agenda Saúde |
| **Stack** | Backend FastAPI + Python · Banco Supabase (PostgreSQL) · Frontend React + Vite + Tailwind |
| **Acesso local** | Frontend `http://localhost:5173` · Backend `http://localhost:8001` |
| **Produção** | Frontend na Vercel · Backend em host Python · Supabase (banco/auth) |

**Perfis de acesso:** o cadastro define o tipo de usuário (ex.: agente de saúde,
administrador). Todas as telas de dados exigem login.

---

## 2. Primeiros passos

### 2.1 Fazer login
1. Acesse a tela inicial (**Login**).
2. Informe **e-mail** e **senha**.
3. Clique em **Entrar**.
   - É necessário ter o **e-mail confirmado** no Supabase.
   - Em caso de erro, aparece uma mensagem na tela.

### 2.2 Criar conta
1. Na tela de login, clique em **Criar conta**.
2. Preencha nome, e-mail, senha (mínimo 6 caracteres), confirmação e **tipo de
   usuário**.
3. Após o cadastro, **confirme o e-mail** e faça login.

### 2.3 Esqueci minha senha
1. Na tela de login, clique em **Esqueci minha senha**.
2. Informe o e-mail e aguarde o link de recuperação.
3. Abra o link, defina a nova senha e faça login com ela.

### 2.4 Sair
- No cabeçalho, clique em **Sair**. A sessão é encerrada e você volta ao login.

---

## 3. Navegação (menu)

O menu principal fica no topo (desktop) e num **menu lateral** (celular, ícone
☰). Itens:

- **Planner** — agenda do dia/semana/mês.
- **Consultas** — lista completa de agendamentos.
- **Novo Agendamento** — criar uma consulta.
- **Pacientes** — cadastro e consulta de pacientes.
- **Agentes** — agentes comunitários.
- **Up Visual** — painel analítico e de perda primária.

**Ferramentas (engrenagem ⚙️ no cabeçalho):** liga/desliga os botões extras
**Tela escura** e **Guia**. A preferência fica salva no navegador.

---

## 4. Planner (agenda)

A tela inicial após o login. Mostra os agendamentos e as ocupações de agenda.

### 4.1 Visões
- **Visualização Diária** — grade de **30 em 30 min**, das **08:00 às 18:00**.
- **Visualização Semanal** — 7 cartões (Dom–Sáb).
- **Visualização Mensal** — grade do mês; clique num dia para abrir a visão
  diária.

### 4.2 Navegação
- **‹ / ›** avança ou volta (1 dia, 1 semana ou 1 mês, conforme a visão).
- **Hoje** volta para a data atual.
- O cabeçalho mostra a data/período e, se houver, o **feriado** (🎌).

### 4.3 Feriados
- Botão **"Feriados: ativado/desativado"**: mostra ou oculta os feriados
  nacionais (fixos + Carnaval, Sexta-feira Santa e Corpus Christi, calculados
  por ano).

### 4.4 Buscar e exportar
- **Buscar paciente na agenda** — filtra por nome nas visões diária/semanal/
  mensal.
- **Exportar CSV** — baixa os agendamentos da visão atual (Data, Horário,
  Paciente, Status).

### 4.5 Ocupar um horário (Reunião / Grupo / Bloqueio)
Em qualquer horário **livre**:
1. Clique em **📅 Reunião**, **👥 Grupo** ou **🔒 Bloquear**.
2. No popup, preencha **Tipo**, **Título** e **Observações** (opcional).
3. Clique em **Salvar ocupação**. O horário fica colorido e **bloqueia novos
   agendamentos** naquele slot.

### 4.6 Liberar um horário
- No card da ocupação, clique em **🔓 Liberar** e **confirme**. O horário volta
  a ficar livre.

### 4.7 Alterar status de um agendamento
- No card do agendamento, use o seletor de **status** (Agendado, Confirmado,
  Realizado, Cancelado, Faltou, etc.). A mudança é salva na hora.
- O botão **Alterar** abre a tela de reagendamento.

---

## 5. Consultas

Lista todos os agendamentos com filtros e ferramentas de acompanhamento.

### 5.1 Indicadores
- Cartões de resumo no topo (total, realizados, faltas, cancelamentos etc.).

### 5.2 Filtros
- **Data Inicial / Data Final**, **Paciente** (nome) e **Status**
  (Todos / Realizados / Pendentes). Use **Limpar Filtros** para resetar.

### 5.3 Colunas da tabela
- ID, Paciente, Data, Horário, **Status**, **Comparecimento** e
  **Risco de falta**.
- **Histórico** — abre a trilha de auditoria (quem criou/alterou/cancelou e
  quando).
- **Reagendar** — abre a tela de alteração do agendamento.
- **Cancelar** — pede confirmação; o registro fica no histórico como cancelado
  e o horário é liberado.

### 5.4 Risco de falta (gamificado)
- Selo de pontos por consulta: base **10**, **+20 por cancelamento**,
  **+30 por falta**, limite **100**.
- Faixas: **Baixo** (0–39), **Médio** (40–69), **Alto** (70–100).
- Botão **"Risco"** explica as regras.
- Quando o risco é ≥ 40, aparece **"contato feito?"** para marcar que o
  paciente foi avisado (fica salvo no navegador).

### 5.5 Encaixe (substituir por falta)
- Em consultas com status de **falta** (`Faltou`/`Expirado`), aparece o botão
  **Encaixar**.
- Escolha outro paciente: o sistema **cancela o faltoso** (libera o horário) e
  **cria o encaixe** no mesmo horário.

---

## 6. Novo Agendamento

1. Menu **Novo Agendamento**.
2. Selecione **Paciente** e **Status**.
3. Escolha **Data** e **Horário** (30 min).
4. (Opcional) Informe **E-mail** e **WhatsApp** de contato:
   - E-mail: validado quando preenchido.
   - WhatsApp: **DDD (2) + 9 números** (máscara `(DD) 99999-9999`).
5. (Opcional) **Observações** (até 250 caracteres).
6. Clique em **Criar Agendamento**.

**Regras:**
- Não é permitido agendar no passado.
- Horário deve ser em ponto ou meia hora (`:00` / `:30`).
- O sistema **bloqueia conflito** com outro agendamento ou com uma ocupação
  (reunião/grupo/bloqueio).
- Ao criar, um **e-mail de confirmação** é enviado (quando o e-mail está
  configurado no agendamento ou no cadastro do paciente).

Atalho: **Criar Paciente** no topo da tela.

---

## 7. Pacientes

### 7.1 Listar e filtrar
- Filtros por **Nome**, **Nº SUS** e **Status** (Ativos/Inativos).

### 7.2 Novo paciente
Menu **Pacientes → Novo Paciente**. Campos:
- **Agente Comunitário** (obrigatório)
- **Nome Completo** (obrigatório)
- **Número do SUS** (obrigatório)
- **Data de Nascimento** (obrigatória)
- **E-mail** (obrigatório — usado nas notificações)
- **Telefone** (opcional, com máscara)
- **Status** (Ativo/Inativo)
- **Observações**

### 7.3 Editar paciente
- Na lista, clique em **Editar**. Altera os dados (exceto exclusão — não há
  ação de excluir na tela).

---

## 8. Agentes Comunitários

- **Listar/buscar** por nome.
- **Novo Agente** — cadastra o nome do agente.
- **Editar nome** — altera o nome de um agente existente.
- A lista mostra quantos **pacientes** estão vinculados a cada agente.

---

## 9. Up Visual (painel analítico)

### 9.1 Perda Primária (dados reais)
- Painel **"Faltas & Perda Primária"** com botões de período (7 dias / 30 dias /
  Mês).
- KPIs: marcados, compareceram, no-show, cancelados, **taxa de absenteísmo** e
  **horas perdidas** (cada consulta = 30 min).
- Gráficos: barras por dia, rosca de motivos e funil.
- Mapeamento de status: `Realizado` = compareceu · `Faltou`/`Expirado` =
  no-show · `Cancelado` = cancelamento.

### 9.2 Calendário de ocupação e insights
- Calendário de ocupação por dia e insights analíticos.
- ⚠️ **Atenção:** parte deste painel ainda usa **dados de demonstração
  (mock provisório)**; apenas o painel de Perda Primária usa dados reais.

---

## 10. Reagendar consulta

1. Em **Consultas**, clique em **Reagendar** (ou **Alterar** no Planner).
2. Ajuste **Paciente**, **Status**, **Data**, **Horário** e **Observações**.
3. Salve. As mesmas regras de conflito/horário do Novo Agendamento valem aqui.

---

## 11. Regras de negócio (resumo)

- **Horário de atendimento:** 08:00–18:00, slots de **30 min**.
- **Duração padrão:** 30 min.
- **Fusos:** datas tratadas em UTC de ponta a ponta; exibidas no fuso local.
- **Conflitos:** não permite sobrepor agendamento nem ocupação de agenda.
- **Cancelamento (soft delete):** o agendamento não é apagado; recebe status
  cancelado, sai do horário e permanece no histórico.
- **Auditoria:** toda criação/alteração/cancelamento registra usuário e horário.
- **Lembretes:** e-mail de confirmação na criação e lembrete ~24h antes
  (rotina Brevo).

---

## 12. Segurança e sessão

- Todas as rotas de dados exigem **token** (Supabase Auth).
- A sessão é renovada automaticamente quando expira.
- `login` e `register` têm **limite de tentativas** (rate limit).
- Exclusão de conta remove o perfil e a conta de autenticação.

---

## 13. Acessibilidade e preferências

- Campos com rótulos associados e mensagens de erro anunciáveis.
- Foco visível ao navegar por teclado.
- **Tela escura** e **Guia passo a passo** (ative em ⚙️ Ferramentas).
- Layout responsivo: menu lateral no celular; agenda mensal com rolagem
  horizontal.

---

## 14. Solução de problemas

| Situação | O que fazer |
|----------|-------------|
| "E-mail ou senha incorretos" | Confirme o e-mail no Supabase e revise a senha. |
| Não consigo agendar num horário | Pode haver agendamento/ocupação; verifique o slot ou libere a ocupação. |
| "Não é permitido agendamento em horário passado" | Escolha uma data/hora futura. |
| E-mail de confirmação não chegou | Confira a caixa de spam; verifique o e-mail do paciente/agendamento. |
| Tela em branco / erro | Recarregue; o app mostra uma tela de erro amigável. |
| Sessão expirada | Faça login novamente. |

---

## 15. Para desenvolvedores

### 15.1 Rodar localmente
```bash
# Backend
cd backend
source venv/bin/activate
uvicorn src.main:app --reload --port 8001

# Frontend
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8001" > .env.local
npm run dev            # http://localhost:5173
```

### 15.2 Testes e build
```bash
cd backend  && venv/bin/python -m pytest -q      # testes do backend
cd frontend && npm test                          # validadores + risco
cd frontend && npm run typecheck                 # TypeScript
cd frontend && npm run build                     # build de produção
```

### 15.3 Migrações (SQL Editor do Supabase)
- `backend/sql/migracao_soft_delete.sql`
- `backend/sql/migracao_auditoria.sql`
- `backend/sql/migracao_ocupacoes.sql`
- `backend/sql/migracao_ocupacoes_observacoes.sql`
- `backend/sql/migracao_rls.sql`
- `backend/sql/migracao_agendamento_contato.sql` (e-mail/WhatsApp no agendamento)

### 15.4 Principais endpoints da API
| Método | Rota | Função |
|--------|------|--------|
| POST | `/auth/login` · `/auth/register` · `/auth/refresh` | Autenticação |
| POST | `/auth/forgot-password` · `/auth/reset-password` | Recuperação de senha |
| GET/POST/PUT/DELETE | `/agendamentos/` | Agendamentos |
| GET | `/agendamentos/{id}/auditoria` | Histórico/auditoria |
| GET/POST/PUT/DELETE | `/pacientes/` | Pacientes |
| GET/POST/PUT/DELETE | `/agentescomunitarios/` | Agentes |
| GET | `/statusagendamento/` | Status disponíveis |
| GET/POST/DELETE | `/ocupacoes/` | Ocupações de agenda |
| GET | `/dashboard/perda-primaria?inicio=&fim=` | Perda primária |
| GET | `/health` | Saúde do serviço |

### 15.5 Documentação interativa
- Com o backend rodando: **`http://localhost:8001/docs`** (Swagger).

---

*Manual gerado em 10/09/2026. Projeto acadêmico, sem fins comerciais.*
