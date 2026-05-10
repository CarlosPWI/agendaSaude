# 🏥 Agenda Saúde - Sistema de Gestão de Consultas

O **Agenda Saúde** é uma aplicação web moderna desenvolvida para facilitar o agendamento e a gestão de consultas em clínicas e consultórios. O foco principal é oferecer uma interface intuitiva para profissionais de saúde, permitindo o controlo total do fluxo de atendimento e a preservação do histórico de dados para análises estatísticas.

## 🚀 Funcionalidades Principais

- **Gestão Completa de Agendamentos (CRUD):** Criação, edição, visualização e remoção de consultas.
- **Fluxo de Atendimento Avançado:**
  - **Check-in Automático:** Registo de presença do paciente para atualização de estatísticas.
  - **Cancelamento com Histórico:** Diferente da exclusão, o cancelamento mantém o registo para análise de taxas de desistência.
- **Painel de Estatísticas (Dashboard):** Visualização rápida da taxa de comparecimento e volume de consultas.
- **Notas de Sessão:** Campo de observações integrado na criação e edição de agendamentos para registo de queixas ou lembretes.
- **Filtros Dinâmicos:** Pesquisa por período de datas, nome do paciente e status da consulta.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React.js](https://reactjs.org/) com [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/UI](https://ui.shadcn.com/) (AlertDialog, Table, Cards, Inputs)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Notificações:** [Sonner](https://sonner.emilkowal.ski/)
- **Mock API:** Sistema de cache local para simulação de backend.

## 📦 Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-colega/agenda-saude-frontend.git](https://github.com/seu-colega/agenda-saude-frontend.git)


   Aceda à pasta do projeto:

Bash
cd agenda-saude-frontend
Instale as dependências:

Bash
npm install
Inicie o servidor de desenvolvimento:

Bash
npm run dev
Aceda no navegador:
http://localhost:5173

📑 Estrutura de Pastas
Plaintext
src/
 ├── app/
 │    ├── pages/      # Ecrãs principais (Dashboard, Agendamentos, Edição)
 │    ├── components/ # Componentes reutilizáveis (UI, Tabelas, Gráficos)
 │    ├── services/   # Lógica de comunicação com a API/Mock
 │    └── data/       # Definição de tipos e dados de teste (Mocks)
 └── assets/          # Estilos globais e imagens
