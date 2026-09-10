// Sistema gamificado de risco de falta (no-show) — por paciente.
// Usa o histórico já carregado de agendamentos para pontuar o risco
// da PRÓXIMA/consulta agendada daquele paciente.

export interface NivelRisco {
  nivel: "baixo" | "medio" | "alto";
  cor: string; // classes Tailwind do selo
  texto: string;
}

export const REGRAS_RISCO = [
  { fator: "Paciente sem histórico de faltas", pontos: 10 },
  { fator: "Cada cancelamento anterior", pontos: "+20" },
  { fator: "Cada falta (não realizado)", pontos: "+30" },
  { fator: "Limite máximo de pontos", pontos: "100" },
];

export const NIVEL_RISCO: Record<NivelRisco["nivel"], NivelRisco> = {
  baixo: {
    nivel: "baixo",
    cor: "bg-emerald-100 text-emerald-700",
    texto: "Baixo (0–39)",
  },
  medio: {
    nivel: "medio",
    cor: "bg-amber-100 text-amber-700",
    texto: "Médio (40–69)",
  },
  alto: {
    nivel: "alto",
    cor: "bg-rose-100 text-rose-700",
    texto: "Alto (70–100)",
  },
};

export interface ItemAgendamento {
  patientId: string;
  status: string; // 'agendado' | 'concluído' | 'cancelado'
  statusNome?: string; // rótulo original (ex.: "Faltou", "Expirado")
}

// Status que representam falta (no-show) no rótulo original da API.
const STATUS_FALTA = [
  "faltou",
  "expirado",
  "no_show",
  "não realizado",
  "nao realizado",
];

// Pontua o risco de um agendamento considerando o histórico do paciente.
export function calcularRisco(
  historico: ItemAgendamento[],
  agendamento: ItemAgendamento
): { pontos: number; nivel: NivelRisco } {
  const doMesmoPaciente = historico.filter(
    (a) => a.patientId === agendamento.patientId
  );

  let pontos = 10;

  // Cada consulta cancelada soma 20; cada falta (não realizado) soma 30.
  // O app normaliza status em: agendado | concluído | cancelado; por isso
  // a falta é identificada pelo statusNome original.
  const cancelados = doMesmoPaciente.filter(
    (a) => a.status === "cancelado"
  ).length;

  const faltas = doMesmoPaciente.filter((a) =>
    STATUS_FALTA.includes(
      (a.statusNome || "").toLowerCase()
    )
  ).length;

  pontos += cancelados * 20 + faltas * 30;
  pontos = Math.min(pontos, 100);

  const nivel =
    pontos >= 70 ? "alto" : pontos >= 40 ? "medio" : "baixo";

  return { pontos, nivel: NIVEL_RISCO[nivel] };
}

// Rótulo curto p/ selo
export function rotuloRisco(pontos: number): string {
  return `${pontos} pts`;
}
