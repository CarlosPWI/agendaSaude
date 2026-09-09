# Relatório Técnico — agendaSaude

**Data:** 13/08/2026
**Escopo:** Revisão completa do backend (FastAPI + Supabase) e frontend (React + Vite)
**Resultado:** 6 bugs críticos, 7 altos, 8 médios e diversos de baixa severidade. O sistema **não está funcional de ponta a ponta** no estado atual.

---

## 0. Status das correções (atualizado)

| Item | Fase | Status |
|------|------|--------|
| C-1 register inexistente | 1 | ✅ `AuthService.register` implementado + testes |
| C-2 rotas sem auth | 1 | ✅ todas protegidas com `Depends(get_current_user)` |
| C-3 diálogo órfão | 1 | ✅ removido; `tsc --noEmit` integrado ao build |
| C-4 contrato divergente | 1 | ✅ mapeamento único em `agendamentoService` |
| C-5 token não salvo | 1 | ✅ login salva `access_token` |
| C-6 get_me vazando lista | 1 | ✅ `buscar_por_id` filtra pelo ID |
| A-1 guard/logout | 1 | ✅ redirect sem token; logout limpa localStorage |
| A-2 fuso horário | 2 | ✅ UTC de ponta a ponta (backend) + datas locais no frontend |
| A-3/A-4 IndexError/JWT | 2 | ✅ acesso seguro + remoção do módulo quebrado |
| A-5 login 500 | 1 | ✅ 403 claro quando usuário não cadastrado |
| A-6 DELETE Auth órfão | ✅ resolvido | `DELETE /usuarios/{id}` remove do Auth via service role key (`SUPABASE_SERVICE_ROLE_KEY`) |
| A-7 dupla validação | 2 | ✅ validação única no service (UTC) |
| M-1/M-2 repositórios | 2 | ✅ exclude corrigido, acessos seguros |
| M-3 dialogs duplicados | 1 + soft delete | ✅ soft delete (coluna `cancelado`) |
| M-4 service payloads | 1 | ✅ reescritos com contrato real |
| M-5 data UTC | 2 | ✅ `format(...)` local no ReschedulePage |
| M-6 CORS hardcoded | 3 | ✅ `CORS_ORIGINS` via env |
| M-7 403 vs 401 | 1 | ✅ `HTTPBearer(auto_error=False)` → 401 |
| M-8 erros inconsistentes | 2 | ✅ handler global único |
| L-1 console.log sensíveis | 3 | ✅ removidos |
| L-2/L-8 código morto | 2 | ✅ models/, jwt_handler, api.ts removidos |
| L-3 README desatualizado | 3 | ✅ reescrito |
| L-4 requirements UTF-16 | 3 | ✅ regravado UTF-8 |
| L-5 __pycache__ | 3 | ✅ limpos |
| L-6 testes | 3 | ✅ 17 testes pytest passando |
| L-7 paginação/rate limit | 3 | ✅ limit/offset nas listagens + rate limit no auth |
| L-9 horários hardcoded | 3 | ✅ constante `HORARIOS_DISPONIVEIS` |
| L-10/L-11 attended/cancelled | 3 | ✅ campo removido; card "Cancelados" no stats |
| L-13 typecheck | 1 | ✅ `tsconfig.json` + `tsc --noEmit` no build |
| B-1 sem tela de cadastro | 4 | ✅ `RegisterPage` (`/register`), `GET /tiposusuarios/` público p/ listar tipos, aviso de e-mail não confirmado e 401 → redirect no login |

**Pendências resolvidas (07/09/2026):**

| Pendência | Resolução |
|-----------|-----------|
| A-6 — delete não removia do Supabase Auth | `UsuarioService.delete` agora chama `supabase_admin.auth.admin.delete_user()` (cliente service role em `config/database.py`). Sem `SUPABASE_SERVICE_ROLE_KEY`, a exclusão é bloqueada com 503 explícito (não cria conta fantasma) |
| Refresh de token | Backend: `POST /auth/refresh` (`AuthService.refresh`). Frontend: `apiClient.ts` (`apiFetch`) renova a sessão automaticamente ao receber 401 e repete a chamada; todas as páginas autenticadas migradas; login salva `refresh_token`; logout/401 limpam |
| Recuperação de senha | Backend: `POST /auth/forgot-password` (e-mail do Supabase, não revela se e-mail existe) + `POST /auth/reset-password` (troca a senha com os tokens do link). Frontend: páginas `/forgot-password` e `/reset-password` + link no login |
| Rate limit em memória | `RedisRateLimiter` (INCR + EXPIRE, janela fixa) ativado quando `REDIS_URL` está configurada; fallback automático para memória se o Redis estiver indisponível |
| Auditoria | Tabela `agendamentos_auditoria` (`sql/migracao_auditoria.sql`); `criar`/`atualizar`/`deletar` do `AgendamentoService` registram quem fez e quando; consulta via `GET /agendamentos/{id}/auditoria`. Falha na auditoria não interrompe o fluxo principal |

