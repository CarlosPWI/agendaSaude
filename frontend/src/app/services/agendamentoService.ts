import { Agendamento, mockAgendamentos } from "../data/mockData";

// Preparação para futura integração com API em Python/Flask
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Simula delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let agendamentosCache = [...mockAgendamentos];

export async function fetchAgendamentos(): Promise<Agendamento[]> {
  await delay(500);
  return [...agendamentosCache];
}

export async function fetchAgendamentoById(id: string): Promise<Agendamento | undefined> {
  await delay(300);
  return agendamentosCache.find((a) => a.id === id);
}

export async function createAgendamento(agendamento: Omit<Agendamento, "id" | "status" | "attended">): Promise<Agendamento> {
  await delay(600);
  const novoAgendamento: Agendamento = {
    ...agendamento,
    id: Math.random().toString(36).substr(2, 9),
    status: "agendado",
    attended: false,
  };
  agendamentosCache.push(novoAgendamento);
  return novoAgendamento;
}

export async function updateAgendamento(id: string, updates: Partial<Agendamento>): Promise<Agendamento> {
  await delay(500);
  const index = agendamentosCache.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error("Agendamento não encontrado");
  }
  const atualizado = { ...agendamentosCache[index], ...updates };
  agendamentosCache[index] = atualizado;
  return atualizado;
}

export async function cancelAgendamento(id: string): Promise<void> {
  await delay(400);
  const index = agendamentosCache.findIndex((a) => a.id === id);
  if (index !== -1) {
    agendamentosCache[index].status = "cancelado";
  }
}
