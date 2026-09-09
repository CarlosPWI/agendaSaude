// ============================================================================
// Módulo analítico "Up Visual" — STATUS: PROVISÓRIO
// Dados MOCK determinísticos para demonstração. Este módulo (e a tela a que
// serve) PODE SER REMOVIDO/MODIFICADO livremente. Para uso com dados reais,
// substituir os geradores por chamadas à API mantendo as mesmas interfaces.
// ============================================================================

export type StatusAg = "compareceu" | "no_show" | "cancelado";

export interface PacienteAnalitico {
  id: number;
  nome: string;
  telefone: string;
  faixaEtaria: string;
  distanciaKm: number;
  faltasRecentes: number;
}

export interface RegistroAnalitico {
  id: number;
  data: string; // yyyy-MM-dd
  dia: number; // dia do mês
  diaSemana: number; // 0=dom .. 6=sáb
  horario: number; // 8..18
  status: StatusAg;
  especialidade: string;
  medico: string;
  valor: number;
  paciente: PacienteAnalitico;
}

const MEDICOS = ["Dra. Helena", "Dr. Rafael", "Dra. Camila", "Dr. Pedro"];
const ESPECIALIDADES = ["Clínica Geral", "Cardiologia", "Pediatria", "Dermato"];
const VALOR_POR_ESP: Record<string, number> = {
  "Clínica Geral": 180,
  Cardiologia: 320,
  Pediatria: 160,
  Dermato: 260,
};

const NOMES = [
  "Mariana Souza", "Carlos Lima", "Fernanda Alves", "Rafael Costa",
  "Juliana Mendes", "Lucas Martins", "Beatriz Rocha", "Gabriel Nunes",
  "Patrícia Gomes", "Thiago Moreira", "Aline Batista", "Diego Pereira",
];
const FAIXAS = ["0-17", "18-34", "35-49", "50-64", "65+"];

function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function diaUtil(diaSemana: number) {
  return diaSemana >= 1 && diaSemana <= 5;
}

export function gerarMes(ano: number, mes: number): RegistroAnalitico[] {
  // mes: 1-12
  const dias = new Date(ano, mes, 0).getDate();
  const random = rng(ano * 100 + mes);
  const registros: RegistroAnalitico[] = [];
  let id = 1;

  for (let dia = 1; dia <= dias; dia++) {
    const d = new Date(ano, mes - 1, dia);
    const diaSemana = d.getDay();
    const slots = diaUtil(diaSemana) ? 11 : 4; // 8h..18h ou 8h..11h
    const lotado = random() > 0.45; // dias cheios (>90%) ou com folga

    for (let h = 0; h < slots; h++) {
      const horario = 8 + h;
      // probabilidade de o slot estar ocupado
      const ocupado = lotado
        ? random() > 0.08
        : random() < 0.55;

      if (!ocupado) continue;

      // fim de tarde de sexta tem mais cancelamento (padrão do insight)
      const isSextaTarde = diaSemana === 5 && horario >= 16;
      const r = random();
      let status: StatusAg;
      if (isSextaTarde ? r < 0.3 : r < 0.12) status = "cancelado";
      else if (r < 0.2) status = "no_show";
      else status = "compareceu";

      const especialidade =
        ESPECIALIDADES[Math.floor(random() * ESPECIALIDADES.length)];
      const faixa = FAIXAS[Math.floor(random() * FAIXAS.length)];
      const dist = Math.round(random() * 18 + 1);

      registros.push({
        id: id++,
        data: `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
        dia,
        diaSemana,
        horario,
        status,
        especialidade,
        medico: MEDICOS[Math.floor(random() * MEDICOS.length)],
        valor: VALOR_POR_ESP[especialidade],
        paciente: {
          id: 1000 + id,
          nome: NOMES[Math.floor(random() * NOMES.length)],
          telefone: `55119${String(80000000 + Math.floor(random() * 9999999))}`,
          faixaEtaria: faixa,
          distanciaKm: dist,
          faltasRecentes: status === "no_show" || status === "cancelado"
            ? 1 + Math.floor(random() * 2)
            : Math.floor(random() * 2),
        },
      });
    }
  }

  return registros;
}

export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function corOcupacao(ocupacao: number): string {
  if (ocupacao >= 0.9) return "bg-rose-500";
  if (ocupacao >= 0.5) return "bg-amber-400";
  return "bg-emerald-400";
}

export interface DiaOcupacao {
  dia: number;
  ocupacao: number;
  total: number;
  cancelados: number;
  data: string;
}

export function ocupacaoPorDia(registros: RegistroAnalitico[]): DiaOcupacao[] {
  const mapa = new Map<number, DiaOcupacao>();
  for (const r of registros) {
    const atual = mapa.get(r.dia) || {
      dia: r.dia, ocupacao: 0, total: 0, cancelados: 0, data: r.data,
    };
    atual.total += 1;
    if (r.status === "cancelado") atual.cancelados += 1;
    if (r.status !== "cancelado") atual.ocupacao += 1;
    mapa.set(r.dia, atual);
  }
  const lista = [...mapa.values()];
  for (const d of lista) {
    // capacidade do dia
    const capacidade = diaUtil(new Date(d.data + "T00:00:00").getDay())
      ? 11 : 4;
    d.ocupacao = capacidade ? d.ocupacao / capacidade : 0;
  }
  return lista;
}

export function scoreRisco(p: PacienteAnalitico, statusAnteriorFaltou: boolean): number {
  let score = 30;
  score += p.faltasRecentes * 15;
  if (p.faltasRecentes >= 2) score += 10;
  if (p.distanciaKm >= 10) score += 12;
  if (p.distanciaKm >= 15) score += 8;
  if (statusAnteriorFaltou) score += 10;
  return Math.min(score, 100);
}

export interface Insight {
  tipo: "alerta" | "sugestao" | "info";
  texto: string;
}

export function gerarInsights(registros: RegistroAnalitico[]): Insight[] {
  const insights: Insight[] = [];

  // taxa de cancelamento por dia da semana
  const porDia = new Map<number, { total: number; faltou: number }>();
  for (const r of registros) {
    const at = porDia.get(r.diaSemana) || { total: 0, faltou: 0 };
    at.total += 1;
    if (r.status !== "compareceu") at.faltou += 1;
    porDia.set(r.diaSemana, at);
  }
  const pior = [...porDia.entries()].sort(
    (a, b) => b[1].faltou / b[1].total - a[1].faltou / a[1].total
  )[0];

  if (pior && pior[1].total > 0) {
    const taxa = Math.round((pior[1].faltou / pior[1].total) * 100);
    insights.push({
      tipo: "alerta",
      texto: `A taxa de faltas às ${DIAS_SEMANA[pior[0]].toLowerCase()} é de ${taxa}%. Considere confirmação em dobro nesse dia.`,
    });
  }

  // fim de tarde de sexta
  const sextaTarde = registros.filter(
    (r) => r.diaSemana === 5 && r.horario >= 16
  );
  if (sextaTarde.length) {
    const faltas = sextaTarde.filter((r) => r.status !== "compareceu").length;
    const taxa = Math.round((faltas / sextaTarde.length) * 100);
    insights.push({
      tipo: "sugestao",
      texto: `Cancelamentos às sextas após as 16h estão em ${taxa}%. Sugestão: habilitar lista de espera automática neste período.`,
    });
  }

  insights.push({
    tipo: "info",
    texto: "Pacientes com histórico de 2+ faltas e distância > 10 km concentram alto risco de no-show.",
  });

  return insights;
}
