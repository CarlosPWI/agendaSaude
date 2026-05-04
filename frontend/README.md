# Sistema de Agendamentos (Psicologia)

Este projeto é um sistema de agendamentos focado em um profissional de psicologia. O front-end em React + TypeScript está preparado para ser integrado posteriormente a uma API Python/Flask.

## Estrutura de Diretórios

A estrutura do projeto foi simplificada para conter apenas as páginas e componentes essenciais:

```
src/
├── app/
│   ├── components/
│   │   ├── AttendanceStats.tsx     # Estatísticas de comparecimento
│   │   ├── DashboardLayout.tsx     # Layout principal com a barra de navegação
│   │   └── ui/                     # Componentes base (shadcn/ui)
│   ├── data/
│   │   └── mockData.ts             # Dados simulados (Mock) para o Service Layer
│   ├── pages/
│   │   ├── LoginPage.tsx           # Página de autenticação
│   │   ├── PlannerPage.tsx         # Dashboard / Visualização diária e semanal
│   │   ├── AppointmentsPage.tsx    # Listagem de todas as consultas (filtro e cancelamento)
│   │   ├── NewAppointmentPage.tsx  # Formulário para novo agendamento
│   │   └── ReschedulePage.tsx      # Formulário para reagendar consulta existente
│   ├── services/
│   │   └── agendamentoService.ts   # Camada de abstração assíncrona (Service Layer)
│   ├── App.tsx                     # Ponto de entrada do React Router
│   └── routes.tsx                  # Definição das rotas principais
├── styles/
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
└── vite.config.ts
```

## Funcionalidades e Rotas

As páginas desnecessárias (Dashboard Analítico e Busca de Horários Vagos) foram excluídas do projeto para manter o foco na gestão de agenda de uma única profissional. O sistema agora conta com uma interface personalizada ("Portal do Profissional") com saudação direta.

- `/` - **LoginPage**: Autenticação do sistema, contendo título personalizado para o portal.
- `/dashboard` - **PlannerPage**: Rota principal que exibe o calendário diário e semanal de consultas. Conta com navegação inteligente por intervalo de datas (avança/retrocede dias ou semanas completas com base na visualização ativa).
- `/dashboard/consultas` - **AppointmentsPage**: Tabela com todas as consultas, com opções de filtro, e botão para cancelamento e reagendamento.
- `/dashboard/novo-agendamento` - **NewAppointmentPage**: Cadastro de uma nova sessão de psicologia. Recebe os dados do paciente, data e horário.
- `/dashboard/reagendar/:id` - **ReschedulePage**: Alteração de uma sessão existente, modificando apenas sua data e horário.

## Integração com Back-end (Service Layer)

Os componentes não acessam mais os dados mockados diretamente. O arquivo `agendamentoService.ts` implementa funções assíncronas (com retorno encapsulado em `Promise` e delay simulado via `setTimeout`). Essa arquitetura permitirá uma transição transparente quando os endpoints da API (Python/Flask) estiverem disponíveis, exigindo apenas a alteração dos métodos de mock para chamadas `fetch` ou `axios`.

Consulte o arquivo `MAPA_DE_ACOES.md` para entender as interações da interface e as chamadas ao Service Layer detalhadamente.
