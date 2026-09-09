# 📅 Sistema de Agendamento Online — agendaSaude

Sistema web de agendamento de atendimentos (Projeto Integrador — Ciência de Dados / Engenharia de Sistemas / TI).

## 🚀 Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python + FastAPI + Pydantic |
| Banco | Supabase (PostgreSQL em nuvem) + Auth |
| Frontend | React 18 + TypeScript + Vite + Tailwind (shadcn/ui) |

## 📂 Estrutura

```
agendaSaude/
├── backend/
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── src/
│   │   ├── main.py                # app FastAPI + CORS + handler de erros
│   │   ├── config/                # database (Supabase) + dependencies (auth)
│   │   ├── controllers/           # rotas (FastAPI)
│   │   ├── services/              # regras de negócio
│   │   ├── repositories/          # acesso ao Supabase
│   │   ├── schemas/               # Pydantic
│   │   ├── exceptions/            # ValidationException
│   │   └── utils/                 # response, validators, rate_limit
│   ├── sql/                       # migrações (soft delete, timestamptz)
│   └── tests/                     # pytest + fakes (sem rede)
└── frontend/
    └── src/app/
        ├── pages/                 # Login, Planner, Consultas, Pacientes...
        ├── services/              # agendamentoService (contrato da API)
        ├── types/                 # Agendamento
        ├── constants/             # horários disponíveis
        └── components/            # layout + ui (shadcn)
```

## ⚙️ Como executar

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install pytest                 # para rodar os testes

# .env com as variáveis abaixo
cp .env.example .env

uvicorn src.main:app --reload
```

Variáveis de ambiente (`backend/.env`):

```
SUPABASE_URL=...
SUPABASE_KEY=...
# Necessária para o DELETE /usuarios/{id} remover a conta do Supabase Auth:
SUPABASE_SERVICE_ROLE_KEY=...
# Usada no link de recuperação de senha:
FRONTEND_URL=http://localhost:5173
# Opcional — origens permitidas no CORS (separadas por vírgula):
CORS_ORIGINS=http://localhost:5173,https://agenda-saude-omega.vercel.app
# Opcional — rate limit compartilhado entre instâncias (sem ela, usa memória):
# REDIS_URL=redis://localhost:6379/0
```

### Frontend

```bash
cd frontend
npm install          # ou pnpm install (pnpm-lock.yaml)
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev          # http://localhost:5173
npm run build        # typecheck (tsc) + build de produção
```

## 🧪 Testes

```bash
cd backend
python -m pytest tests -q
```

A suíte usa fakes e roda sem conexão com o Supabase (39 testes cobrindo auth, agendamento, paciente, usuário e rate limit).

## 🚀 Produção

Arquitetura: **frontend na Vercel** (`agenda-saude-omega.vercel.app`) + **backend FastAPI num host (Render/Railway/Fly.io)** + **Supabase** como banco/auth.

### Backend (Render / Railway / Fly.io)

1. Crie o serviço apontando para `backend/` (Python 3.12+, comando: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`).
2. Defina as variáveis de ambiente **reais** (referência em `backend/.env.production.example`):
   - `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL=https://agenda-saude-omega.vercel.app`
   - `CORS_ORIGINS=https://agenda-saude-omega.vercel.app` (sem localhost)
3. Garanta que as migrações foram aplicadas (SQL Editor do Supabase):
   - `sql/migracao_soft_delete.sql` e `sql/migracao_auditoria.sql`.

### Frontend (Vercel)

1. Importe a pasta `frontend/` na Vercel (framework Vite, build `npm run build`, output `dist`).
2. O arquivo `vercel.json` já cobre as rotas do SPA (refresh/direct link em `/dashboard/consultas`, etc.).
3. No dashboard da Vercel, defina a variável de ambiente:
   - `VITE_API_URL` = URL pública do backend (ex.: `https://api-agendasaude.onrender.com`)
4. **Nunca** exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend.

### Supabase (produção)

- Em **Authentication → URL Configuration**: `Site URL` = `https://agenda-saude-omega.vercel.app` e mantenha `http://localhost:5173/reset-password` + a URL de produção em **Redirect URLs**.
- Para e-mail real de recuperação, configure **SMTP** (Authentication → SMTP) ou confie no provedor padrão.

### Checklist de verificação

1. `curl https://<seu-backend>/health` → `{"status":"healthy"}`
2. Acessar `https://agenda-saude-omega.vercel.app` → fazer login → navegar (menu Planner/Consultas/Pacientes/Agentes).
3. Testar "Esqueci minha senha" e "Histórico" de um agendamento.

## 🗄️ Banco de dados (Supabase)

1. Crie o projeto no Supabase e configure as credenciais no `.env`.
2. Tabelas: `usuarios`, `tiposusuarios`, `agentescomunitarios`, `pacientes`, `statusagendamento`, `agendamentos`, `agendamentos_auditoria`.
3. Autenticação: os usuários são criados no **Supabase Auth**; a tabela `usuarios` guarda o perfil (a coluna `usuario_id` é o `auth.uid()`).
4. Execute as migrações (SQL Editor do Supabase):
   - `backend/sql/migracao_soft_delete.sql` (adiciona `cancelado`, converte horários para `timestamptz`);
   - `backend/sql/migracao_auditoria.sql` (trilha de quem criou/alterou/cancelou agendamentos).
5. Verifique se está tudo aplicado: `cd backend && venv/bin/python scripts/verificar_migracoes.py`

> **Importante:** os horários são tratados em UTC de ponta a ponta. As colunas `data_hora_inicio` e `data_hora_fim` de `agendamentos` devem ser `timestamptz`.

### Recuperação de senha (configuração no Supabase)

No dashboard do Supabase, em **Authentication → URL Configuration**, adicione
`http://localhost:5173/reset-password` (e o equivalente de produção) em
**Redirect URLs**. O link do e-mail aponta para `FRONTEND_URL/reset-password`.

## 🔐 Segurança (implementado)

- Todas as rotas de dados exigem `Bearer token` (Supabase Auth).
- `/auth/login` e `/auth/register` têm rate limit (5 tentativas/min por IP; em Redis quando `REDIS_URL` está configurada).
- Cadastro de usuários pela tela `/register` (lista os tipos de usuário via `GET /tiposusuarios/`, rota pública read-only); login exige e-mail confirmado no Supabase.
- Recuperação de senha: `/auth/forgot-password` (e-mail com link) e `/auth/reset-password`; frontend em `/forgot-password` e `/reset-password`.
- Sessão renovada automaticamente pelo frontend via `/auth/refresh` quando o JWT expira.
- Exclusão de conta remove a linha de `usuarios` **e** a conta no Supabase Auth (requer `SUPABASE_SERVICE_ROLE_KEY`).
- Erros padronizados via handler global (`{success, message, errors}`).
- CORS configurável por variável de ambiente.
- Soft delete de agendamentos (cancelamento mantém histórico e libera o horário).
- Trilha de auditoria: toda criação, alteração e cancelamento de agendamento registra quem fez e quando (`GET /agendamentos/{id}/auditoria`).

## 📄 Licença

Projeto acadêmico, sem fins comerciais.
