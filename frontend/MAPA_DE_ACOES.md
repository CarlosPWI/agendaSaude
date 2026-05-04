# Mapa de Ações

Este documento descreve as interações na UI do sistema de agenda, os componentes que as acionam, as funções chamadas no Service Layer e o comportamento esperado.

## 1. Carregar Agendamentos (Planner e Lista de Consultas)
- **Componentes:** `PlannerPage`, `AppointmentsPage`
- **Gatilho:** `useEffect` no carregamento da página.
- **Service Layer:** `fetchAgendamentos()`
- **Comportamento Esperado:** Exibe a lista/planner de agendamentos armazenados em memória (ou na futura API), refletindo um delay simulado de 500ms. O estado local é populado com os dados recebidos.

## 2. Salvar Novo Agendamento
- **Componente:** `NewAppointmentPage`
- **Gatilho:** Submissão do formulário ("Confirmar Agendamento").
- **Service Layer:** `createAgendamento(payload)`
- **Payload:**
  ```json
  {
    "patientId": "GERADO_ALEATORIAMENTE",
    "patientName": "Nome do Paciente",
    "date": "2026-05-15",
    "time": "14:30"
  }
  ```
- **Comportamento Esperado:**
  - UI de carregamento: Botão exibe "Salvando..." e fica desabilitado.
  - Sucesso: Um toast de sucesso aparece informando o agendamento e o usuário é redirecionado para a tela `/dashboard`.
  - Erro: Toast de erro é exibido se houver falha.

## 3. Filtrar Consultas
- **Componente:** `AppointmentsPage`
- **Gatilho:** Alteração de valor nos inputs (Data Inicial, Data Final, Nome do Paciente, Status).
- **Service Layer:** N/A (Filtro local com base no array existente).
- **Comportamento Esperado:** A tabela é atualizada instantaneamente para refletir apenas os agendamentos que correspondem aos critérios passados através do `useMemo`.

## 4. Reagendar Consulta
- **Componente:** `ReschedulePage`
- **Gatilho 1 (Carregar):** Abertura da página - chama `fetchAgendamentoById(id)` no Service Layer para preencher a data e horário atuais.
- **Gatilho 2 (Salvar):** Submissão do formulário - chama `updateAgendamento(id, updates)`.
- **Payload:**
  ```json
  {
    "date": "2026-05-20",
    "time": "10:00"
  }
  ```
- **Comportamento Esperado:**
  - Carregando: Texto de loading antes do formulário aparecer.
  - Salvando: Botão desabilita e mostra estado "Salvando...".
  - Sucesso: Toast de sucesso aparece e redireciona para `/dashboard`.

## 5. Cancelar Consulta
- **Componente:** `AppointmentsPage`
- **Gatilho:** Clicar no botão "Cancelar" na tabela e confirmar a modal.
- **Service Layer:** `cancelAgendamento(id)`
- **Comportamento Esperado:** O registro do agendamento tem o status atualizado para "cancelado". Em seguida, o componente recarrega a listagem `loadAppointments()` e exibe um toast de sucesso confirmando a operação.

## 6. Navegação entre Abas (Visualização Diária/Semanal)
- **Componente:** `PlannerPage`
- **Gatilho:** Clicar nas abas do topo.
- **Service Layer:** N/A (Calculado localmente sobre os dados da memória).
- **Comportamento Esperado:** Alterna entre mostrar a listagem de horários e a grade semanal com base nos cálculos de data, renderizando cards ou slots vazios quando não há agendamentos. Ao alterar a aba, a lógica dos botões de navegação do calendário se adapta: avançar/retroceder 1 dia na Visualização Diária, ou avançar/retroceder 7 dias na Visualização Semanal, atualizando o texto da data conforme a visualização.

## 7. Novo Agendamento pelo Planner
- **Componente:** `PlannerPage`
- **Gatilho:** Clicar no botão "Novo Agendamento" no cabeçalho.
- **Service Layer:** N/A (Apenas navegação).
- **Comportamento Esperado:** O usuário é redirecionado para a rota `/dashboard/novo-agendamento` para realizar um novo registro de consulta.

---

## Contrato de API Esperado (Integração com Python/Flask)

Para a substituição total dos mock data, o back-end em Flask deve implementar as seguintes rotas RESTful para lidar com as chamadas no `agendamentoService.ts`:

### 1. `GET /api/agendamentos`
- **Responsabilidade:** Retornar a lista completa de sessões (ou filtrada por data/paciente caso haja querystrings na API final).
- **Service Layer Function:** `fetchAgendamentos()`
- **Response Base:** Array de objetos `{ id, patientId, patientName, date, time, status, attended }`.

### 2. `GET /api/agendamentos/:id`
- **Responsabilidade:** Retornar detalhes de uma sessão específica pelo seu ID.
- **Service Layer Function:** `fetchAgendamentoById(id)`
- **Response Base:** Um único objeto contendo os detalhes do agendamento.

### 3. `POST /api/agendamentos`
- **Responsabilidade:** Criar uma nova sessão e agendá-la para a profissional. O corpo da requisição enviará os dados mínimos essenciais.
- **Service Layer Function:** `createAgendamento(payload)`
- **Body Esperado:** `{ patientId, patientName, date, time }`
- **Ação no Backend:** Gerar um ID único (UUID), definir o status inicial como `"agendado"` e `attended` como `false`.

### 4. `PUT /api/agendamentos/:id`
- **Responsabilidade:** Atualizar parcial ou totalmente as informações de uma sessão (utilizado primariamente no reagendamento de datas e horários).
- **Service Layer Function:** `updateAgendamento(id, updates)`
- **Body Esperado:** `{ date, time }` ou demais campos modificados.

### 5. `PUT /api/agendamentos/:id/cancel` (ou rota similar)
- **Responsabilidade:** Marcar a sessão como cancelada (soft-delete ou atualização de status).
- **Service Layer Function:** `cancelAgendamento(id)`
- **Ação no Backend:** Modificar o campo `status` do agendamento respectivo para `"cancelado"`.
