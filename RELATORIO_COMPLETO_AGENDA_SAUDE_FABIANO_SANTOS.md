# RELATÓRIO COMPLETO — agendaSaude

**Projeto:** Sistema de Agendamento Online de Saúde (agendaSaude)
**Autor do relatório:** Fabiano Santos
**Data:** 13/08/2026
**Stack:** Backend FastAPI (Python 3.14) + Supabase (PostgreSQL/Auth) | Frontend React 18 + TypeScript + Vite 6 + Tailwind (shadcn/ui)

---

## SUMÁRIO

1. [Resumo Executivo](#1-resumo-executivo)
2. [Diagnóstico original](#2-diagnóstico-original)
3. [O que foi corrigido — Fase 1 (Bloqueadores)](#3-o-que-foi-corrigido--fase-1-bloqueadores)
4. [O que foi corrigido — Fase 2 (Estabilidade)](#4-o-que-foi-corrigido--fase-2-estabilidade)
5. [O que foi corrigido — Fase 3 (Qualidade e Segurança)](#5-o-que-foi-corrigido--fase-3-qualidade-e-segurança)
6. [O que foi implementado de novo](#6-o-que-foi-implementado-de-novo)
7. [Mapeamento completo: contramedidas e impacto potencial](#7-mapeamento-completo-contramedidas-e-impacto-potencial)
8. [Estrutura atual do projeto](#8-estrutura-atual-do-projeto)
9. [Estado da validação (testes, typecheck, build)](#9-estado-da-validação)
10. [PASSO A PASSO — Configuração no Supabase](#10-passo-a-passo--configuração-no-supabase)
11. [PASSO A PASSO — Execução local e produção](#11-passo-a-passo--execução-local-e-produção)
12. [Checklist de teste manual de ponta a ponta](#12-checklist-de-teste-manual-de-ponta-a-ponta)
13. [Pendências documentadas](#13-pendências-documentadas)

---

## 1. Resumo Executivo

O sistema foi recebido com **6 bugs críticos, 7 altos, 8 médios e ~14 de baixa severidade**, tornando-o **não funcional de ponta a ponta**: cadastro quebrado (endpoint chamava método inexistente), rotas sem autenticação, frontend com contrato divergente da API (página de consultas inoperante), token de login nunca salvo, e horários com fuso horário inconsistente.

Após o trabalho executado (3 fases + rodada final), o sistema está:

| Aspecto | Antes | Depois |
|---|---|---|
| Cadastro de usuário | 500 (método inexistente) | Funcional, com validação e página própria |
| Autenticação nas rotas | Decorativa (rotas abertas) | Todas protegidas, 401 sem token |
| Login | Token nunca salvo, erro genérico | Salva token, mensagens claras (401/403) |
| Contrato frontend × API | Divergente (página inoperante) | Mapeamento único e testado |
| Fuso horário | Ambíguo (naive/UTC) | UTC ponta a ponta no backend, local no frontend |
| Cancelamento de agendamento | Deletava o registro | Soft delete (mantém histórico) |
| Testes automatizados | 0 | 17 testes passando |
| TypeScript | Sem typecheck no build | `tsc --noEmit` integrado |
| Segurança | Sem rate limit, CORS fixo, erros crus | Rate limit, CORS por env, erros padronizados |
| Tela de cadastro | Não existia | `/register` completa |

---

## 2. Diagnóstico Original

### 2.1 Bugs críticos (C)
| ID | Problema | Impacto |
|---|---|---|
| C-1 | `/auth/register` chamava `AuthService.register` inexistente | Cadastro impossível (500) |
| C-2 | Rotas de dados sem `Depends(get_current_user)` | Qualquer pessoa acessava todos os dados |
| C-3 | Diálogo órfão em `AppointmentsPage` (referência a componente removido) | Build quebrava |
| C-4 | Contrato divergente (`data_hora` vs `data_hora_inicio`) | Página de consultas inoperante |
| C-5 | Login nunca salvava o token (campo errado `data.token`) | Sessão não persistia |
| C-6 | `get_me` sem parâmetro vazava a lista de usuários | Exposição de todos os e-mails |

### 2.2 Altos (A)
- A-1: Sem guard de rota e logout incompleto (dados vazavam entre sessões)
- A-2: Fuso horário inconsistente (backend local vs UTC)
- A-3: `data[0]` sem checagem → IndexError em respostas vazias
- A-4: Módulo JWT quebrado (`jwt.encode` com payload string → 500 em toda rota)
- A-5: Login com usuário sem linha na tabela `usuarios` → 500 genérico
- A-6: `DELETE /usuarios/{id}` não remove o usuário do Supabase Auth
- A-7: Validação de horário duplicada e divergente (schema + service)

### 2.3 Médios (M)
- M-1: `exclude={"criado_em", "data_hora_fim"}` incorreto no update de agendamento
- M-2: Acessos inseguros a `response.data` nos repositórios
- M-3: Dois AlertDialog de cancelamento duplicados com promessa UX falsa (backend deletava)
- M-4: Payloads de criação com campos errados (`data`, `hora`)
- M-5: `toISOString()` no ReschedulePage ignorava o fuso local
- M-6: CORS hardcoded
- M-7: 403 em vez de 401 quando token ausente
- M-8: Erros inconsistentes entre rotas (handler cru vs `{"success": false}`)

### 2.4 Baixos (L)
- L-1: `console.log` sensíveis (dados de usuários/agentes)
- L-2/L-8: Código morto (`src/models/`, `jwt_handler.py`, `api.ts`)
- L-3: README desatualizado
- L-4: `requirements.txt` em UTF-16 (instalação quebrava)
- L-5: `__pycache__` versionados
- L-6: Zero testes automatizados
- L-7: Sem paginação e sem rate limit
- L-9: Horários hardcoded em 3 páginas
- L-10/L-11: Campo fantasma `attended` + `cancelled` fora do contrato
- L-13: `tsconfig.json` não incluía `src/app` (typecheck não cobria o app)
- L-14: Rota `GET /usuarios/` sem sentido funcional (vazava e-mails)

---

## 3. O que foi corrigido — Fase 1 (Bloqueadores)

**Objetivo:** tornar o sistema funcional e seguro. Sem esta fase, nada rodava.

### 3.1 Backend

**C-1 — Cadastro implementado** (`src/services/auth_service.py`):
- Criado `AuthService.register(nome, email, password, tipousuario_id)`:
  - Valida existência do `tipousuario_id` (via `validar_tipousuario_existe`)
  - Exige senha mínima de 6 caracteres (400)
  - Cria o usuário no **Supabase Auth** (`supabase.auth.sign_up`)
  - Mapeia erro "already registered/exists" → **409** "E-mail já cadastrado"
  - Insere a linha na tabela `usuarios` (`usuario_id` = `auth.uid()`, `nome`, `email`, `tipousuario_id`)
  - Retorna `{user: {id, email, nome}}`

**C-2 — Todas as rotas protegidas** (`src/config/dependencies.py`):
- `HTTPBearer(auto_error=False)` → **401** quando o header não vem
- Sem usuário valido → 401 "Token inválido ou expirado"
- Proteção aplicada em: `paciente_controller`, `agendamento_controller`, `agentecomunitario_controller`, `statusagendamento_controller`, `tiposusuarios_controller` (exceto GET da listagem, ver Fase 4) e `usuario_controller`

**C-5 — Login corrigido** (`auth_service.py`):
- `supabase.auth.sign_in_with_password` com tratamento:
  - "invalid login credentials" → **401** "E-mail ou senha inválidos"
  - "email not confirmed" → **403** "E-mail ainda não confirmado..."
  - Usuário autenticado mas sem linha em `usuarios` → **403** "Usuário não cadastrado no sistema"
- Retorna `access_token`, `refresh_token` e `user`

**C-6 — `get_me` corrigido** (`usuario_repository.py` + `usuario_service.py`):
- `buscar_por_id(value)` agora usa `.eq(usuario_id, value)` + `.maybe_single()`
- `get_by_id` no controller verifica que `user["id"] == user_id` (senão 403)
- **L-14:** rota `GET /usuarios/` (listagem de todos os e-mails) **removida**; removidos também `UsuarioService.get_all` e o override `listar` do repositório

### 3.2 Frontend

**C-3 — Diálogo órfão removido** (`AppointmentsPage.tsx`):
- Removidos `concluirDialogOpen`/`setConcluirDialogOpen`/`confirmConcluir` (referenciavam componente inexistente) e o AlertDialog de cancelamento duplicado

**C-4 — Contrato unificado** (`src/app/services/agendamentoService.ts` reescrito + `src/app/types/agendamento.ts`):
- `mapAgendamento()` converte snake_case → camelCase: `agendamento_id` → `id`, `data_hora_inicio` → `date`/`time`, `data_hora_fim` → `endDate`/`endTime`, `pacientes.nome` → `patientName`, `statusagendamento.nome` → `statusNome`
- `normalizeStatus()` normaliza nomes (Realizado/Concluído/Não Realizado/Cancelado)
- `Agendamento` tipado com `status` union + `statusNome` + `statusagendamento_id`
- `PlannerPage` e demais páginas passam a consumir o formato mapeado

**C-5 — Login salva token** (`LoginPage.tsx`):
- `localStorage.setItem("token", data.access_token || data.token)`
- Guarda também o `user`/`usuario`/`data` em `localStorage.setItem("usuario", ...)` com `JSON.parse` seguro no `DashboardLayout`

**A-1 — Guard e logout** (`DashboardLayout.tsx`):
- Sem token → redireciona para `/`
- Logout limpa `token` e `usuario` do localStorage

**L-13 — Typecheck de verdade**:
- `tsconfig.json` reescrito incluindo `src/app/**/*.ts(x)` (excluindo `components/ui` — cópia do shadcn, não do app)
- `package.json`: `"build": "tsc --noEmit && vite build"` e novo script `"typecheck": "tsc --noEmit"`
- Instalados `@types/react` e `@types/react-dom`

---

## 4. O que foi corrigido — Fase 2 (Estabilidade)

**Objetivo:** eliminar erros latentes e padronizar o fluxo de dados.

### 4.1 Backend

**A-3/A-4 — Acessos seguros e JWT removido**:
- `src/repositories/base_repository.py` reescrito:
  - Acesso seguro: `response.data[0] if response.data else None`
  - `_serializer()` converte `datetime`/`date` para `isoformat()` automaticamente
  - `_to_dict()` suporta `model_dump()` e `.dict()`, com `exclude_unset=True` para updates parciais
  - `listar()` aceita `limit`/`offset`
- `src/utils/jwt_handler.py` **deletado** (era a causa do 500 em toda rota)
- `src/models/` (diretório inteiro, morto) **deletado**

**M-1 — `exclude` corrigido** (`agendamento_repository.py`):
- Update agora exclui apenas `{"criado_em"}` — `data_hora_fim` volta a ser atualizável

**M-5/A-2 — Datas UTC de ponta a ponta** (`agendamento_service.py`):
- `_normalizar_datetime()`: mantém timezone (se naive assume UTC), converte para `UTC`, trunca microssegundos
- `_validar_horario()` usa `datetime.now(timezone.utc)` (horário passado → 400)
- `_validar_conflito()` compara via `isoformat()`; no update, ignora o próprio `agendamento_id`

**A-7 — Validação única** (`agendamento_schema.py`):
- Removido `field_validator("data_hora_inicio")` do schema (duplicava o service)
- Mantido `model_validator` que calcula `data_hora_fim = inicio + 1h` quando vazio

**M-8 — Erros padronizados** (`src/main.py`):
- `@app.exception_handler(ValidationException)` global → `{success: false, message, errors}`
- Todos os controllers reescritos **sem** `try/except` local (o handler global cuida)
- `base_service.py`: removidos helpers `success_response`/`error_response`; restou apenas `now()`

**Código morto removido**:
- `frontend/src/app/services/api.ts` (duplicava o service real)

### 4.2 Frontend

**M-4 — Payloads corrigidos**:
- `NewAppointmentPage`: payload com `data_hora_inicio` (sem `data_hora_fim` no envio — o backend calcula)
- `ReschedulePage`: idem; `calcularDataHoraFim()` removida de ambas

**M-5 — Data local** (`ReschedulePage.tsx`):
- Usa `format(dataInicio, "yyyy-MM-dd")` e `format(dataInicio, "HH:mm")` (date-fns, hora local) no lugar de `toISOString()` que deslocava o fuso

---

## 5. O que foi corrigido — Fase 3 (Qualidade e Segurança)

**L-7 — Rate limit no auth** (`src/utils/rate_limit.py`):
- `MemoryRateLimiter`: **5 requisições/minuto por IP** (janela deslizante com `deque`)
- Aplicado em `/auth/login` e `/auth/register` via `Depends(limiter.check)` → **429** "Muitas tentativas..."
- (Documentado: para múltiplas instâncias, trocar por Redis no futuro)

**L-7 — Paginação**:
- `BaseRepository.listar(limit, offset)` e todos os `listar(limit=100, offset=0)` em services e controllers

**M-3 — Soft delete de agendamentos**:
- `AgendamentoRepository.cancelar(value)`: seta `{"cancelado": True, "atualizado_em": now()}`
- `buscar_conflitos()` filtra `.eq("cancelado", False)` → cancelado libera o horário
- `AgendamentoService.deletar()` → chama `cancelar()` (não remove a linha)
- Migração: `backend/sql/migracao_soft_delete.sql` (ver seção 9)
- Frontend: diálogo de cancelamento diz "O registro será mantido no histórico com status 'cancelado'"; `mapAgendamento` mapeia `cancelado: true` → `status: "cancelado"` + `statusNome: "Cancelado"`

**M-6 — CORS por env** (`src/main.py`):
- `os.getenv("CORS_ORIGINS", "https://agenda-saude-omega.vercel.app,http://localhost:5173,http://127.0.0.1:5173").split(",")`

**L-1 — `console.log` removidos** (NewPatientPage, NewAgenteComunitarioPage, ReschedulePage) — incluindo o log do agente selecionado, payload de criação e resultados de fetch

**L-9 — Horários centralizados** (`frontend/src/app/constants/horarios.ts`):
- `HORARIOS_DISPONIVEIS`: 08:00 às 18:00 (11 slots de hora em hora)
- Usado em PlannerPage, NewAppointmentPage e ReschedulePage

**L-10/L-11 — Tipos corretos**:
- Removido campo fantasma `attended` de `Agendamento`
- `AttendanceStats` reescrito com 5 cards: Total, Realizados, Agendados, Cancelados e Taxa de comparecimento

**L-2/L-3/L-4/L-5/L-6 — Limpeza e testes**:
- `README.md` reescrito por completo
- `backend/.env.example` criado
- `requirements.txt` convertido de UTF-16 para UTF-8
- `__pycache__` deletados dos diretórios versionados
- `backend/pytest.ini` + `backend/tests/conftest.py` (seta `SUPABASE_URL`/`SUPABASE_KEY` dummy) + 17 testes (ver seção 8)

---

## 6. O que foi implementado de novo

### 6.1 Fase 4 — Tela de cadastro (`/register`)
Arquivos: `frontend/src/app/pages/RegisterPage.tsx`, rota `/register` em `routes.tsx`, `LoginPage` com link "Criar conta".

- Campos: nome, e-mail, senha (mín. 6, com `minLength`), confirmação de senha, select de **tipo de usuário** (populado via `GET /tiposusuarios/`)
- Validações: senhas diferentes → mensagem local; erros 422 do Pydantic são achatados e exibidos
- Sucesso → redireciona ao login com banner verde "Conta criada com sucesso! Confirme seu e-mail antes de entrar." (via `sessionStorage`)
- Para permitir listar os tipos **antes** do login, `GET /tiposusuarios/` tornou-se público read-only (criar/editar/deletar continuam protegidos)

### 6.2 Tratamento de sessão expirada (401)
- `frontend/src/app/services/session.ts` exporta `handleUnauthorized(status)`:
  - 401 → limpa `token`/`usuario` e redireciona para `/` (se já não estiver lá)
- Aplicado em **todas** as 16 chamadas autenticadas do app:
  - `agendamentoService` (5 chamadas: listar, buscar, criar, atualizar, cancelar)
  - PlannerPage (3), NewPatientPage (2), NewAppointmentPage (3), EditPatientPage (3), NewAgenteComunitarioPage (1), ReschedulePage (4)
  - Inclui os carregamentos (pacientes/status/agentes) que antes nem checavam `response.ok`

### 6.3 Login com mensagens claras
- 401 (credenciais inválidas), 403 (e-mail não confirmado / usuário não cadastrado no sistema), 409 (e-mail duplicado no cadastro), 429 (rate limit)

---

## 7. Mapeamento completo: cada problema, sua contramedida e o que poderia causar

> Esta seção cruza o diagnóstico (seção 2) com as correções (seções 3–6): para cada problema encontrado, a **contramedida aplicada** e o **impacto real** caso não fosse corrigido.

### 7.1 Bugs críticos (C)

| Problema | Contramedida aplicada | O que poderia causar |
|---|---|---|
| **C-1** `AuthService.register` não existia (cadastro → 500) | `AuthService.register` implementado: `sign_up` no Supabase Auth + insert na tabela `usuarios`, com validações (senha mín. 6 → 400, e-mail duplicado → 409, `tipousuario_id` válido) | **Sistema sem entrada de novos usuários** — nenhum usuário conseguia se cadastrar; acoplado ao A-5, usuários criados fora do fluxo também travavam o login |
| **C-2** Rotas de dados sem `Depends(get_current_user)` | Todas as rotas protegidas com `HTTPBearer(auto_error=False)` → 401 sem token | **Vazamento total e modificação dos dados** — qualquer pessoa com a URL lia todos os pacientes, agendamentos, e-mails e agentes e podia alterar/deletar (grave violação de LGPD em dados de saúde) |
| **C-3** Diálogo órfão em `AppointmentsPage` | Dialog duplicado/órfão removido; `tsc --noEmit` integrado ao build | **Build/deploy quebrado** — impossível gerar produção; errors de tipo passavam despercebidos |
| **C-4** Contrato divergente (`data_hora` vs `data_hora_inicio`) | `mapAgendamento()` + tipos tipados em `agendamentoService`/`types/agendamento.ts` | **Página de consultas inoperante** — agendamentos renderizavam `undefined`/NaN, toasts de erro constantes; a principal tela do sistema não funcionava |
| **C-5** Login nunca salvava o token (`data.token` não existia) | Salva `data.access_token \|\| data.token` + usuário no localStorage | **Loop login ↔ dashboard** — o login "funcionava" mas o guard de rota devolvia o usuário ao login; nenhuma chamada autenticada funcionava (401 em tudo) |
| **C-6** `get_me` sem parâmetro retornava a lista inteira | `buscar_por_id` com `.eq(usuario_id, value)` + verificação de posse no controller | **Qualquer usuário logado listava todos os e-mails e nomes da plataforma** — mineração de contatos (phishing interno) |

### 7.2 Altos (A)

| Problema | Contramedida | O que poderia causar |
|---|---|---|
| **A-1** Sem guard de rota + logout incompleto | Redirect sem token + logout limpa `token`/`usuario` do localStorage | **Sessões cruzadas** — usuário B abria o app e caía na sessão/dados do usuário A na mesma máquina |
| **A-2** Fuso horário inconsistente (backend naive/UTC) | UTC ponta a ponta no backend (`_normalizar_datetime`, `timezone.utc`); `format()` hora local no frontend | **Agendamentos com hora deslocada** (ex.: 14:00 → 13:00/15:00), conflitos de horário falsos, reagendamentos e relatórios incorretos |
| **A-3** `data[0]` sem checagem | `response.data[0] if response.data else None` + `.maybe_single()` | **IndexError → 500** em buscas vazias (usuário/status inexistente) — erro técnico exposto ao cliente |
| **A-4** `jwt_handler.py` quebrado (`jwt.encode` com payload string) | Módulo deletado (autenticação real via Supabase Auth) | **500 em TODAS as rotas** — o import em cadeia derrubava a API inteira; o sistema não respondia nada |
| **A-5** Login de usuário sem linha na tabela → 500 genérico | 403 "Usuário não cadastrado no sistema" | Usuário não logava **sem qualquer explicação**; stderr cheio de tracebacks |
| **A-6** `DELETE /usuarios/{id}` não remove do Supabase Auth | Documentado (requer service role key); demais correções aplicadas | **Conta órfã** — usuário "deletado" continua autenticável no Auth e pode voltar a operar |
| **A-7** Validação de horário duplicada (schema vs service) | Validação única no service (UTC); removido `field_validator` do schema | Horários válidos rejeitados (400 falso) ou lógica divergente entre camadas — conflitos e cancelamentos inconsistentes |

### 7.3 Médios (M)

| Problema | Contramedida | O que poderia causar |
|---|---|---|
| **M-1** `exclude={"criado_em","data_hora_fim"}` | Exclude corrigido para `{"criado_em"}` | **Reagendamento sem data de fim** — conflitos de horário futuros calculados errado |
| **M-2** Acessos inseguros a `response.data` | Acesso seguro no `base_repository` + serializer ISO + `listar(limit/offset)` | IndexError intermitente em listagens vazias → telas brancas no frontend |
| **M-3** Dois diálogos de cancelamento + backend **deletava** de verdade | Soft delete (`cancelado=true`), conflito ignora cancelados, migração SQL | **Perda irreversível do histórico de agendamentos** (a mensagem prometia manter e o backend apagava) — sem auditoria |
| **M-4** Payloads com campos errados (`data`, `hora`) | Payloads reescritos com o contrato real (`data_hora_inicio`) | Criação/reagendamento sempre falhavam ou gravavam campos nulos → agenda corrupta |
| **M-5** `toISOString()` no reagendar | `format(dataInicio, "yyyy-MM-dd"/"HH:mm")` (hora local) | Horário do reagendamento deslocado 1–3 h conforme o fuso do navegador |
| **M-6** CORS fixo | `CORS_ORIGINS` via env (com default) | Origem nova (staging/outro domínio) bloqueada; toda mudança exigia edição de código + redeploy |
| **M-7** 403 quando token ausente | `HTTPBearer(auto_error=False)` → 401 | Frontend não distinguia "não autenticado" de "sem permissão"; guard de rota impreciso |
| **M-8** Erros inconsistentes entre rotas | Handler global `{success, message, errors}` em `main.py`; controllers sem try/except local | **Stack traces e detalhes de banco expostos** ao cliente; frontend tinha que parsear formatos diferentes |

### 7.4 Baixos (L)

| Problema | Contramedida | O que poderia causar |
|---|---|---|
| **L-1** `console.log` sensíveis | Removidos (agente selecionado, payloads, resultados de fetch) | **Dados de saúde/pacientes visíveis no console** em produção — qualquer um com devtools aberto |
| **L-2/L-8** Código morto (`src/models/`, `jwt_handler.py`, `api.ts`) | Diretórios/arquivos deletados | Manutenção confusa; `api.ts` duplicado divergia do service real e enganava futuros devs |
| **L-3** README desatualizado | Reescrito por completo | Projeto incompreensível para quem herda — onboarding impossível |
| **L-4** `requirements.txt` UTF-16 | Convertido para UTF-8 | **`pip install` quebrava com `UnicodeDecodeError`** → deploy do backend falhava na primeira etapa |
| **L-5** `__pycache__` versionados | Limpos | Diffs gigantes com binários; conflitos de merge |
| **L-6** Zero testes | 17 testes pytest (auth, agendamento, paciente) | Regressões silenciosas (conflito de horário, soft delete) sem nenhuma detecção |
| **L-7** Sem rate limit | `MemoryRateLimiter`: 5 req/min por IP em `/auth/login` e `/auth/register` → 429 | **Força bruta de senhas ilimitada** no login; spam de cadastros |
| **L-7b** Sem paginação | `limit`/`offset` em todas as listagens | Respostas gigantes e lentidão progressiva com o crescimento dos dados |
| **L-9** Horários hardcoded em 3 páginas | `HORARIOS_DISPONIVEIS` (08:00–18:00) em `constants/horarios.ts` | Regra de horário divergente entre as páginas (mudava num e não nos outros) |
| **L-10/L-11** Campo fantasma `attended` + `cancelled` | Tipos corrigidos; `AttendanceStats` com 5 cards reais | Estatísticas `undefined`/erradas; erros de compilação |
| **L-13** Typecheck não cobria o app | `tsconfig.json` incluindo `src/app` + `tsc --noEmit` no build | Quebras de tipo silenciosas em produção (o C-3 não teria sido pego) |
| **L-14** `GET /usuarios/` vazando e-mails | Rota removida (+ `get_all` do service e override do repositório) | Vazamento de todos os e-mails cadastrados por uma rota sem uso funcional |

### 7.5 Itens novos (Fase 4) — o que evitam

| Implementação | O que evita |
|---|---|
| Página `/register` | Usuários só poderiam ser criados manualmente via SQL — sem escalabilidade |
| `GET /tiposusuarios/` público read-only | Select de tipo de usuário vazio no cadastro (sem perfil não há conta) |
| `handleUnauthorized` nas 16 chamadas autenticadas | **Sessão expirada = tela branca/erros confusos**; agora limpa credenciais e volta ao login |
| Mensagens claras de login (401/403/409/429) | Usuário sem explicação para falhas de login (e-mail não confirmado, credenciais, duplicado) |

---

## 8. Estrutura atual do projeto

```
agendaSaude-main/
├── README.md                          # Documentação completa do projeto
├── RELATORIO_TECNICO.md               # Relatório técnico das correções
├── RELATORIO_COMPLETO_AGENDA_SAUDE_FABIANO_SANTOS.md  # Este documento
├── backend/
│   ├── requirements.txt               # UTF-8, dependências pinadas
│   ├── .env.example                   # SUPABASE_URL, SUPABASE_KEY, CORS_ORIGINS
│   ├── pytest.ini
│   ├── sql/migracao_soft_delete.sql   # Executar no SQL Editor do Supabase
│   ├── tests/
│   │   ├── conftest.py
│   │   └── services/                  # 17 testes (auth, agendamento, paciente)
│   ├── venv/                          # Ambiente virtual (Python 3.14)
│   └── src/
│       ├── main.py                    # FastAPI, CORS por env, handler global
│       ├── config/
│       │   ├── database.py            # Cliente Supabase
│       │   └── dependencies.py        # get_current_user (HTTPBearer)
│       ├── controllers/               # 7 controllers (sem try/except)
│       ├── services/                  # 8 services (regras de negócio)
│       ├── repositories/              # 7 repositórios (acesso Supabase)
│       ├── schemas/                   # Pydantic (validação)
│       ├── utils/
│       │   ├── rate_limit.py          # 5 req/min por IP
│       │   ├── response.py            # helper success()
│       │   └── validators.py          # validar_tipousuario_existe
│       └── exceptions/
│           └── validation_exception.py
└── frontend/
    ├── package.json                   # build = tsc --noEmit && vite build
    ├── tsconfig.json                  # inclui src/app
    ├── .env.local (criar)             # VITE_API_URL
    └── src/app/
        ├── routes.tsx                 # /, /register, /dashboard/*
        ├── components/                # DashboardLayout, AttendanceStats, ui/
        ├── pages/                     # 9 páginas
        ├── services/                  # agendamentoService.ts, session.ts
        ├── constants/horarios.ts      # HORARIOS_DISPONIVEIS
        └── types/agendamento.ts
```

**Colunas esperadas nas tabelas** (para conferir no Table Editor):

| Tabela | Colunas |
|---|---|
| `usuarios` | `usuario_id` (uuid = auth.uid()), `nome`, `email`, `tipousuario_id` (FK), `criado_em`, `atualizado_em` — **não deve ter `senha NOT NULL`** |
| `tiposusuarios` | `tipousuario_id` (PK serial), `nome`, `criado_em`, `atualizado_em` |
| `agentescomunitarios` | `agentecomunitario_id` (PK), `nome`, `criado_em`, `atualizado_em` |
| `pacientes` | `paciente_id` (PK), `agentecomunitario_id` (FK), `nome`, `numero_sus`, `email`, `telefone`, `data_nascimento` (date), `observacoes`, `status`, `criado_em`, `atualizado_em` |
| `statusagendamento` | `statusagendamento_id` (PK), `nome`, `criado_em`, `atualizado_em` |
| `agendamentos` | `agendamento_id` (PK), `usuario_id` (FK), `paciente_id` (FK), `statusagendamento_id` (FK), `data_hora_inicio` (**timestamptz**), `data_hora_fim` (**timestamptz**), `observacoes`, `cancelado` (bool, default false), `criado_em`, `atualizado_em` |

---

## 9. Estado da Validação

| Verificação | Comando | Resultado |
|---|---|---|
| Compilação Python | `find backend/src backend/tests -name "*.py" -print0 \| xargs -0 python3 -m py_compile` | ✅ OK |
| Testes unitários | `backend/venv/bin/python -m pytest backend/tests -q` | ✅ **17 passed** |
| Typecheck | `npx tsc --noEmit` (em `frontend/`) | ✅ OK |
| Build | `npm run build` | ✅ OK (Vite 6.4.3, ~498 kB JS / 153 kB gzip) |
| Smoke test da API | `uvicorn src.main:app --port 8100` | ✅ `/` 200, `/health` 200, `/docs` 200, rota privada sem token → **401** |

**Os 17 testes automatizados:**

`test_auth_service.py` (6):
- `test_login_credenciais_invalidas` — 401 com mensagem clara
- `test_login_sem_registro_na_tabela` — 403 "Usuário não cadastrado no sistema"
- `test_login_sucesso` — retorna access_token + user
- `test_register_senha_curta` — 400 senha mínima
- `test_register_email_ja_cadastrado` — 409 e-mail duplicado
- `test_register_sucesso` — cria no Auth + insere na tabela

`test_agendamento_service.py` (8):
- `test_criar_horario_passado` — 400 horário no passado
- `test_criar_horario_quebrado` — 400 formato inválido
- `test_criar_conflito` — 409 horário ocupado
- `test_criar_sucesso_calcula_fim` — cria e calcula `data_hora_fim`
- `test_atualizar_ignora_proprio_id_no_conflito` — reagendamento no mesmo slot não conflita
- `test_atualizar_conflito_nao_ignorado` — conflito com outro agendamento → 409
- `test_deletar_soft_delete` — `cancelado = true` em vez de remover
- `test_deletar_inexistente` — 404 agendamento não encontrado

`test_paciente_service.py` (3):
- `test_buscar_por_id_inexistente` — 404 sem IndexError
- `test_criar_agente_inexistente` — 400 agente inválido
- `test_criar_sucesso_normaliza_telefone` — telefone normalizado (regex)

> **Atualização (07/09/2026):** com a resolução das pendências da seção 13, a
> suíte cresceu para **39 testes** — novos arquivos `test_usuario_service.py`
> (delete no Auth) e `test_rate_limit.py` (memória + Redis), além de casos de
> refresh/forgot/reset em `test_auth_service.py` e auditoria em
> `test_agendamento_service.py`. `tsc --noEmit` e `npm run build` passando.

---

## 10. PASSO A PASSO — Configuração no Supabase

> ⏱️ Tempo estimado total: 15–30 min. Faça em ordem. Todos os SQLs são executados no **Dashboard → SQL Editor** (menu lateral) → colar → **Run** (botão verde).

### Passo 1 — Rodar a migração de soft delete
**Obrigatório.** Sem ela, cancelar agendamento não funciona (o código espera a coluna `cancelado` e horários em `timestamptz`).

Abra o SQL Editor, cole o conteúdo de `backend/sql/migracao_soft_delete.sql` e execute:

```sql
ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS cancelado boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'agendamentos'
      AND column_name IN ('data_hora_inicio', 'data_hora_fim')
  ) THEN
    ALTER TABLE agendamentos
      ALTER COLUMN data_hora_inicio TYPE timestamptz USING data_hora_inicio AT TIME ZONE 'UTC',
      ALTER COLUMN data_hora_fim TYPE timestamptz USING data_hora_fim AT TIME ZONE 'UTC';
  END IF;
END $$;
```

**Verificação:** no Table Editor → `agendamentos`, devem existir as colunas `cancelado` (bool) e os tipos de `data_hora_inicio`/`data_hora_fim` devem ser `timestamp with time zone`.

### Passo 2 — Corrigir a coluna `senha` em `usuarios`
**Obrigatório.** O cadastro cria o usuário no Supabase Auth (a senha fica lá, com hash) e insere na tabela `usuarios` apenas `usuario_id`, `nome`, `email`, `tipousuario_id`. Se a coluna `senha` existir com `NOT NULL` (sem default), **todo cadastro falhará com 500**.

1. Table Editor → `usuarios` → clique na coluna `senha` (se existir)
2. Se ela for `NOT NULL`, rode:
```sql
ALTER TABLE usuarios ALTER COLUMN senha DROP NOT NULL;
```
3. Se confirmar que nenhum dado antigo usa a coluna (o app nunca a leu/escreveu), pode removê-la de vez:
```sql
ALTER TABLE usuarios DROP COLUMN IF EXISTS senha;
```

**Verificação:** o fluxo de cadastro funciona (Passo 10 do checklist).

### Passo 3 — Garantir os tipos de usuário
**Obrigatório.** A tela `/register` lista os tipos via `GET /tiposusuarios/`; sem linhas, o select fica vazio e ninguém se cadastra. Ajuste os nomes/IDs conforme seu modelo original:

```sql
INSERT INTO tiposusuarios (nome) VALUES
  ('Secretaria'),
  ('Profissional de Saúde'),
  ('Agente Comunitário')
ON CONFLICT DO NOTHING;
```

**Verificação:** Table Editor → `tiposusuarios` com as linhas (anote o `tipousuario_id` de cada uma).

### Passo 4 — Garantir os status de agendamento
**Obrigatório.** `POST /agendamentos/` exige um `statusagendamento_id` válido (FK). Sem linhas, nenhum agendamento é criado:

```sql
INSERT INTO statusagendamento (nome) VALUES
  ('Agendado'),
  ('Realizado'),
  ('Não Realizado'),
  ('Cancelado')
ON CONFLICT DO NOTHING;
```

**Verificação:** Table Editor → `statusagendamento` com as 4 linhas (anote os IDs). O frontend usa os nomes "Realizado", "Não Realizado", "Cancelado" para as cores e cards do `AttendanceStats`.

### Passo 5 — Habilitar Row Level Security (RLS)
**Altamente recomendado.** Fecha o banco contra acesso direto externo (ex.: alguém usando a anon key fora do backend). O Supabase **service role key ignora RLS**, então o backend continua funcionando normalmente (desde que `SUPABASE_KEY` seja a service role — ver Passo 7).

Execute no SQL Editor:
```sql
ALTER TABLE usuarios               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiposusuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentescomunitarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE statusagendamento      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos           ENABLE ROW LEVEL SECURITY;
```

**Verificação:** Table Editor → cada tabela → botão **RLS enabled** ligado.

> ⚠️ **Importante:** só ative o RLS **depois** de garantir que o backend usa a service role key (Passo 7). Se ele usar a anon key, com RLS ligado e sem policies, **todas as rotas passam a retornar erro 403/empty**.
>
> *Alternativa (se preferir continuar com a anon key no backend):* crie policies por tabela, ex.:
> ```sql
> CREATE POLICY "backend full access" ON agendamentos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
> ```
> (repita para as outras 5 tabelas — mais frágil que a service role, pois qualquer um com a anon key teria acesso de leitura ao banco)

### Passo 6 — Decidir sobre a confirmação de e-mail
O login já trata e-mail não confirmado com **403 "E-mail ainda não confirmado. Verifique sua caixa de entrada."** Decida o comportamento:

**Opção A — Sem confirmação (mais simples para uso interno):**
1. Dashboard → Authentication → Providers → Email
2. Desative o toggle **"Confirm email"**
3. Salve

**Opção B — Com confirmação (mais seguro):**
1. Mantenha "Confirm email" ativado
2. Os usuários clicam no link recebido por e-mail antes do primeiro login
3. (Opcional) Configure **Redirect URL** (ex.: `http://localhost:5173`) para o link retornar ao app após a confirmação

### Passo 7 — Obter as chaves de API
Dashboard → Settings → API:

| Chave | Uso | Onde fica |
|---|---|---|
| `Project URL` (ex.: `https://xyz.supabase.co`) | `SUPABASE_URL` | `backend/.env` |
| `service_role` secret | `SUPABASE_KEY` (**recomendado** — combina com RLS, fica só no servidor) | `backend/.env` |
| `anon` public | alternativa à service role (se RLS desligado) | `backend/.env` |
| `JWT Secret` | não é usado diretamente pelo app | — |

⚠️ **Nunca** coloque a service role key em código do frontend (`VITE_*`) nem em repositório público.

### Passo 8 — (Opcional) Verificação de integridade das FKs
Se você criou as tabelas por fora do SQL Editor, confira que as FKs existem (senão o backend falha ao inserir):

```sql
SELECT conrelid::regclass AS tabela, conname AS constraint
FROM pg_constraint
WHERE contype = 'f'
  AND conrelid::regclass::text IN ('usuarios','pacientes','agendamentos')
ORDER BY 1;
```

Esperado (pelo menos): `usuarios.tipousuario_id` → `tiposusuarios`, `pacientes.agentecomunitario_id` → `agentescomunitarios`, `agendamentos.paciente_id` → `pacientes`, `agendamentos.usuario_id` → `usuarios`, `agendamentos.statusagendamento_id` → `statusagendamento`.

---

## 11. PASSO A PASSO — Execução local e produção

### 11.1 Ambiente local

**1) Backend — criar `backend/.env`:**
```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_KEY=<service_role ou anon key do Passo 7>
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
(Pode copiar de `.env.example`.)

**2) Frontend — criar `frontend/.env.local`:**
```env
VITE_API_URL=http://localhost:8000
```

**3) Subir o backend** (terminal 1, na pasta `backend/`):
```bash
venv/bin/uvicorn src.main:app --reload --port 8000
```
Conferir em http://localhost:8000/ → `{"status":"ok",...}` e docs em http://localhost:8000/docs

**4) Subir o frontend** (terminal 2, na pasta `frontend/`):
```bash
npm run dev
```
Abrir http://localhost:5173

### 11.2 Produção (Vercel + host do backend)

**Frontend (Vercel):**
- Settings → Environment Variables:
  - `VITE_API_URL` = URL pública do backend (ex.: `https://api-agendasaude.onrender.com`)
- Redeploy

**Backend (Render / Railway / Fly.io):**
- Variáveis de ambiente:
  - `SUPABASE_URL`, `SUPABASE_KEY` (service role)
  - `CORS_ORIGINS` = URL do Vercel (ex.: `https://agenda-saude-omega.vercel.app`) — **sem** `http://localhost:5173` em produção
- Comando: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- Build: `pip install -r requirements.txt`

**Backup antes de qualquer DDL em produção (opcional mas recomendado):**
```bash
supabase db dump --project-ref <seu-projeto> --data-only -f backup_$(date +%Y%m%d).sql
```

---

## 12. Checklist de teste manual de ponta a ponta

Depois dos Passos 1–7 do Supabase e da execução local, valide na ordem:

1. **Cadastro:** abrir `/register` → select deve listar os tipos de usuário → preencher e enviar → verificar mensagem de sucesso → conferir no Table Editor que a linha foi criada em `usuarios` (com `usuario_id` = uuid do Auth em Authentication → Users)
2. **Confirmação de e-mail:** se ativada, logar com o e-mail **não confirmado** → deve mostrar 403 "E-mail ainda não confirmado"; confirmar no e-mail e logar
3. **Senha errada:** logar com senha errada → 401 "E-mail ou senha inválidos"
4. **E-mail duplicado:** tentar cadastrar o mesmo e-mail → 409 "E-mail já cadastrado"
5. **Agente:** criar agente comunitário → redireciona para paciente
6. **Paciente:** criar paciente (nome, SUS, nascimento) → redireciona para novo agendamento
7. **Agendamento:** criar para um horário livre → aparece na agenda do dia
8. **Conflito:** criar outro para o mesmo dia/hora → deve rejeitar com mensagem de horário ocupado
9. **Reagendar:** alterar o agendamento para outro horário livre
10. **Status:** mudar o status pela agenda (Realizado / Não Realizado) → cards do topo atualizam
11. **Cancelar:** cancelar um agendamento → deve continuar na lista com status "Cancelado" e **não** sumir da agenda; o horário fica livre para novo agendamento
12. **Rate limit:** 6 logins seguidos em menos de 1 minuto → 6º retorna 429
13. **Sessão expirada:** devtools → Application → localStorage → apagar `token` → navegar → deve cair no login
14. **401 no servidor:** `curl -i http://localhost:8000/pacientes/` sem header → `401 {"detail":"Token não informado"}`

---

## 13. Pendências documentadas

> ✅ **Todas resolvidas em 07/09/2026.** Resumo do que foi feito:

| Item | Status | Detalhe |
|---|---|---|
| A-6 — delete não remove do Supabase Auth | ✅ resolvido | `DELETE /usuarios/{id}` agora remove a conta do Auth via `supabase_admin.auth.admin.delete_user(user_id)` (service role key em `SUPABASE_SERVICE_ROLE_KEY`, nunca exposta no frontend). Sem a chave, a exclusão retorna 503 explícito em vez de deixar conta fantasma. Conta já inexistente no Auth é tolerada ("user not found") |
| Refresh de token | ✅ implementado | `POST /auth/refresh` no backend; frontend centraliza chamadas em `apiFetch` (`services/apiClient.ts`), que renova a sessão automaticamente em 401 (single-flight) e repete a requisição; login salva `refresh_token`; logout e 401 final limpam as credenciais |
| Recuperação de senha | ✅ implementado | `POST /auth/forgot-password` (envia e-mail via Supabase, sempre responde sucesso para não revelar e-mails) + `POST /auth/reset-password` (valida tokens do link e troca a senha). Telas `/forgot-password` e `/reset-password` + link "Esqueci minha senha" no login. Requer `FRONTEND_URL` no `.env` e a URL de redirect cadastrada no Supabase |
| Rate limit em memória | ✅ implementado | `RedisRateLimiter` (INCR+EXPIRE) quando `REDIS_URL` configurada — compartilhado entre instâncias; fallback automático para memória se o Redis cair |
| Auditoria | ✅ implementado | Tabela `agendamentos_auditoria` (migração `sql/migracao_auditoria.sql`) registra quem (`usuario_id`) fez o quê (`criado`/`atualizado`/`cancelado`) e quando, com os dados da operação; consulta via `GET /agendamentos/{id}/auditoria`. Falha de auditoria não interrompe o agendamento |

**Ação manual necessária:** executar `backend/sql/migracao_auditoria.sql` no SQL Editor do Supabase (a de soft delete já consta como executada). Para conferir: `cd backend && venv/bin/python scripts/verificar_migracoes.py`.

---

*Documento gerado em 13/08/2026 a partir da execução completa de revisão, correção, implementação e validação do projeto agendaSaude.*