Cobertura: suíte pytest subiu de 17 para **39 testes** (refresh, forgot/reset, delete com Auth, auditoria e rate limit). `tsc --noEmit` e `vite build` passando.

---

## 1. Resumo Executivo

O projeto tem boa estrutura de camadas (controller → service → repository → Supabase), mas contém:

1. **Fluxo de cadastro quebrado** (endpoint `/auth/register` chama método inexistente → 500).
2. **Autenticação não aplicada** em praticamente todas as rotas de dados sensíveis (pacientes, agendamentos) — qualquer pessoa sem login consegue ler/alterar/apagar dados de saúde.
3. **Página de consultas quebrada em runtime** (referências a variáveis/funções inexistentes) e com **contrato de dados divergente** entre API e frontend.
4. **Token de login nunca salvo** (frontend espera `token`, backend devolve `access_token`).

---

## 2. Bugs Críticos (impedem uso / vazamento de dados)

### C-1. Endpoint de registro quebrado — `AuthService.register` não existe
- **Arquivo:** `backend/src/controllers/auth_controller.py:19`
- **Problema:** `AuthService.register(...)` é chamado, mas `auth_service.py` só implementa `login`. Resultado: `AttributeError` → HTTP 500 em todo `/auth/register`.
- **Impacto:** Ninguém consegue criar usuário novo; sem registro, usuários novos também não têm linha na tabela `usuarios`.
- **Contramedida:** Implementar `AuthService.register` (criar usuário no Supabase Auth via `supabase.auth.sign_up` + inserir linha na tabela `usuarios` com `tipousuario_id` validado), com rollback caso o insert na tabela falhe. Validar senha mínima e e-mail único.

### C-2. Rotas de dados sensíveis sem autenticação
- **Arquivos:** `backend/src/controllers/paciente_controller.py`, `agendamento_controller.py`, `agentecomunitario_controller.py`, `statusagendamento_controller.py`, `tiposusuarios_controller.py`, e `usuario_controller.py:13` (`GET /usuarios/{user_id}` e `GET /usuarios/` sem proteção).
- **Problema:** Nenhuma dessas rotas usa `Depends(get_current_user)`. Qualquer pessoa (sem token) pode listar, criar, editar e deletar pacientes/agendamentos.
- **Impacto:** Vazamento de dados de saúde (LGPD), alteração/apagamento indevido de agenda.
- **Contramedida:** Aplicar `user=Depends(get_current_user)` em todas as rotas; adicionar verificação de perfil (ex.: somente profissional/atendente edita agendamentos). Proteger também `GET /usuarios/` (ou remover) e `GET /usuarios/{id}` (permitir apenas o próprio ou admin).

### C-3. Página "Agenda de Consultas" quebra em runtime (variáveis inexistentes)
- **Arquivo:** `frontend/src/app/pages/AppointmentsPage.tsx:487-505`
- **Problema:** JSX referencia `concluirDialogOpen`, `setConcluirDialogOpen` e `confirmConcluir` que **não existem** no componente. Como `vite build` não executa o TypeScript checker (`"build": "vite build"`, sem `tsc -b` e sem tsconfig), o erro só aparece em runtime: `ReferenceError` → página branca.
- **Contramedida:** Remover o diálogo órfão de "Finalizar Consulta" ou implementar o estado e a função `confirmConcluir`; adicionar `tsc -b && vite build` no script de build e commitar `tsconfig.json`.

