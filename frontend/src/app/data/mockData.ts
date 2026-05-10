export interface Agendamento {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: "agendado" | "concluído" | "cancelado";
  attended: boolean;
  observacoes?: string;
}

export const mockAgendamentos: Agendamento[] = [
  {
    id: "1",
    patientId: "P001",
    patientName: "Maria Silva",
    date: "2026-04-28",
    time: "09:00",
    status: "agendado",
    attended: false,
  },
  {
    id: "2",
    patientId: "P002",
    patientName: "Carlos Oliveira",
    date: "2026-04-28",
    time: "10:30",
    status: "agendado",
    attended: false,
  },
  {
    id: "3",
    patientId: "P003",
    patientName: "Fernanda Costa",
    date: "2026-04-29",
    time: "14:00",
    status: "agendado",
    attended: false,
  },
  {
    id: "4",
    patientId: "P004",
    patientName: "Roberto Lima",
    date: "2026-04-29",
    time: "11:00",
    status: "agendado",
    attended: false,
  },
  {
    id: "8",
    patientId: "P001",
    patientName: "Maria Silva",
    date: "2026-04-25",
    time: "10:00",
    status: "concluído",
    attended: true,
  },
  {
    id: "14",
    patientId: "P013",
    patientName: "Larissa Oliveira",
    date: "2026-04-26",
    time: "16:30",
    status: "cancelado",
    attended: false,
  },
];
