# Agenda Saúde — Portal do Profissional

Sistema web de gestão de sessões voltado para profissionais de saúde. Permite criar, visualizar, reagendar, cancelar e registrar o comparecimento de pacientes, com um painel visual de estatísticas em tempo real.

> **Estado atual:** front-end completo com persistência via Mock API (cache em memória). A arquitetura do `agendamentoService.ts` já está preparada para substituição por chamadas HTTP a um back-end real.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Estilização | Tailwind CSS v4 |
| Componentes UI | shadcn/ui + Radix UI |
| Ícones | Lucide React |
| Roteamento | React Router v7 |
| Notificações | Sonner |

---

## Funcionalidades

### Planner visual (`/dashboard`)
Tela inicial do dashboard após o login. Exibe os agendamentos em dois modos de visualização, alternáveis por abas:

- **Visualização Diária** — grade horária de 08h00 às 18h30 (intervalos de 30 min), com cada sessão do dia renderizada no seu respectivo slot. Horários livres são indicados visualmente.
- **Visualização Semanal** — grade de 7 dias a partir da data selecionada, com os agendamentos distribuídos por coluna de dia.
- Navegação entre datas com botões Anterior / Próximo, que avançam 1 dia ou 1 semana inteira conforme a aba ativa.
- Botão "Novo Agendamento" de acesso rápido no cabeçalho.

### Listagem de consultas (`/dashboard/consultas`)
Tabela completa de todos os agendamentos, com filtros combinados:

- Filtro por período (data inicial e data final)
- Busca por nome do paciente (texto livre)
- Filtro por status (todos / atendidos / não atendidos)
- Botão para limpar filtros ativos

Cada linha exibe: ID, nome e ID do paciente, data, horário, status da sessão e badge de comparecimento. Quando a sessão possui observações registradas, um trecho é exibido abaixo do nome do paciente (com tooltip para o texto completo).

### Criação de agendamento (`/dashboard/novo-agendamento`)
Formulário com os seguintes campos de entrada de texto livre:

- Nome do paciente
- Data (seletor de data nativo, bloqueado para datas passadas)
- Horário (seletor de hora nativo)
- Observações sobre a sessão (campo de texto multilinha, opcional)

Ao confirmar, um ID de paciente é gerado automaticamente e a sessão entra na lista com status `agendado`.

### Reagendamento (`/dashboard/reagendar/:id`)
Formulário que exibe as informações atuais da sessão (paciente, data e horário) e permite alterar:

- Nova data
- Novo horário
- Observações sobre a sessão (campo de texto multilinha, opcional)

### Ações disponíveis na tabela de consultas
Para sessões com status `agendado`, três botões de ação ficam disponíveis:

- **Concluir** — abre um diálogo de confirmação com duas opções: registrar comparecimento ("Sim, compareceu") ou registrar falta ("Não, o paciente faltou"). Atualiza o status para `concluído` e o campo `attended` conforme a escolha.
- **Reagendar** — navega para o formulário de reagendamento da sessão.
- **Cancelar** — abre diálogo de confirmação e marca o status como `cancelado`, mantendo o registro no histórico.

Para qualquer sessão (independente do status), um botão de lixeira permite a **exclusão definitiva** do registro, com diálogo de confirmação.

### Painel de estatísticas (`AttendanceStats`)
Exibido na página de listagem de consultas. Cinco cards calculados em tempo real a partir dos dados filtrados:

- Total de consultas
- Sessões realizadas (paciente compareceu)
- Sessões não realizadas (paciente faltou)
- Sessões agendadas (pendentes)
- Taxa de comparecimento (%)

---

## Arquitetura do serviço

Toda comunicação com dados passa pelo arquivo `src/app/services/agendamentoService.ts`, que expõe funções assíncronas:

```
fetchAgendamentos()
fetchAgendamentoById(id)
createAgendamento(payload)
updateAgendamento(id, updates)
cancelAgendamento(id)
concluirAgendamento(id, attended)
deleteAgendamento(id)
```

Hoje essas funções operam sobre um cache em memória com delay simulado. Para integrar ao back-end, basta substituir o corpo de cada função por uma chamada `fetch` apontando para `VITE_API_URL`, sem alterar nenhum componente React.

---

## Estrutura de pastas

```
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── PlannerPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── NewAppointmentPage.tsx
│   │   └── ReschedulePage.tsx
│   ├── components/
│   │   ├── DashboardLayout.tsx
│   │   ├── AttendanceStats.tsx
│   │   └── ui/               # Componentes shadcn/ui
│   ├── data/
│   │   └── mockData.ts       # Interface Agendamento + dados iniciais
│   └── services/
│       └── agendamentoService.ts
└── styles/
    ├── index.css
    ├── tailwind.css
    └── theme.css             # Tokens Tailwind CSS v4
```

### Mapa de rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `LoginPage` | Tela de autenticação |
| `/dashboard` | `PlannerPage` | Planner diário/semanal |
| `/dashboard/consultas` | `AppointmentsPage` | Listagem e filtros |
| `/dashboard/novo-agendamento` | `NewAppointmentPage` | Criar sessão |
| `/dashboard/reagendar/:id` | `ReschedulePage` | Editar sessão |

---

## Como rodar o projeto

### Pré-requisitos

- Node.js 18 ou superior
- npm (ou pnpm)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/CarlosPWI/agendaSaude
cd agendaSaude

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Login

A tela de login não valida credenciais neste estágio. Basta preencher qualquer e-mail e qualquer senha (ambos obrigatórios) e clicar em **Entrar**.

### Variável de ambiente (opcional)

Para apontar para um back-end real quando ele estiver disponível, crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000
```

Sem essa variável, o serviço opera inteiramente em memória.

---

## Interface `Agendamento`

```typescript
export interface Agendamento {
  id: string;
  patientId: string;
  patientName: string;
  date: string;         // "YYYY-MM-DD"
  time: string;         // "HH:MM"
  status: "agendado" | "concluído" | "cancelado";
  attended: boolean;    // true = compareceu, false = faltou ou pendente
  observacoes?: string; // campo opcional de texto livre
}
```

---

## Licença

Projeto desenvolvido para fins acadêmicos, sem fins comerciais.