### C-4. Contrato de dados divergente entre API e frontend (página de consultas)
- **Arquivos:** `frontend/src/app/services/agendamentoService.ts:48-62` (retorna linhas cruas da API) vs `AppointmentsPage.tsx` e `types/agendamento.ts` (esperam campos `id`, `date`, `time`, `patientName`, `status`).
- **Problema:** A API retorna `agendamento_id`, `data_hora_inicio`, `pacientes.nome`, `statusagendamento.nome`. A página consome `appointment.date`, `appointment.time`, `appointment.patientName`, `appointment.status` — todos `undefined`.
- **Impacto:** IDs undefined (links `/dashboard/reagendar/undefined`), datas inválidas, filtro por paciente lança `TypeError` (`undefined.toLowerCase()`), badges de status sempre "default".
- **Contramedida:** Mapear os dados em `normalizeArrayResponse` para o shape camelCase do `types/agendamento.ts` (ou mudar as páginas para consumir snake_case). Garantir um único tipo de contrato.

### C-5. Token de login nunca é salvo
- **Arquivo:** `frontend/src/app/pages/LoginPage.tsx:49-55` vs `backend/src/services/auth_service.py:36-44`
- **Problema:** Backend devolve `{access_token, refresh_token, user}`; o frontend procura `data.token` → nunca salva.
- **Impacto:** O usuário "loga" e é redirecionado, mas **nenhuma** chamada autenticada funciona (hoje passa despercebido porque as rotas estão abertas — ver C-2).
- **Contramedida:** Salvar `data.access_token` em `localStorage` (ou melhor: cookie `HttpOnly` + CSRF). Ajustar também `DashboardLayout` e serviços para o mesmo nome de chave.

### C-6. `get_me` vaza a lista de todos os usuários
- **Arquivo:** `backend/src/repositories/usuario_repository.py:15-19`
- **Problema:** `buscar_por_id(value)` **ignora o parâmetro `value`** — faz `select` sem `.eq()`, retornando todas as linhas. O serviço `UsuarioService.get_me` então devolve todos os usuários (e-mails incluídos) como se fosse um.
- **Impacto:** Vazamento de dados de todos os usuários via `/usuarios/me`; checagem `if not user` nunca dispara (lista não vazia).
- **Contramedida:** Adicionar `.eq(cls.id_field, value)` + `.maybe_single()` no método.

---

## 3. Bugs de Alta Severidade

### A-1. Frontend sem proteção de rota e logout sem limpar sessão
- **Arquivos:** `frontend/src/app/routes.tsx`, `DashboardLayout.tsx:14-16`
- **Problema:** `/dashboard/*` acessível sem token; `handleLogout` só navega para `/`, **não remove** `token` e `usuario` do localStorage.
- **Contramedida:** Criar guard (loader/wrapper) que redirecione para `/` se não houver token; no logout, `localStorage.removeItem("token")` e `removeItem("usuario")`.

### A-2. Fuso horário tratado de forma inconsistente (agenda pode deslocar horas)
- **Arquivos:** `backend/src/services/agendamento_service.py:157-169` (`_normalizar_datetime` remove tzinfo), `backend/src/repositories/base_repository.py:112` (`json.dumps(default=str)` serializa datetime como `"YYYY-MM-DD HH:MM:SS"` sem offset), e frontend `NewAppointmentPage.tsx:178-187` / `ReschedulePage.tsx:192-216` (converte local→UTC com `toISOString()`).
- **Problema:** O horário é validado contra `datetime.now()` do servidor (naive/local) enquanto o frontend envia UTC; a escrita no banco depende do tipo da coluna (`timestamptz` vs `timestamp`). Se a coluna for `timestamp` sem tz, o horário exibido fica deslocado (+3h no Brasil).
- **Contramedida:** Padronizar UTC de ponta a ponta: backend sempre trabalhar com datetimes `timezone-aware` UTC, serializar ISO 8601 com offset (usar `.isoformat()` em vez de `default=str`), e garantir colunas `timestamptz` no Supabase. Validar horário usando `datetime.now(timezone.utc)`.

### A-3. IndexError em respostas vazias do Supabase → 500
- **Arquivo:** `backend/src/repositories/base_repository.py:27, 73, 86` (padrão `response.data[0] if response and response.data[0]`)
- **Problema:** Se `response.data == []` (ex.: delete de id inexistente, update sem matching row, RLS retornando vazio), `response.data[0]` levanta `IndexError` → 500 genérico.
- **Contramedida:** Usar acesso seguro: `response.data[0] if response.data else None`.

