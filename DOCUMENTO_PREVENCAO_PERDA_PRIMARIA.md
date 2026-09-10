# Módulo de Prevenção de Perda Primária (Absenteísmo)

> **Aplicativo:** agenda Saúde — agendamento de atendimentos em UBS (Atenção Primária).
> **Autor:** Equipe agenda Saúde — PI2.
> **Objetivo:** identificar **em tempo real** situações de *Perda Primária*
> (paciente falta / horário produtivo vago → penalização da prefeitura) e
> consolidar os dados em gráficos dinâmicos no dashboard administrativo.
>
> Este documento separa **LÓGICA DE NEGÓCIO** de **ORIENTAÇÕES DE INTERFACE (UI)**.

---

## PARTE A — LÓGICA DE NEGÓCIO

### A.1 Definição de "Perda Primária" neste domínio

No contexto de Atenção Primária, *Perda Primária* é **todo horário de consulta
que foi reservado/esperado e acabou sem atendimento produtivo** (vago), gerando
penalização e fila não absorvida. O evento central é o **absenteísmo (no-show)**,
mas também contam cancelamentos tardios **não repostos** e slots ociosos.

### A.2 Mapeamento de Gatilhos (Triggers)

| ID | Gatilho (evento) | Quando classificar como Perda | Motivo (categoria) |
|----|------------------|-------------------------------|--------------------|
| T1 | **Paciente não compareceu** (status = não realizado) | Após o horário, sem aviso | `no_show_sem_aviso` |
| T2 | **Cancelamento de última hora** (< 24h antes) | Cancelado e **sem encaixe de reposição** no slot | `cancelou_tardio` |
| T3 | **Cancelamento com aviso** (≥ 24h) sem reposição | Slot não preenchido no dia | `cancelou_com_aviso` |
| T4 | **Falta por conflito/duplo agendamento** | Paciente tinha 2 consultas e faltou a 1 | `conflito_horario` |
| T5 | **Slot ocioso** (sem agendamento, dia útil) | Período sem agenda não bloqueado/reunião | `slot_ocioso` |
| T6 | **Encaixe não preenchido** | Urgência marcada como encaixe e paciente faltou | `encaixe_no_show` |
| T7 | **Reagendamento para longe** gerando vazio hoje | Data original ficou sem reposição | `reagendou_longe` |

**Regra de ouro:** um horário só é "perdido" se **não** houver reposição
(encaixe) na mesma janela. Se o operador encaixou outro paciente no mesmo slot,
o evento deixa de ser perda (vira *perda recuperada*).

### A.3 Campos mínimos a registrar (toda vez que um gatilho disparar)

- `id` do evento, `medico_id`, `ubs_id`
- `agendamento_id` (se houver) e `paciente_id`
- `data_hora_consulta` (o horário perdido)
- `tipo_gatilho` (T1..T7) e `motivo` (categoria da rosca)
- `reposto_por_encaixe` (boolean) → perda ou perda recuperada
- `janela_cancelamento_horas` (para T2/T3)
- `criado_em`

### A.4 Estrutura de dados sugerida (SQL / Supabase)

```sql
create type tipo_perda as enum (
  'no_show_sem_aviso','cancelou_tardio','cancelou_com_aviso',
  'conflito_horario','slot_ocioso','encaixe_no_show','reagendou_longe'
);

create table public.perda_primaria_eventos (
  id uuid primary key default gen_random_uuid(),
  medico_id uuid references public.usuarios (usuario_id),
  ubs_id uuid,
  agendamento_id integer references public.agendamentos (agendamento_id),
  paciente_id integer references public.pacientes (paciente_id),
  data_hora_consulta timestamptz not null,     -- horário que foi perdido
  tipo tipo_perda not null,
  motivo text not null,
  reposto_por_encaixe boolean not null default false,
  janela_cancelamento_horas numeric,
  criado_em timestamptz not null default now()
);

create index idx_perda_consulta on public.perda_primaria_eventos (data_hora_consulta);
create index idx_perda_ubs_data on public.perda_primaria_eventos (ubs_id, data_hora_consulta);
```

Exemplo de **JSON** que o backend grava por evento:

```json
{
  "id": "uuid",
  "medico_id": "uuid-do-medico",
  "ubs_id": "ubs-central",
  "agendamento_id": 120,
  "paciente_id": 45,
  "data_hora_consulta": "2026-09-10T14:00:00Z",
  "tipo": "no_show_sem_aviso",
  "motivo": "Paciente não compareceu",
  "reposto_por_encaixe": false,
  "janela_cancelamento_horas": null,
  "criado_em": "2026-09-10T14:05:00Z"
}
```

> Como o sistema **não fatura R$**, a métrica de "volume de perda" é expressa em
> **horas produtivas perdidas** e **quantidade de faltas** (e, se a UBS definir um
> valor por consulta/ticket, multiplica-se para estimar R$).

### A.5 Cálculo das métricas (KPI)

