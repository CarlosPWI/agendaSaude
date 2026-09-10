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
  DialogFooter,
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
  UserPlus,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

import { toast } from "sonner";

import { AttendanceStats } from "../components/AttendanceStats";
import { ListSkeleton } from "../components/ListSkeleton";

import { apiFetch } from "../services/apiClient";

import { Agendamento, RegistroAuditoria } from "../types/agendamento";
import {
  calcularRisco,
  rotuloRisco,
  REGRAS_RISCO,
} from "../utils/risco";

import {
  fetchAgendamentos,
  cancelAgendamento,
  fetchAgendamentoAuditoria,
  fetchAgendamentoById,
  createAgendamento,
} from "../services/agendamentoService";
import { fetchPacientes } from "../services/pacienteService";

export function AppointmentsPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Agendamento[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const [cancelLoading, setCancelLoading] = useState(false);

  const [auditDialogOpen, setAuditDialogOpen] = useState(false);

  const [auditAppointment, setAuditAppointment] =
    useState<Agendamento | null>(null);

  const [auditRecords, setAuditRecords] = useState<
    RegistroAuditoria[]
  >([]);

  const [auditLoading, setAuditLoading] = useState(false);

  const [riscoDialogOpen, setRiscoDialogOpen] = useState(false);

  const [contatados, setContatados] = useState<Set<string>>(
    () =>
      new Set(
        JSON.parse(
          localStorage.getItem("agenda_risco_contatados") || "[]"
        )
      )
  );

  function marcarContatado(patientId: string) {
    setContatados((prev) => {
      const novo = new Set(prev);
      novo.add(patientId);
      localStorage.setItem(
        "agenda_risco_contatados",
        JSON.stringify([...novo])
      );
      return novo;
    });
    toast.success("Marcado como contatado");
  }

  function desfazerContato(patientId: string) {
    setContatados((prev) => {
      const novo = new Set(prev);
      novo.delete(patientId);
      localStorage.setItem(
        "agenda_risco_contatados",
        JSON.stringify([...novo])
      );
      return novo;
    });
  }

  const [encaixeDialog, setEncaixeDialog] = useState<{
    aberto: boolean;
    appointmentId: string | null;
    dataHoraInicio: string;
    usuarioId: string;
    statusagendamentoId: number;
    pacienteFaltou: string;
    pacientes: { paciente_id: number; nome: string }[];
    escolhido: number | null;
    salvando: boolean;
  }>({
    aberto: false,
    appointmentId: null,
    dataHoraInicio: "",
    usuarioId: "",
    statusagendamentoId: 1,
    pacienteFaltou: "",
    pacientes: [],
    escolhido: null,
    salvando: false,
  });

  async function abrirEncaixe(appointment: Agendamento) {
    try {
      // Busca o agendamento completo (usuario_id, data_hora_inicio ISO)
      const completo = await fetchAgendamentoById(appointment.id);
      const rawId = appointment.id;

      const lista = await fetchPacientes();

      setEncaixeDialog({
        aberto: true,
        appointmentId: rawId,
        // data_hora_inicio vem em snake no objeto bruto? usamos o id e buscamos no servidor ao confirmar
        dataHoraInicio: "",
        usuarioId: "",
        statusagendamentoId: completo.statusagendamento_id,
        pacienteFaltou: appointment.patientName,
        pacientes: lista.map((p) => ({
          paciente_id: p.paciente_id,
          nome: p.nome,
        })),
        escolhido: null,
        salvando: false,
      });
    } catch {
      toast.error("Erro ao preparar o encaixe");
    }
  }

  async function confirmarEncaixe() {
    const d = encaixeDialog;

    if (!d.appointmentId || !d.escolhido) {
      toast.error("Selecione o paciente para o encaixe");
      return;
    }

    setEncaixeDialog((x) => ({ ...x, salvando: true }));

    try {
      // recupera dados completos do agendamento faltoso
      const completo = await fetchAgendamentoById(d.appointmentId);
      const resposta = await apiFetch(
        `/agendamentos/${d.appointmentId}`
      );

      const bruto = await resposta.json();

      const ag = bruto?.data || bruto;

      // 1) libera o horário (cancela o faltoso)
      await cancelAgendamento(d.appointmentId);

      // 2) cria o encaixe no mesmo horário
      await createAgendamento({
        usuarioId: ag.usuario_id,
        pacienteId: d.escolhido,
        statusagendamentoId:
          d.statusagendamentoId || ag.statusagendamento_id,
        dataHoraInicio: ag.data_hora_inicio,
        observacoes: "Encaixe sobre falta",
      });

      toast.success("Encaixe realizado no horário vago");

      setEncaixeDialog((x) => ({ ...x, aberto: false }));

      loadAppointments();
    } catch (error: any) {
      toast.error(
        error?.message || "Erro ao realizar o encaixe"
      );
    } finally {
      setEncaixeDialog((x) => ({ ...x, salvando: false }));
    }
  }

  // status que indicam paciente faltou/não veio
  const STATUS_FALTA = ["faltou", "expirado", "no_show", "não realizado", "nao realizado"];

  function ehFalta(statusNome: string): boolean {
    return STATUS_FALTA.includes(statusNome.toLowerCase());
  }

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAgendamentos();

      setAppointments(data);
    } catch {
      setError("Erro ao carregar consultas");
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

      setCancelLoading(true);

      await cancelAgendamento(appointmentToCancel);

      toast.success("Consulta cancelada com sucesso");

      setCancelDialogOpen(false);

      setAppointmentToCancel(null);

      loadAppointments();
    } catch {
      toast.error("Erro ao cancelar consulta");
    } finally {
      setCancelLoading(false);
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
      <div className="space-y-6">
        <div className="h-9 w-64 bg-accent animate-pulse rounded-md" />
        <ListSkeleton rows={8} label="Carregando consultas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />

        <p className="text-red-600">{error}</p>

        <Button variant="outline" onClick={loadAppointments}>
          Tentar novamente
        </Button>
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

        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Planner
          </Button>

          <Button
            variant="outline"
            onClick={() => setRiscoDialogOpen(true)}
            className="border-rose-300 text-rose-600 hover:bg-rose-50"
            title="Entenda o risco de falta (sistema de pontos)"
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Risco
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
              <Label htmlFor="filtro-data-inicial">
                Data Inicial
              </Label>

              <Input
                id="filtro-data-inicial"
                type="date"
                value={searchStartDate}
                onChange={(e) =>
                  setSearchStartDate(e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="filtro-data-final">
                Data Final
              </Label>

              <Input
                id="filtro-data-final"
                type="date"
                value={searchEndDate}
                onChange={(e) =>
                  setSearchEndDate(e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="filtro-paciente">
                Paciente
              </Label>

              <Input
                id="filtro-paciente"
                placeholder="Nome do paciente"
                value={searchPatientName}
                onChange={(e) =>
                  setSearchPatientName(e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="filtro-status">
                Status
              </Label>

              <Select
                value={attendedFilter}
                onValueChange={(value: any) =>
                  setAttendedFilter(value)
                }
              >
                <SelectTrigger id="filtro-status">
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
                <TableHead>Risco de falta</TableHead>
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

                  <TableCell>
                    <RiscoPaciente
                      agendamento={appointment}
                      historico={appointments}
                      contatado={contatados.has(
                        appointment.patientId
                      )}
                      onContato={() =>
                        marcarContatado(
                          appointment.patientId
                        )
                      }
                      onDesfazer={() =>
                        desfazerContato(
                          appointment.patientId
                        )
                      }
                    />
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

                      {ehFalta(appointment.statusNome) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                          onClick={() =>
                            abrirEncaixe(appointment)
                          }
                          title="Paciente faltou? Encaixe outro no horário (evita perda)"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Encaixar
                        </Button>
                      )}

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
              onClick={(e) => {
                e.preventDefault();
                confirmCancel();
              }}
              disabled={cancelLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelLoading ? "Cancelando..." : "Sim, cancelar"}
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

      {/* Legenda do risco gamificado */}
      <Dialog
        open={riscoDialogOpen}
        onOpenChange={setRiscoDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Risco de falta — sistema de pontos
            </DialogTitle>
            <DialogDescription>
              Como o risco de cada consulta é calculado (gamificado),
              para o operador priorizar contatos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <table className="w-full text-sm">
              <tbody>
                {REGRAS_RISCO.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">{r.fator}</td>
                    <td className="py-2 text-right font-semibold text-slate-800">
                      {r.pontos} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Baixo 0–39
              </span>
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                Médio 40–69
              </span>
              <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700">
                Alto 70–100
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              💡 Ao marcar um paciente como <strong>contatado</strong>,
              o selo é marcado com ✓ para a sessão atual — o operador
              confirma que já avisou o paciente sobre a consulta.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de encaixe (substitui falta por outro paciente) */}
      <Dialog
        open={encaixeDialog.aberto}
        onOpenChange={(aberto) =>
          setEncaixeDialog((d) => ({ ...d, aberto }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Substituir por Encaixe
            </DialogTitle>
            <DialogDescription>
              O paciente <strong>{encaixeDialog.pacienteFaltou}</strong>{" "}
              não compareceu. Encaixe outro paciente no mesmo horário
              (evita a perda do slot).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Paciente para o encaixe
            </label>
            <select
              value={encaixeDialog.escolhido ?? ""}
              onChange={(e) =>
                setEncaixeDialog((d) => ({
                  ...d,
                  escolhido: Number(e.target.value),
                }))
              }
              className="w-full border rounded-md px-3 py-2 dark:bg-slate-900"
            >
              <option value="">Selecione um paciente…</option>
              {encaixeDialog.pacientes.map((p) => (
                <option key={p.paciente_id} value={p.paciente_id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEncaixeDialog((d) => ({ ...d, aberto: false }))
              }
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarEncaixe}
              disabled={encaixeDialog.salvando || !encaixeDialog.escolhido}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {encaixeDialog.salvando
                ? "Encaixando..."
                : "Confirmar encaixe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
// Selo de risco de falta por consulta, com ação do operador
function RiscoPaciente({
  agendamento,
  historico,
  contatado,
  onContato,
  onDesfazer,
}: {
  agendamento: Agendamento;
  historico: Agendamento[];
  contatado: boolean;
  onContato: () => void;
  onDesfazer: () => void;
}) {
  const { pontos, nivel } = calcularRisco(historico, agendamento);

  if (contatado) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-xs">
          <CheckCircle2 className="w-3 h-3" /> Contatado
        </span>
        <button
          onClick={onDesfazer}
          className="text-[10px] text-slate-400 underline"
          title="Desfazer contato"
        >
          desfazer
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        title={`${nivel.texto} · ${rotuloRisco(pontos)} · clique para marcar como contatado`}
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${nivel.cor}`}
      >
        {rotuloRisco(pontos)}
      </span>

      {pontos >= 40 && (
        <button
          onClick={onContato}
          className="text-[10px] text-blue-600 underline whitespace-nowrap"
          title="Marcar paciente como contatado"
        >
          contato feito?
        </button>
      )}
    </div>
  );
}