### A-4. `jwt_handler.py` quebra na importação se env var faltar (código morto)
- **Arquivo:** `backend/src/utils/jwt_handler.py:10` — `int(os.getenv("JWT_EXPIRATION"))` → `TypeError: int(None)` quando a variável não está definida; `SECRET` também pode ser `None`.
- **Problema:** Módulo não é usado em lugar nenhum (a autenticação usa Supabase Auth), mas qualquer import futuro derruba a aplicação.
- **Contramedida:** Remover o módulo ou aplicar valores default (`os.getenv("JWT_EXPIRATION", "3600")`) e falha clara se `SECRET` ausente.

### A-5. Login quebra com 500 se não houver linha na tabela `usuarios`
- **Arquivo:** `backend/src/services/auth_service.py:25-34`
- **Problema:** `.single()` do Supabase lança exceção quando não encontra linha → cai no `except` genérico → 500 "Erro ao realizar login" (deveria ser 404/403 claro). Como o registro está quebrado (C-1), qualquer usuário criado fora do fluxo quebra o login.
- **Contramedida:** Tratar `no rows` como erro específico ("Usuário não cadastrado no sistema") e sincronizar criação do usuário Auth com a linha em `usuarios`.

### A-6. DELETE de usuário não remove o registro no Supabase Auth
- **Arquivos:** `backend/src/controllers/usuario_controller.py:27-32`, `services/usuario_service.py:44-45`
- **Problema:** Apaga apenas a linha da tabela `usuarios`; o usuário continua no Supabase Auth. Ele não consegue mais logar (A-5 → 500) e a conta fantasma persiste. Além disso, agendamentos/pacientes com FK apontando para ele podem quebrar ou órfãos.
- **Contramedida:** Chamar `supabase.auth.admin.delete_user()` (service role) e tratar FKs (soft delete ou bloqueio).

### A-7. Dupla validação de horário pode divergir
- **Arquivos:** `backend/src/schemas/agendamento_schema.py:95-114` (aware vs naive, `datetime.now(value.tzinfo)`) + `agendamento_service.py:171-192`
- **Problema:** A mesma regra (futuro + hora cheia) é validada no schema e no service com referências de tempo diferentes (aware no schema, naive local no service). Em horários de virada de hora ou servidores em fuso diferente, uma passa e outra falha, gerando 422/400 confusos.
- **Contramedida:** Validar em um único ponto (service), com UTC.

---

## 4. Bugs de Média Severidade

| ID | Local | Problema | Contramedida |
|----|-------|----------|--------------|
| M-1 | `agendamento_repository.py:22` | `exclude={"criado_em, data_hora_fim"}` é uma string única, não um set de dois campos. Latente hoje (payload é dict), mas quebrará se um schema Pydantic for passado. | Usar `exclude={"criado_em", "data_hora_fim"}`. |
| M-2 | `usuario_repository.py:23-24` | `buscar_por_email` dá `IndexError` se e-mail não existir (`response.data[0]` em lista vazia). | Acesso seguro + `.maybe_single()`. |
| M-3 | `AppointmentsPage.tsx:457-525` | Dois `AlertDialog` de cancelamento ligados ao mesmo estado (duplicado) + segundo diálogo promete "manter registro com status cancelado", mas o backend **deleta** a linha (`DELETE /agendamentos/{id}`). | Remover duplicata; alinhar UX com o comportamento real (ou mudar o backend para soft-delete com status "cancelado"). |
| M-4 | `agendamentoService.ts:88-131` | `createAgendamento`/`updateAgendamento` enviam `{patientId, patientName, date, time}` — incompatível com o schema do backend (`usuario_id`, `paciente_id`, `statusagendamento_id`, `data_hora_inicio`). Funções quebradas (hoje não usadas pelas páginas). | Remover ou reescrever usando o contrato real. |
| M-5 | `ReschedulePage.tsx:139-142` | `dataInicio.toISOString().split("T")[0]` mostra a data em UTC, não local (ex.: consulta 21h local aparece no dia seguinte). | Usar `format(dataInicio, "yyyy-MM-dd")` local. |
| M-6 | `main.py:20-24` | CORS com origins hardcoded; ao implantar em novo domínio, esquece-se de atualizar. | Mover origins para variáveis de ambiente. |
| M-7 | `dependencies.py` | `HTTPBearer()` retorna **403** quando o header `Authorization` está ausente (não 401); frontend (`api.ts:75`) só trata 401. | Usar `HTTPBearer(auto_error=False)` + retornar 401 explicitamente. |
| M-8 | Controllers | Metade captura `ValidationException` e re-lança `HTTPException`, a outra depende do handler global de `main.py` → respostas de erro com formatos diferentes. | Padronizar: remover try/except locais e usar apenas o handler global. |