| KPI | Fórmula |
|-----|---------|
| Taxa de absenteísmo (dia) | `faltas_não_repostas / total_agendado * 100` |
| Horas produtivas perdidas | `Σ (30 min) de eventos com reposto_por_encaixe = false` |
| Taxa de recuperação | `eventos_repostos / total_perdas * 100` |
| Top motivo | motivo com maior contagem na janela |
| Slots ociosos | períodos livres em dia útil sem ocupação |

### A.6 Alertas (Thresholds) — regras de negócio

| Alerta | Condição (gatilho) | Severidade |
|--------|--------------------|------------|
| **Absenteísmo alto no dia** | Taxa ≥ 25% até às 14h | 🟠 Médio — card de aviso |
| **Pico de faltas** | ≥ 5 faltas não repostas em janela de 2h | 🔴 Alto — card + gráfico vermelho |
| **Cancelamento tardio** | ≥ 3 cancelamentos < 24h sem reposição no dia | 🟠 Médio |
| **Recuperação baixa** | Taxa de encaixe < 20% no dia | 🟠 Médio |
| **Feriado/pré-feriado** | Faltas esperadas altas em véspera | ⚪ Informativo |

**Regra:** o alerta só aparece quando a métrica **ultrapassa** o limite
aceitável na janela configurada (ex.: 25% no dia ou 5 faltas/2h) e some quando
voltar ao normal. Um alerta **não** pode ser disparado por dados ainda em aberto
(ex.: falta só conta depois do horário + tolerância).

---

## PARTE B — ORIENTAÇÕES DE INTERFACE (UI) PARA OS GRÁFICOS

### B.1 Local de exibição (dashboard)

Recomendação: painel **"Faltas & Perda Primária"** (novo, dentro do dashboard
administrativo — o mesmo local do *Up Visual*). Barra superior com filtros
**Período (dia/semana/mês) · UBS · Médico**.

### B.2 Gráficos mínimos

| # | Gráfico | Tipo | Dados cruzados |
|---|---------|------|----------------|
| 1 | **Volume de perda** (horas/quantidade por dia ou por hora) | **Barra ou linha** (2 séries: faltas e horas perdidas) | `data_hora_consulta` (dia/hora) × `tipo` ≠ recuperado |
| 2 | **Onde o paciente abandonou** (funil do atendimento) | **Funil** (agendado → confirmou → compareceu → atendido) | contagem por etapa; ponto de maior perda destacado |
| 3 | **Motivo da perda** | **Pizza/rosca** | `motivo` × quantidade (e R$ se houver ticket) |
| 4 | **Bônus — Cruzamentos** | Barra / tabela | faltas × dia da semana/horário; × faixa etária; × agente; × distância (CEP) |
| 5 | **Bônus — Encaixes** | Barra empilhada | repostos × não repostos por dia |

**Boas práticas de UI:**
- KPI cards no topo (Taxa de absenteísmo, Horas perdidas, Recuperação, Top motivo).
- Tooltip com **variação** (▲/▼ %) e o **exato** (nº e %).
- **Drill-down**: clicar numa barra/pedaço abre a **lista nominal** dos pacientes
  daquela perda com ação **"Contatar via WhatsApp"** (reduz a perda na origem).
- Alerta: card no topo com borda **vermelha pulsante** quando ultrapassa o
  threshold + gráfico fica com a cor de alerta.
- Cor padrão: perda = `rose`; recuperado/encaixe = `emerald`; neutro = `slate`.

### B.3 Como o frontend consome (sem lentidão)

O backend expõe **um endpoint agregado** que já devolve os dados prontos para o
gráfico (evita o app processar tudo):

```jsonc
// GET /dashboard/perda-primaria?inicio=...&fim=...&ubs_id=...
{
  "kpis": { "taxa_absenteismo": 27.4, "horas_perdidas": 14.5,
            "taxa_recuperacao": 35, "top_motivo": "no_show_sem_aviso" },
  "serie_diaria": [{ "dia": "2026-09-08", "faltas": 6, "horas": 3.0,
                     "repostos": 2 }],
  "funil": [{ "etapa": "agendado", "total": 40 },
            { "etapa": "confirmou", "total": 34 },
            { "etapa": "compareceu", "total": 28 },
            { "etapa": "atendido", "total": 27 }],
  "motivos": [{ "motivo": "no_show_sem_aviso", "qtd": 8 }],
  "alertas": [{ "severidade": "alta", "mensagem": "5+ faltas em 2h",
                "metrica": "pico_faltas" }]
}
```

---

## Relação com o que já existe no projeto

- A tela **Up Visual** já tem (mock): calendário de ocupação, gráfico de
  faltas/comparecimentos, rosca por faixa etária e lista de risco de no-show com
  WhatsApp. Este documento formaliza a **versão real** desse painel.
- Os **gatilhos** T1/T2 podem ser detectados a partir de `agendamentos`
  (status `realizado`/`não realizado`/`cancelado` + `data_hora_inicio` +
  `atualizado_em` da auditoria p/ janela de cancelamento) e `agenda_ocupacoes`.
- **Próximo passo técnico:** criar a tabela `perda_primaria_eventos`, um
  "detector" (no serviço de agendamento ao cancelar/marcar não-realizado) e o
  endpoint agregado acima; depois, ligar o painel real no lugar do mock.
