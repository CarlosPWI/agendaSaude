# Agenda Saúde - Portal do Profissional

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Funcionalidades](#funcionalidades)
5. [Páginas da Aplicação](#páginas-da-aplicação)
6. [Componentes](#componentes)
7. [Dados e Modelos](#dados-e-modelos)
8. [Rotas](#rotas)
9. [Instalação e Execução](#instalação-e-execução)
10. [Código Fonte](#código-fonte)

---

## 🎯 Visão Geral

Sistema completo de gerenciamento de agendas focado em uma única profissional de Psicologia ("Portal do Profissional"). A aplicação oferece gestão simplificada de sessões, planner visual interativo e histórico/status duplo de comparecimento. Preparado para integração com backend Python/Flask.

### Principais Características:
- ✅ Tela de login personalizada
- ✅ Filtros avançados (período, nome do paciente, status)
- ✅ Controle duplo de status (agendamento + comparecimento)
- ✅ Planner visual (dia/semana) com navegação inteligente
- ✅ Sistema de agendamento, reagendamento e cancelamento

---

## 🛠️ Tecnologias Utilizadas

### Frontend Framework
- **React** 18+ com TypeScript
- **React Router** para navegação
- **Vite** como bundler

### UI/Componentes
- **Tailwind CSS** v4.0 para estilização
- **shadcn/ui** para componentes UI
- **Lucide React** para ícones

### Notificações
- **Sonner** para toasts/notificações

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── pages/                          # Páginas da aplicação
│   │   ├── LoginPage.tsx              # Tela de autenticação
│   │   ├── AppointmentsPage.tsx       # Listagem de consultas
│   │   ├── NewAppointmentPage.tsx     # Criação de agendamento de sessão
│   │   ├── ReschedulePage.tsx         # Reagendamento de sessão
│   │   └── PlannerPage.tsx            # Planner diário/semanal
│   │
│   ├── components/                     # Componentes reutilizáveis
│   │   ├── DashboardLayout.tsx        # Layout do dashboard
│   │   ├── AttendanceStats.tsx        # Cards de estatísticas
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx
│   │   └── ui/                        # Componentes shadcn/ui
│   │
│   ├── data/
│   │   └── mockData.ts                # Dados de exemplo
│   │
│   ├── routes.tsx                      # Configuração de rotas
│   └── App.tsx                         # Componente raiz
│
└── styles/
    ├── fonts.css                       # Importações de fontes
    └── theme.css                       # Tokens do Tailwind v4
```

---

## ⚡ Funcionalidades

### 1. Autenticação
- Tela de login com saudação ("Agenda Saúde - Portal do Profissional")
- Navegação para o dashboard após autenticação

### 2. Gestão de Sessões
- **Visualização em lista**: Todas as sessões em uma tabela
- **Filtros avançados**:
  - Período (data inicial e final)
  - Nome do Paciente
  - Status de comparecimento

### 3. Status de Controle

#### Status de Agendamento:
- **Agendado**: Sessão marcada, aguardando realização
- **Concluído**: Sessão já realizada
- **Cancelado**: Sessão cancelada

#### Status de Comparecimento:
- **Realizado**: Paciente compareceu
- **Não Realizado**: Paciente faltou
- **Pendente**: Aguardando data da sessão

### 4. Operações
- ✅ Novo agendamento de sessão
- ✅ Reagendamento de sessões
- ✅ Cancelamento de sessões

### 5. Planner Visual
- **Visualização Diária**: Grade horária de sessões
- **Visualização Semanal**: Calendário com 7 dias e cards de agendamentos
- **Navegação**: Anterior/Próximo (Avança/Retrocede 1 dia ou 7 dias conforme a visualização)/Hoje
- **Cores por status**: Visual intuitivo para facilitar gestão

---

## 📄 Páginas da Aplicação

### 1. LoginPage (`/`)
**Arquivo**: `src/app/pages/LoginPage.tsx`

Tela inicial de autenticação do sistema.

**Ação**: Redireciona para `/dashboard` após login

---

### 2. AppointmentsPage (`/dashboard/consultas`)
**Arquivo**: `src/app/pages/AppointmentsPage.tsx`

Listagem completa de sessões e histórico de comparecimento.

**Recursos**:
- Tabela completa de sessões
- Filtros avançados de busca
- Estatísticas de comparecimento
- Ações: Reagendar e Cancelar
- Navegação: Voltar para o Planner

---

### 3. NewAppointmentPage (`/dashboard/novo-agendamento`)
**Arquivo**: `src/app/pages/NewAppointmentPage.tsx`

Formulário para agendar novas sessões de psicologia.

**Campos**:
- Nome do Paciente
- Data
- Horário

---

### 4. ReschedulePage (`/dashboard/reagendar/:id`)
**Arquivo**: `src/app/pages/ReschedulePage.tsx`

Formulário para reagendar sessões existentes.

**Recursos**:
- Exibe informações atuais
- Permite alterar data e horário

---

### 5. PlannerPage (`/dashboard`)
**Arquivo**: `src/app/pages/PlannerPage.tsx`

Visualização de planner interativo.

**Tabs**:
1. **Visualização Diária**: Grade de sessões no dia
2. **Visualização Semanal**: Visão panorâmica dos dias da semana

**Recursos**:
- Navegação entre datas com textos dinâmicos (Dia vs Período da Semana)
- Novo Agendamento pelo cabeçalho
- Cores visuais e status de presença

---

## 🧩 Componentes

### DashboardLayout
**Arquivo**: `src/app/components/DashboardLayout.tsx`

Layout principal com saudação ('Olá, Dra. [Nome]').

---

### AttendanceStats
**Arquivo**: `src/app/components/AttendanceStats.tsx`

Cards com métricas de comparecimento.

---

## 💾 Dados e Modelos

### Agendamento (Interface)
**Arquivo**: `src/app/data/mockData.ts`

```typescript
export interface Agendamento {
  id: string;
  patientId: string;
  patientName: string;
  date: string;              // Formato: "YYYY-MM-DD"
  time: string;              // Formato: "HH:MM"
  status: "agendado" | "concluído" | "cancelado";
  attended: boolean;         // true = realizado, false = não realizado
}
```

---

## 🛣️ Rotas

**Arquivo**: `src/app/routes.tsx`

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | LoginPage | Tela de login |
| `/dashboard` | PlannerPage | Planner interativo diário/semanal |
| `/dashboard/consultas` | AppointmentsPage | Listagem completa de sessões |
| `/dashboard/novo-agendamento` | NewAppointmentPage | Novo agendamento |
| `/dashboard/reagendar/:id` | ReschedulePage | Reagendamento de sessão |

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- pnpm (gerenciador de pacotes)

### Preparação do Ambiente
O projeto agora utiliza variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

**Última atualização**: Abril 2026
**Versão**: 1.0.0