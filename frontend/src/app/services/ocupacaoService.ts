import { format } from "date-fns";
import { handleUnauthorized } from "./session";
import { apiFetch } from "./apiClient";

export type TipoOcupacao = "reuniao" | "grupo" | "bloqueio";

export interface Ocupacao {
  id: string;
  usuario_id: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  tipo: TipoOcupacao;
  titulo: string;
  observacoes?: string | null;
}

export interface OcupacaoSlot {
  id: string;
  data: string; // yyyy-MM-dd (local)
  horario: string; // HH:mm (local)
  tipo: TipoOcupacao;
  titulo: string;
  observacoes?: string | null;
}

function mapOcupacao(item: Ocupacao): OcupacaoSlot {
  const inicio = new Date(item.data_hora_inicio);

  return {
    id: item.id,
    data: format(inicio, "yyyy-MM-dd"),
    horario: format(inicio, "HH:mm"),
    tipo: item.tipo,
    titulo: item.titulo || tituloPadrao(item.tipo),
    observacoes: item.observacoes || null,
  };
}

export function tituloPadrao(tipo: TipoOcupacao): string {
  switch (tipo) {
    case "reuniao":
      return "Reunião de Equipe";
    case "grupo":
      return "Grupo de Atendimento";
    default:
      return "Horário Bloqueado";
  }
}

export async function fetchOcupacoes(): Promise<OcupacaoSlot[]> {
  const response = await apiFetch(`/ocupacoes/`, { method: "GET" });

  const data = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error(data?.message || "Erro ao buscar ocupações");
  }

  const lista = Array.isArray(data) ? data : data?.data;

  return Array.isArray(lista) ? lista.map(mapOcupacao) : [];
}

export async function criarOcupacao(payload: {
  data_hora_inicio: string;
  tipo: TipoOcupacao;
  titulo?: string;
  observacoes?: string;
}): Promise<void> {
  const response = await apiFetch(`/ocupacoes/`, {
    method: "POST",
    body: JSON.stringify({
      data_hora_inicio: payload.data_hora_inicio,
      tipo: payload.tipo,
      titulo: payload.titulo || tituloPadrao(payload.tipo),
      observacoes: payload.observacoes || "",
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error(data?.message || "Erro ao criar ocupação");
  }
}

export async function removerOcupacao(id: string): Promise<void> {
  const response = await apiFetch(`/ocupacoes/${id}`, { method: "DELETE" });

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error("Erro ao remover ocupação");
  }
}
