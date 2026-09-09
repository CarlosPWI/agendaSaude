import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";

import { format } from "date-fns";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { Badge } from "../components/ui/badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import {
  Calendar,
  Plus,
  Search,
  Clock,
  User,
  X,
  Edit,
  CheckCircle2,
  History,
  CalendarPlus,
  UserMinus,
} from "lucide-react";

import { toast } from "sonner";

import { AttendanceStats } from "../components/AttendanceStats";

import { Agendamento, RegistroAuditoria } from "../types/agendamento";

import {
  fetchAgendamentos,
  cancelAgendamento,
  fetchAgendamentoAuditoria,
} from "../services/agendamentoService";

export function AppointmentsPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Agendamento[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [searchPatientName, setSearchPatientName] = useState("");

  const [attendedFilter, setAttendedFilter] = useState<
    "all" | "attended" | "not-attended"
  >("all");

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [appointmentToCancel, setAppointmentToCancel] = useState<
    string | null
  >(null);

  const [auditDialogOpen, setAuditDialogOpen] = useState(false);

  const [auditAppointment, setAuditAppointment] =
    useState<Agendamento | null>(null);

  const [auditRecords, setAuditRecords] = useState<
    RegistroAuditoria[]
  >([]);

  const [auditLoading, setAuditLoading] = useState(false);

  async function loadAppointments() {
    try {
      setLoading(true);

      const data = await fetchAgendamentos();

      setAppointments(data);
    } catch (error) {
      toast.error("Erro ao carregar consultas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      let dateMatch = true;

      const appointmentDate = new Date(
        appointment.date + "T00:00:00"
      );

      if (searchStartDate && searchEndDate) {
        const startDate = new Date(searchStartDate + "T00:00:00");

        const endDate = new Date(searchEndDate + "T23:59:59");

        dateMatch =
          appointmentDate >= startDate &&
          appointmentDate <= endDate;
      } else if (searchStartDate) {
        const startDate = new Date(searchStartDate + "T00:00:00");

        dateMatch = appointmentDate >= startDate;
      } else if (searchEndDate) {
        const endDate = new Date(searchEndDate + "T23:59:59");

        dateMatch = appointmentDate <= endDate;
      }

      const patientMatch =
        !searchPatientName ||
        appointment.patientName
          .toLowerCase()
          .includes(searchPatientName.toLowerCase());

      const attendedMatch =
        attendedFilter === "all" ||
        (attendedFilter === "attended" &&
          appointment.status === "concluído") ||
        (attendedFilter === "not-attended" &&
          appointment.status === "agendado");

      return dateMatch && patientMatch && attendedMatch;
    });
  }, [
    appointments,
    searchStartDate,
    searchEndDate,
    searchPatientName,
    attendedFilter,
  ]);

  function handleCancelAppointment(id: string) {
    setAppointmentToCancel(id);
    setCancelDialogOpen(true);
  }

  async function confirmCancel() {
    try {
      if (!appointmentToCancel) return;

      await cancelAgendamento(appointmentToCancel);

      toast.success("Consulta cancelada com sucesso");

      setCancelDialogOpen(false);

      setAppointmentToCancel(null);

      loadAppointments();
    } catch {
      toast.error("Erro ao cancelar consulta");
    }
  }

  async function openAudit(appointment: Agendamento) {
    setAuditAppointment(appointment);
    setAuditRecords([]);
    setAuditDialogOpen(true);
    setAuditLoading(true);

    try {
      const records = await fetchAgendamentoAuditoria(
        appointment.id
      );
      setAuditRecords(records);
    } catch {
      toast.error("Erro ao carregar histórico do agendamento");
    } finally {
      setAuditLoading(false);
    }
  }

  function formatDataHora(iso: string | undefined | null) {
    if (!iso) return "";

    const date = new Date(iso);

    if (isNaN(date.getTime())) return "";

    return format(date, "dd/MM/yyyy 'às' HH:mm");
  }

  const acaoInfo: Record<
    RegistroAuditoria["acao"],
    { label: string; icon: ReactNode; classe: string }
  > = {
    criado: {
      label: "Criação",
      icon: <CalendarPlus className="w-4 h-4" />,
      classe: "bg-blue-100 text-blue-700",
    },
    atualizado: {
      label: "Alteração",
      icon: <Edit className="w-4 h-4" />,
      classe: "bg-amber-100 text-amber-700",
    },
    cancelado: {
      label: "Cancelamento",
      icon: <UserMinus className="w-4 h-4" />,
      classe: "bg-red-100 text-red-700",
    },
  };

  function clearFilters() {
    setSearchStartDate("");
    setSearchEndDate("");
    setSearchPatientName("");
    setAttendedFilter("all");
  }

  function getStatusBadge(status: string) {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive"
    > = {
      agendado: "default",
      concluído: "secondary",
      cancelado: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  }

  function getAttendanceBadge(appointment: Agendamento) {
    if (appointment.status === "concluído") {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Realizado
        </Badge>
      );
    }

    return <Badge variant="outline">Pendente</Badge>;
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        Carregando consultas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">
            Agenda de Consultas
          </h2>

          <p className="text-gray-500 mt-1">
            Gerencie todos os agendamentos
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Planner
          </Button>

          <Button
            onClick={() =>
              navigate("/dashboard/novo-agendamento")
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <AttendanceStats appointments={appointments} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtros
          </CardTitle>

          <CardDescription>
            Pesquise consultas por período ou paciente
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Data Inicial</Label>

              <Input
                type="date"
                value={searchStartDate}
                onChange={(e) =>
                  setSearchStartDate(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Data Final</Label>

              <Input
                type="date"
                value={searchEndDate}
                onChange={(e) =>
                  setSearchEndDate(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Paciente</Label>

              <Input
                placeholder="Nome do paciente"
                value={searchPatientName}
                onChange={(e) =>
                  setSearchPatientName(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Status</Label>

              <Select
                value={attendedFilter}
                onValueChange={(value: any) =>
                  setAttendedFilter(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>

                  <SelectItem value="attended">
                    Realizados
                  </SelectItem>

                  <SelectItem value="not-attended">
                    Pendentes
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchStartDate ||
            searchEndDate ||
            searchPatientName ||
            attendedFilter !== "all") && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Todas as Consultas (
            {filteredAppointments.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comparecimento</TableHead>
                <TableHead className="text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {appointment.id}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />

                      {appointment.patientName}
                    </div>
                  </TableCell>

                  <TableCell>
                    {new Date(
                      appointment.date + "T00:00:00"
                    ).toLocaleDateString("pt-BR")}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />

                      {appointment.time}
                    </div>
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(appointment.status)}
                  </TableCell>

                  <TableCell>
                    {getAttendanceBadge(appointment)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAudit(appointment)}
                      >
                        <History className="w-4 h-4 mr-1" />
                        Histórico
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(
                            `/dashboard/reagendar/${appointment.id}`
                          )
                        }
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Reagendar
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleCancelAppointment(
                            appointment.id
                          )
                        }
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma consulta encontrada
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancelar Consulta
            </AlertDialogTitle>

            <AlertDialogDescription>
              Deseja realmente cancelar esta consulta?
              O registro será mantido no histórico com status "cancelado".
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Voltar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico do agendamento
            </DialogTitle>

            <DialogDescription>
              {auditAppointment
                ? `Consulta #${auditAppointment.id} — ${auditAppointment.patientName}`
                : "Trilha de alterações da consulta"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-3">
            {auditLoading && (
              <div className="text-center py-8 text-gray-500">
                Carregando histórico...
              </div>
            )}

            {!auditLoading && auditRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum registro encontrado
              </div>
            )}

            {!auditLoading &&
              auditRecords.map((record) => {
                const info = acaoInfo[record.acao];

                const horarioRegistrado =
                  typeof record.dados?.data_hora_inicio === "string"
                    ? formatDataHora(
                        record.dados.data_hora_inicio
                      )
                    : "";

                return (
                  <div
                    key={record.auditoria_id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${info.classe}`}
                    >
                      {info.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-sm font-medium">
                          {info.label}
                        </span>

                        <span className="text-xs text-gray-500">
                          {formatDataHora(record.criado_em)}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mt-0.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />

                        {record.usuario_nome ||
                          record.usuario_email ||
                          "Usuário removido"}
                      </div>

                      {horarioRegistrado && (
                        <p className="text-xs text-gray-400 mt-1">
                          Horário registrado: {horarioRegistrado}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}