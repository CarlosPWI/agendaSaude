import { handleUnauthorized } from "./session";
import { apiFetch } from "./apiClient";

export interface AgenteComunitario {
  agentecomunitario_id: number;
  nome: string;
}

export async function fetchAgentes(): Promise<AgenteComunitario[]> {
  const response = await apiFetch(`/agentescomunitarios/`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error(data?.message || "Erro ao buscar agentes comunitários");
  }

  const lista = Array.isArray(data) ? data : data?.data;

  return Array.isArray(lista) ? lista : [];
}

export async function atualizarAgente(
  id: number,
  nome: string
): Promise<AgenteComunitario> {
  const response = await apiFetch(`/agentescomunitarios/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nome }),
  });

  const data = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error(data?.message || "Erro ao atualizar agente");
  }

  const agente = data?.data || data;

  return agente;
}
