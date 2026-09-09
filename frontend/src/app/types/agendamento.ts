export interface Agendamento {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: "agendado" | "concluído" | "cancelado";
  statusNome: string;
  statusagendamento_id: number;
}

export interface RegistroAuditoria {
  auditoria_id: number;
  agendamento_id: number;
  usuario_id: string | null;
  acao: "criado" | "atualizado" | "cancelado";
  dados: Record<string, unknown> | null;
  criado_em: string;
  usuario_nome?: string | null;
  usuario_email?: string | null;
}
