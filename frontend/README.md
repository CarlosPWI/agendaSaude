# 🏥 Agenda Saúde

> Aplicação web moderna para agendamento e gestão de consultas em clínicas e consultórios.

---

## 📋 Sobre o Projeto

O **Agenda Saúde** foi desenvolvido com foco na **integridade dos dados históricos**, possibilitando análises estatísticas precisas e o mapeamento do comportamento dos pacientes ao longo do tempo.

A aplicação oferece um fluxo completo de gestão de consultas — criação, edição, visualização e remoção — com recursos avançados que vão além do simples agendamento.

---

## ✨ Funcionalidades

### 📅 Gestão de Agendamentos
- Criação, edição e visualização de consultas
- Filtros dinâmicos por **período de datas**, **nome do paciente** e **status de comparecimento**

### ✅ Check-in Avançado
Registra diretamente na tabela se o paciente **compareceu ou faltou**, alimentando automaticamente as métricas do painel de controle.

### 🔴 Cancelar vs. Excluir — Uma distinção estratégica

| Ação | Comportamento | Finalidade |
|---|---|---|
| **Cancelar** | Altera o status para *cancelado*, mantendo o registro no banco | Análise de taxas de desistência e retenção |
| **Excluir** | Remove o dado definitivamente | Correção de erros reais de lançamento |

### 📝 Notas de Sessão
- Inserção de observações em texto livre na criação ou no reagendamento
- Notas exibidas diretamente na tabela principal, logo abaixo do nome do paciente
- Leitura rápida e discreta para a equipe da clínica

### 📊 Painel de Controle
- Métricas alimentadas automaticamente pelo check-in
- Visão consolidada do comportamento dos pacientes

---

## 🛠️ Stack Técnica

### Frontend
| Tecnologia | Uso |
|---|---|
| [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Interface e tipagem |
| [Vite](https://vitejs.dev/) | Build e performance de carregamento |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização utilitária |
| [Shadcn UI](https://ui.shadcn.com/) | Componentes de interface |
| [Lucide React](https://lucide.dev/) | Iconografia |
| [Sonner](https://sonner.emilkowal.ski/) | Alertas visuais flutuantes (toasts) |

### Dados (atual)
- **Mock API** com sistema de **cache local** para simular comunicação com servidor

### Backend (planejado)
- **Python** com **Flask** ou **FastAPI**
- Banco de dados **SQL**

---

## 🗺️ Próximos Passos

- [ ] Implementação do backend em Python (Flask ou FastAPI)
- [ ] Integração com banco de dados SQL real
- [ ] Substituição dos campos de texto livre por **menus suspensos dinâmicos** para seleção de pacientes cadastrados
- [ ] Sistema de **autenticação e controle de acesso**

---

## 🏗️ Arquitetura

A arquitetura de serviços e roteamento já foi projetada para facilitar a **migração da Mock API para um backend real**, sem necessidade de reestruturação significativa do frontend.

```
agenda-saude/
├── src/
│   ├── components/       # Componentes reutilizáveis (UI)
│   ├── pages/            # Telas da aplicação
│   ├── services/         # Camada de serviços (Mock API → Backend)
│   └── types/            # Tipagens TypeScript
├── public/
└── ...
```

---

## 🚀 Como Executar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/agenda-saude.git

# Instale as dependências
cd agenda-saude
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:5173`

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
