import { format } from "date-fns";
import { Agendamento } from "../types/agendamento";
import { handleUnauthorized } from "./session";
import { apiFetch } from "./apiClient";


function normalizeStatus(
  nome?: string
): Agendamento["status"] {
  const status = (nome || "").toLowerCase();

  if (
    ["concluído", "concluido", "realizado"].includes(
      status
    )
  ) {
    return "concluído";
  }

  if (status === "cancelado") {
    return "cancelado";
  }

  return "agendado";
}

// Converte uma linha crua da API para o contrato do frontend
function mapAgendamento(item: any): Agendamento {
  const inicio = item.data_hora_inicio
    ? new Date(item.data_hora_inicio)
    : null;

  const cancelado = Boolean(item.cancelado);

  const statusNome = cancelado
    ? "Cancelado"
    : item.statusagendamento?.nome || "Agendado";

  return {
    id: String(item.agendamento_id),
    patientId: String(item.paciente_id),
    patientName:
      item.pacientes?.nome ||
      `Paciente ${item.paciente_id}`,
    date: inicio ? format(inicio, "yyyy-MM-dd") : "",
    time: inicio ? format(inicio, "HH:mm") : "",
    status: cancelado ? "cancelado" : normalizeStatus(statusNome),
    statusNome,
    statusagendamento_id: item.statusagendamento_id,
  };
}

// Normaliza qualquer retorno da API para array
function normalizeArrayResponse(data: any): Agendamento[] {
  let lista: any[] = [];

  if (Array.isArray(data)) {
    lista = data;
  } else if (Array.isArray(data?.data)) {
    lista = data.data;
  } else if (Array.isArray(data?.agendamentos)) {
    lista = data.agendamentos;
  }

  return lista.map(mapAgendamento);
}

// Normaliza retorno de objeto único
function normalizeObjectResponse(data: any): Agendamento | null {
  if (!data) {
    return null;
  }

  const agendamento =
    data.data || data.agendamento || data;

  if (!agendamento) {
    return null;
  }

  return mapAgendamento(agendamento);
}

export async function fetchAgendamentos(): Promise<Agendamento[]> {
  const response = await apiFetch(`/agendamentos`);

  const data = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    console.error(data);
    throw new Error(data?.message || "Erro ao buscar agendamentos");
  }

  return normalizeArrayResponse(data);
}

export async function fetchAgendamentoById(
  id: string
): Promise<Agendamento> {
  const response = await apiFetch(`/agendamentos/${id}`);

  const data = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
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
  usuarioId: string;
  pacienteId: number;
  statusagendamentoId: number;
  dataHoraInicio: string;
  observacoes?: string | null;
}) {
  const response = await apiFetch(`/agendamentos`, {
    method: "POST",
    body: JSON.stringify({
      usuario_id: data.usuarioId,
      paciente_id: data.pacienteId,
      statusagendamento_id: data.statusagendamentoId,
      data_hora_inicio: data.dataHoraInicio,
      observacoes: data.observacoes || null,
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    console.error(responseData);
    throw new Error(responseData?.message || "Erro ao criar agendamento");
  }

  return normalizeObjectResponse(responseData);
}

export async function updateAgendamento(
  id: string,
  data: {
    usuarioId: string;
    pacienteId: number;
    statusagendamentoId: number;
    dataHoraInicio: string;
    observacoes?: string | null;
  }
) {
  const response = await apiFetch(`/agendamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      usuario_id: data.usuarioId,
      paciente_id: data.pacienteId,
      statusagendamento_id: data.statusagendamentoId,
      data_hora_inicio: data.dataHoraInicio,
      observacoes: data.observacoes || null,
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    console.error(responseData);
    throw new Error(responseData?.message || "Erro ao atualizar agendamento");
  }

  return normalizeObjectResponse(responseData);
}

export async function cancelAgendamento(id: string) {
  const response = await apiFetch(`/agendamentos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    handleUnauthorized(response.status);
    let errorMessage = "Erro ao cancelar agendamento";

    try {
      const data = await response.json();
      errorMessage = data?.message || errorMessage;
    } catch {}

    throw new Error(errorMessage);
  }

  return true;
}

export async function fetchAgendamentoAuditoria(
  id: string
): Promise<import("../types/agendamento").RegistroAuditoria[]> {
  const response = await apiFetch(`/agendamentos/${id}/auditoria`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    handleUnauthorized(response.status);
    throw new Error(
      data?.message || "Erro ao buscar histórico do agendamento"
    );
  }

  const lista = Array.isArray(data) ? data : data?.data;

  return Array.isArray(lista) ? lista : [];
}
