export interface Agendamento {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: "agendado" | "concluído" | "cancelado";
  attended: boolean;
}