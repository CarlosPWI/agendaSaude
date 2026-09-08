import { handleUnauthorized } from "./session";
import { apiFetch } from "./apiClient";

export interface Paciente {
  paciente_id: number;
  agentecomunitario_id: number;
  nome: string;
  numero_sus: string;
  email: string | null;
  telefone: string | null;
  data_nascimento: string;
  observacoes: string | null;
  status: "ativo" | "inativo";
}

export async function fetchPacientes(): Promise<Paciente[]> {
  const response = await apiFetch(`/pacientes/`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error(data?.message || "Erro ao buscar pacientes");
  }

  const lista = Array.isArray(data) ? data : data?.data;

  return Array.isArray(lista) ? lista : [];
}
