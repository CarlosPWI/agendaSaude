import { Agendamento } from "../types/agendamento";

const API_URL = import.meta.env.VITE_API_URL;

function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// Normaliza qualquer retorno da API para array
function normalizeArrayResponse(data: any): Agendamento[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.agendamentos)) {
    return data.agendamentos;
  }

  return [];
}

// Normaliza retorno de objeto único
function normalizeObjectResponse(data: any): Agendamento | null {
  if (!data) {
    return null;
  }

  if (data.data) {
    return data.data;
  }

  if (data.agendamento) {
    return data.agendamento;
  }

  return data;
}

export async function fetchAgendamentos(): Promise<Agendamento[]> {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error(data?.message || "Erro ao buscar agendamentos");
  }

  return normalizeArrayResponse(data);
}

export async function fetchAgendamentoById(
  id: string
): Promise<Agendamento> {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error(data?.message || "Agendamento não encontrado");
  }

  const agendamento = normalizeObjectResponse(data);

  if (!agendamento) {
    throw new Error("Agendamento inválido");
  }

  return agendamento;
}

export async function createAgendamento(data: {
  patientId: string;
  patientName: string;
  date: string;
  time: string;
}) {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error(responseData);
    throw new Error(responseData?.message || "Erro ao criar agendamento");
  }

  return normalizeObjectResponse(responseData);
}

export async function updateAgendamento(
  id: string,
  data: {
    date: string;
    time: string;
  }
) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error(responseData);
    throw new Error(responseData?.message || "Erro ao atualizar agendamento");
  }

  return normalizeObjectResponse(responseData);
}

export async function cancelAgendamento(id: string) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    let errorMessage = "Erro ao cancelar agendamento";

    try {
      const data = await response.json();
      errorMessage = data?.message || errorMessage;
    } catch {}

    throw new Error(errorMessage);
  }

  return true;
}