---

## 5. Problemas de Baixa Severidade / Qualidade

- **L-1:** `console.log` de payloads de pacientes (dados sensíveis) em `NewPatientPage`, `NewAgenteComunitarioPage`, `ReschedulePage` — remover em produção.
- **L-2:** `models/` (classes puras + SQLAlchemy `Base`) não são usados — código morto; remover ou implementar ORM de fato.
- **L-3:** README descreve stack antiga (Flask, HTML/JS, `src/api`, `src/dtos`, `tests/`) que não existe mais; documentação desatualizada gera confusão para novos devs.
- **L-4:** `requirements.txt` está em UTF-16 (alguns editores/pip antigos falham ao ler). Regravar como UTF-8.
- **L-5:** Pastas `__pycache__` entregues no pacote do projeto (`.gitignore` cobre, mas o zip entregue contém). Limpar antes de entregar/commitar.
- **L-6:** `backend/tests/` não existe (README anuncia testes). Sem cobertura de testes — criar pelo menos testes de service com fakes.
- **L-7:** Sem paginação nas listagens (`listar()` puxa tudo) e sem rate limiting — problema de escala e abuso.
- **L-8:** `api.ts` (`apiFetch`) e `response.py`/`base_service.py` duplicam utilitários nunca usados — consolidar.
- **L-9:** `PlannerPage` fixa horários 08:00–18:00 hardcoded em dois lugares — centralizar em constante/config.
- **L-10:** `types/agendamento.ts` declara `attended: boolean` que nunca existe nos dados.
- **L-11:** `AttendanceStats` calcula `cancelled` e não usa.
- **L-12:** `DatabaseLayout` lê e faz `JSON.parse` do localStorage no render sem try/catch — localStorage corrompido quebra o layout.
- **L-13:** Frontend sem `tsconfig.json` e sem typecheck no build — erros de tipo (como C-3) passam despercebidos.
- **L-14:** `GET /usuarios/` expõe todos os e-mails sem necessidade funcional.

---

## 6. Plano de Ação Priorizado

### Fase 1 — Bloqueadores (fazer primeiro)
1. Implementar `AuthService.register` (C-1) + tratar `single()` no login (A-5).
2. Proteger todas as rotas com `Depends(get_current_user)` (C-2).
3. Corrigir `buscar_por_id` do `UsuarioRepository` (C-6).
4. Salvar `access_token` no login e proteger rotas do frontend + logout correto (C-5, A-1).
5. Remover/corrigir o diálogo órfão da `AppointmentsPage` (C-3) e adicionar `tsc` ao build (L-13).
6. Mapear dados da API para o shape esperado na página de consultas (C-4).

### Fase 2 — Estabilidade
7. Acesso seguro a `response.data[0]` em todos os repositórios (A-3, M-2).
8. Padronizar UTC no backend e no frontend (A-2, M-5).
9. Corrigir `exclude` malformado (M-1), remover código morto (jwt_handler, api.ts, models) (A-4, L-2, L-8).
10. Unificar tratamento de erros dos controllers (M-8), 401 vs 403 (M-7).

### Fase 3 — Qualidade e segurança
11. Remover `console.log` com dados sensíveis (L-1); revisar LGPD (minimização, logs).
12. Soft delete de agendamentos (alinhar UX do cancelamento) (M-3).
13. Paginação, rate limiting, CORS via env (L-7, M-6).
14. Atualizar README/docs (L-3), UTF-8 no requirements (L-4), limpar `__pycache__` (L-5).
15. Criar suíte de testes de service (L-6).

---

## 7. Conclusão

A arquitetura em camadas é adequada e o caminho feliz de "logar → criar paciente → agendar" está quase pronto, porém o estado atual tem **quebra total do cadastro**, **autenticação decorativa** (rotas abertas) e **página de consultas inoperante** por divergência de contrato e referências inexistentes. Recomenda-se executar a Fase 1 antes de qualquer nova feature.
