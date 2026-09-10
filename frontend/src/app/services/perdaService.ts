import { handleUnauthorized } from "./session";
import { apiFetch } from "./apiClient";

export interface RelatorioPerdaPrimaria {
  kpis: {
    marcados: number;
    compareceu: number;
    no_show: number;
    cancelados: number;
    perdas: number;
    taxa_absenteismo: number;
    taxa_comparecimento: number;
    horas_perdidas: number;
  };
  serie_diaria: {
    dia: string;
    marcados: number;
    compareceu: number;
    perdas: number;
    cancelados: number;
  }[];
  motivos: { motivo: string; qtd: number }[];
  funil: { etapa: string; total: number }[];
}

export async function fetchPerdaPrimaria(
  inicio: string,
  fim: string
): Promise<RelatorioPerdaPrimaria> {
  const params = new URLSearchParams({ inicio, fim });

  const response = await apiFetch(`/dashboard/perda-primaria?${params}`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error(data?.message || "Erro ao buscar Perda Primária");
  }

  return data?.data as RelatorioPerdaPrimaria;
}
