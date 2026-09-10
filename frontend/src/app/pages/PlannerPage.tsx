import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import {
  format,
  addDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flag,
  Plus,
  Pencil,
  AlertCircle,
  Search,
  Download,
} from "lucide-react";

import { toast } from "sonner";
import { handleUnauthorized } from "../services/session";

import { fetchAgendamentos } from "../services/agendamentoService";

import { HORARIOS_DISPONIVEIS } from "../constants/horarios";
import { feriadoNa } from "../constants/feriados";

import { Button } from "../components/ui/button";
import { ListSkeleton } from "../components/ListSkeleton";

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

import { apiFetch } from "../services/apiClient";

import {
  fetchOcupacoes,
  criarOcupacao,
  removerOcupacao,
  OcupacaoSlot,
  TipoOcupacao,
  tituloPadrao,
} from "../services/ocupacaoService";

interface Agendamento {
  id: string;

  data: string;

  horario: string;

  status: string;

  statusagendamento_id: number;

  pacienteNome: string;
}

export function PlannerPage() {
  const navigate = useNavigate();

  const apiUrl =
    import.meta.env.VITE_API_URL;

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [viewMode, setViewMode] = useState<
    "day" | "week" | "month"
  >("day");

  // Cliente escolhe se quer ver os feriados nacionais na agenda
  const [mostrarFeriados, setMostrarFeriados] =
    useState(true);

  // Busca por nome de paciente na agenda
  const [buscaPaciente, setBuscaPaciente] =
    useState("");

  const [agendamentos, setAgendamentos] =
    useState<Agendamento[]>([]);

  const [ocupacoes, setOcupacoes] = useState<
    OcupacaoSlot[]
  >([]);

  const [loadingOcupacao, setLoadingOcupacao] =
    useState<string | null>(null);

  const [ocuparDialog, setOcuparDialog] = useState<{
    aberto: boolean;
    data: string;
    horario: string;
    tipo: TipoOcupacao;
    titulo: string;
    observacoes: string;
  }>({
    aberto: false,
    data: "",
    horario: "",
    tipo: "bloqueio",
    titulo: "",
    observacoes: "",
  });

  const [statusList, setStatusList] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  // Confirmação antes de liberar um horário ocupado
  const [liberarDialog, setLiberarDialog] =
    useState<{
      aberto: boolean;
      ocupacao: OcupacaoSlot | null;
    }>({ aberto: false, ocupacao: null });

  const [error, setError] =
    useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    await Promise.all([
      carregarAgendamentos(),
      fetchStatusAgendamento(),
      carregarOcupacoes(),
    ]);
  }

  async function carregarOcupacoes() {
    try {
      const lista = await fetchOcupacoes();
      setOcupacoes(lista);
    } catch (error) {
      console.error(error);
    }
  }

  // Ocupa um horário livre (reunião/grupo/bloqueio)
  async function ocuparSlot(
    data: string,
    horario: string,
    tipo: TipoOcupacao
  ) {
    const dataHoraInicio = `${data}T${horario}:00`;

    try {
      setLoadingOcupacao(`${data}-${horario}`);

      await criarOcupacao({
        data_hora_inicio: dataHoraInicio,
        tipo,
      });

      toast.success(
        tipo === "reuniao"
          ? "Reunião marcada"
          : tipo === "grupo"
          ? "Grupo de atendimento criado"
          : "Horário bloqueado"
      );

      await carregarOcupacoes();
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao ocupar o horário"
      );
    } finally {
      setLoadingOcupacao(null);
    }
  }

  // Libera um horário ocupado
  async function liberarSlot(ocupacao: OcupacaoSlot) {
    try {
      setLoadingOcupacao(ocupacao.id);

      await removerOcupacao(ocupacao.id);

      toast.success("Horário liberado");

      await carregarOcupacoes();
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao liberar o horário"
      );
    } finally {
      setLoadingOcupacao(null);
    }
  }

  // Abre o popup de configuração da ocupação (estilo Google Agenda)
  function abrirOcupar(
    data: string,
    horario: string,
    tipo: TipoOcupacao
  ) {
    setOcuparDialog({
      aberto: true,
      data,
      horario,
      tipo,
      titulo: tituloPadrao(tipo),
      observacoes: "",
    });
  }

  // Confirma a ocupação com os dados preenchidos no popup
  async function confirmarOcupar() {
    const { data, horario, tipo, titulo, observacoes } =
      ocuparDialog;

    try {
      setLoadingOcupacao(`${data}-${horario}`);

      await criarOcupacao({
        data_hora_inicio: `${data}T${horario}:00`,
        tipo,
        titulo: titulo.trim() || tituloPadrao(tipo),
        observacoes,
      });

      toast.success("Ocupação salva");

      setOcuparDialog((d) => ({
        ...d,
        aberto: false,
      }));

      await carregarOcupacoes();
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao salvar a ocupação"
      );
    } finally {
      setLoadingOcupacao(null);
    }
  }

  async function fetchStatusAgendamento() {
    try {
      const token =
        localStorage.getItem("token");

      const response = await apiFetch(
        `${apiUrl}/statusagendamento/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      handleUnauthorized(response.status);

      setStatusList(
        data.data || data
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Erro ao carregar status"
      );
    }
  }

  async function carregarAgendamentos() {
    try {
      setLoading(true);

      const lista =
        await fetchAgendamentos();

      const agendamentosFormatados =
        lista.map((item) => ({
          id: item.id,

          data: item.date,

          horario: item.time,

          status: item.statusNome,

          statusagendamento_id:
            item.statusagendamento_id,

          pacienteNome:
            item.patientName,
        }));

      setAgendamentos(
        agendamentosFormatados
      );
    } catch (error) {
      console.error(error);

      setError(
        "Erro ao carregar agendamentos"
      );
    } finally {
      setLoading(false);
    }
  }

  const timeSlots = HORARIOS_DISPONIVEIS;

  function getDayAppointments(
    date: Date
  ) {
    const formattedDate = format(
      date,
      "yyyy-MM-dd"
    );

    const termo = buscaPaciente
      .trim()
      .toLowerCase();

    return agendamentos.filter(
      (agendamento) =>
        agendamento.data === formattedDate &&
        (!termo ||
          agendamento.pacienteNome
            .toLowerCase()
            .includes(termo))
    );
  }

  function getWeekAppointments(
    date: Date
  ) {
    const weekStart = startOfWeek(date, {
      weekStartsOn: 0,
    });

    return Array.from(
      { length: 7 },
      (_, index) => {
        const currentDay = addDays(
          weekStart,
          index
        );

        return {
          date: currentDay,
          appointments:
            getDayAppointments(
              currentDay
            ),
        };
      }
    );
  }

  const todayAppointments =
    useMemo(() => {
      return getDayAppointments(
        selectedDate
      );
    }, [
      selectedDate,
      agendamentos,
      buscaPaciente,
    ]);

  const weekAppointments =
    useMemo(() => {
      return getWeekAppointments(
        selectedDate
      );
    }, [
      selectedDate,
      agendamentos,
      buscaPaciente,
    ]);

  const monthDays = useMemo(() => {
    const inicio = startOfWeek(
      startOfMonth(selectedDate),
      { weekStartsOn: 0 }
    );

    const fim = endOfWeek(
      endOfMonth(selectedDate),
      { weekStartsOn: 0 }
    );

    return eachDayOfInterval({
      start: inicio,
      end: fim,
    }).map((date) => ({
      date,
      appointments:
        getDayAppointments(date),
    }));
  }, [selectedDate, agendamentos, buscaPaciente]);

  function handlePreviousDay() {
    if (viewMode === "month") {
      setSelectedDate(
        addMonths(selectedDate, -1)
      );
      return;
    }

    const previous = new Date(
      selectedDate
    );

    previous.setDate(
      previous.getDate() -
        (viewMode === "week"
          ? 7
          : 1)
    );

    setSelectedDate(previous);
  }

  function handleNextDay() {
    if (viewMode === "month") {
      setSelectedDate(
        addMonths(selectedDate, 1)
      );
      return;
    }

    const next = new Date(
      selectedDate
    );

    next.setDate(
      next.getDate() +
        (viewMode === "week"
          ? 7
          : 1)
    );

    setSelectedDate(next);
  }

  function handleToday() {
    setSelectedDate(new Date());
  }

  // Exporta a visualização atual (dia/semana/mês) em CSV
  function exportarAgenda() {
    const linhas =
      viewMode === "day"
        ? todayAppointments
        : viewMode === "week"
        ? weekAppointments.flatMap(
            (d) => d.appointments
          )
        : monthDays.flatMap(
            (d) => d.appointments
          );

    if (linhas.length === 0) {
      toast.error(
        "Nada para exportar nesta visualização"
      );

      return;
    }

    const escapar = (valor: string) =>
      `"${(valor ?? "").replace(/"/g, '""')}"`;

    const csv = [
      ["Data", "Horário", "Paciente", "Status"]
        .map(escapar)
        .join(";"),

      ...linhas.map((a) =>
        [
          a.data,
          a.horario,
          a.pacienteNome,
          a.status,
        ]
          .map(escapar)
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `agenda-${format(
      selectedDate,
      "yyyy-MM-dd"
    )}.csv`;
    link.click();

    URL.revokeObjectURL(url);

    toast.success("Agenda exportada");
  }

  function getAppointmentByTime(
    time: string
  ) {
    return todayAppointments.find(
      (appointment) =>
        appointment.horario ===
        time
    );
  }

  function getOcupacaoByDateAndTime(
    data: string,
    time: string
  ) {
    return ocupacoes.find(
      (o) =>
        o.data === data &&
        o.horario === time
    );
  }

  const estiloOcupacao: Record<
    TipoOcupacao,
    string
  > = {
    reuniao:
      "bg-yellow-50 border-l-4 border-yellow-500",
    grupo:
      "bg-blue-50 border-l-4 border-blue-500",
    bloqueio:
      "bg-slate-100 border-l-4 border-slate-400",
  };

  function handleEditAppointment(
    id: string
  ) {
    navigate(
      `/dashboard/reagendar/${id}`
    );
  }

  async function handleUpdateStatus(
    agendamentoId: string,
    statusId: number
  ) {
    try {
      const token =
        localStorage.getItem("token");

      /*
        Busca agendamento atual
      */

      const responseAgendamento =
        await apiFetch(
          `${apiUrl}/agendamentos/${agendamentoId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const agendamentoData =
        await responseAgendamento.json();

      const agendamento =
        agendamentoData.data ||
        agendamentoData;

      if (!responseAgendamento.ok) {
        handleUnauthorized(responseAgendamento.status);

        throw new Error(
          "Erro ao buscar agendamento"
        );
      }

      /*
        Payload completo
      */

      const payload = {
        usuario_id:
          agendamento.usuario_id,

        paciente_id:
          agendamento.paciente_id,

        statusagendamento_id:
          statusId,

        data_hora_inicio:
          agendamento.data_hora_inicio,

        data_hora_fim:
          agendamento.data_hora_fim,

        observacoes:
          agendamento.observacoes,
      };

      /*
        Atualiza agendamento
      */

      const response = await apiFetch(
        `${apiUrl}/agendamentos/${agendamentoId}/`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        handleUnauthorized(response.status);

        throw new Error(
          data.message ||
            data.detail?.[0]?.msg ||
            data.detail ||
            "Erro ao atualizar status"
        );
      }

      toast.success(
        "Status atualizado"
      );

      carregarAgendamentos();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao atualizar status"
      );
    }
  }

  function getStatusColor(
    status: string
  ) {
    switch (
      status?.toLowerCase()
    ) {
      case "realizado":
      case "concluido":
      case "concluído":
        return "bg-green-100 border-green-300";

      case "não realizado":
        return "bg-orange-100 border-orange-300";

      case "cancelado":
        return "bg-red-100 border-red-300";

      case "reagendado":
        return "bg-purple-100 border-purple-300";

      default:
        return "bg-blue-100 border-blue-300";
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-40 bg-accent animate-pulse rounded-md" />
        <ListSkeleton rows={7} label="Carregando agendamentos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />

        <p className="text-red-500">{error}</p>

        <Button
          variant="outline"
          onClick={carregarDados}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Planner
          </h1>

          <p className="text-muted-foreground">
            Visualize seus
            agendamentos
          </p>
        </div>

        <Button
          onClick={() =>
            navigate(
              "/dashboard/novo-agendamento"
            )
          }
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />

          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={
                  handlePreviousDay
                }
                aria-label="Período anterior"
                title="Período anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                onClick={handleToday}
              >
                Hoje
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={
                  handleNextDay
                }
                aria-label="Próximo período"
                title="Próximo período"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />

              <span className="font-medium capitalize">
                {viewMode === "month"
                  ? format(
                      selectedDate,
                      "MMMM 'de' yyyy",
                      {
                        locale: ptBR,
                      }
                    )
                  : format(
                      selectedDate,
                      "EEEE, dd 'de' MMMM 'de' yyyy",
                      {
                        locale: ptBR,
                      }
                    )}
              </span>

              {mostrarFeriados &&
                feriadoNa(selectedDate) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-xs font-semibold">
                  🎌 {feriadoNa(selectedDate)?.nome}
                </span>
              )}

              <Button
                variant={
                  mostrarFeriados
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  setMostrarFeriados((v) => !v)
                }
                title={
                  mostrarFeriados
                    ? "Ocultar feriados nacionais"
                    : "Mostrar feriados nacionais"
                }
                className="flex items-center gap-2"
              >
                <Flag className="w-4 h-4" />

                {mostrarFeriados
                  ? "Feriados: ativado"
                  : "Feriados: desativado"}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1 min-w-[220px]">
              <label htmlFor="planner-busca" className="sr-only">
                Buscar paciente
              </label>

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <input
                id="planner-busca"
                type="search"
                value={buscaPaciente}
                onChange={(e) =>
                  setBuscaPaciente(e.target.value)
                }
                placeholder="Buscar paciente na agenda..."
                className="w-full border rounded-md pl-9 pr-3 py-2 dark:bg-slate-900"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportarAgenda}
              className="flex items-center gap-2"
              title="Exportar a agenda atual em CSV"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={viewMode}
        onValueChange={(value) =>
          setViewMode(
            value as
              | "day"
              | "week"
              | "month"
          )
        }
      >
        <TabsList>
          <TabsTrigger value="day">
            Visualização
            Diária
          </TabsTrigger>

          <TabsTrigger value="week">
            Visualização
            Semanal
          </TabsTrigger>

          <TabsTrigger value="month">
            Visualização
            Mensal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <div className="space-y-2">
            {timeSlots.map((slot) => {
              const appointment =
                getAppointmentByTime(
                  slot
                );

              return (
                <Card key={slot}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-muted-foreground">
                        {slot}
                      </div>

                      {appointment ? (
                        <div
                          className={`flex-1 rounded-lg border p-3 ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold">
                                {
                                  appointment.pacienteNome
                                }
                              </p>

                              <p className="text-sm text-muted-foreground">
                                Status:{" "}
                                {
                                  appointment.status
                                }
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[180px]">
                              <select
                                aria-label={`Status do agendamento de ${appointment.pacienteNome}`}
                                value={String(
                                  appointment.statusagendamento_id
                                )}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    appointment.id,
                                    Number(
                                      e.target
                                        .value
                                    )
                                  )
                                }
                                className="border rounded-md px-2 py-1 text-sm dark:bg-slate-900"
                              >
                                {statusList.map(
                                  (
                                    status: any
                                  ) => {
                                    const statusId =
                                      status.id ||
                                      status.statusagendamento_id;

                                    const statusNome =
                                      status.nome ||
                                      status.descricao;

                                    return (
                                      <option
                                        key={
                                          statusId
                                        }
                                        value={String(
                                          statusId
                                        )}
                                      >
                                        {
                                          statusNome
                                        }
                                      </option>
                                    );
                                  }
                                )}
                              </select>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleEditAppointment(
                                    appointment.id
                                  )
                                }
                                className="flex items-center gap-2"
                              >
                                <Pencil className="w-4 h-4" />

                                Alterar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (() => {
                        const dataDoDia = format(
                          selectedDate,
                          "yyyy-MM-dd"
                        );

                        const ocupacao =
                          getOcupacaoByDateAndTime(
                            dataDoDia,
                            slot
                          );

                        if (ocupacao) {
                          return (
                            <div
                              className={`flex-1 rounded-lg border p-3 ${estiloOcupacao[ocupacao.tipo]}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                                    {ocupacao.titulo}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {ocupacao.tipo === "reuniao"
                                      ? "Reunião"
                                      : ocupacao.tipo === "grupo"
                                      ? "Grupo de Atendimento"
                                      : "Bloqueado"}
                                  </p>
                                  {ocupacao.observacoes && (
                                    <p
                                      className="text-xs italic text-slate-500 mt-1 line-clamp-2"
                                      title={ocupacao.observacoes}
                                    >
                                      {ocupacao.observacoes}
                                    </p>
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={
                                    loadingOcupacao ===
                                    ocupacao.id
                                  }
                                  onClick={() =>
                                    setLiberarDialog({
                                      aberto: true,
                                      ocupacao,
                                    })
                                  }
                                  title="Liberar horário"
                                >
                                  🔓 Liberar
                                </Button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="flex-1 rounded-lg border border-dashed p-2 text-sm text-muted-foreground flex items-center justify-between gap-2">
                            <span>Horário livre</span>

                            <div className="flex gap-1">
                              <button
                                className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                title="Configurar reunião"
                                onClick={() =>
                                  abrirOcupar(
                                    dataDoDia,
                                    slot,
                                    "reuniao"
                                  )
                                }
                              >
                                📅 Reunião
                              </button>
                              <button
                                className="px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-700 hover:bg-blue-200"
                                title="Configurar grupo"
                                onClick={() =>
                                  abrirOcupar(
                                    dataDoDia,
                                    slot,
                                    "grupo"
                                  )
                                }
                              >
                                👥 Grupo
                              </button>
                              <button
                                className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-700 hover:bg-slate-300"
                                title="Bloquear horário"
                                onClick={() =>
                                  abrirOcupar(
                                    dataDoDia,
                                    slot,
                                    "bloqueio"
                                  )
                                }
                              >
                                🔒 Bloquear
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="week">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {weekAppointments.map(
              (day) => (
                <Card
                  key={day.date.toISOString()}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">
                      {format(
                        day.date,
                        "EEE dd/MM",
                        {
                          locale:
                            ptBR,
                        }
                      )}
                      {mostrarFeriados &&
                        feriadoNa(day.date) && (
                        <span title={feriadoNa(day.date)?.nome}>
                          {" "}🎌
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {day
                      .appointments
                      .length ===
                      0 && (
                      <div className="text-sm text-muted-foreground">
                        Sem
                        agendamentos
                      </div>
                    )}

                    {day.appointments.map(
                      (
                        appointment
                      ) => (
                        <div
                          key={
                            appointment.id
                          }
                          className={`rounded-lg border p-2 text-sm ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium">
                                {
                                  appointment.pacienteNome
                                }
                              </p>

                              <p className="text-xs">
                                {
                                  appointment.horario
                                }
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {
                                  appointment.status
                                }
                              </p>
                            </div>

                            <select
                              aria-label={`Status do agendamento de ${appointment.pacienteNome}`}
                              value={String(
                                appointment.statusagendamento_id
                              )}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  appointment.id,
                                  Number(
                                    e.target
                                      .value
                                  )
                                )
                              }
                              className="w-full border rounded-md px-2 py-1 text-xs dark:bg-slate-900"
                            >
                              {statusList.map(
                                (
                                  status: any
                                ) => {
                                  const statusId =
                                    status.id ||
                                    status.statusagendamento_id;

                                  const statusNome =
                                    status.nome ||
                                    status.descricao;

                                  return (
                                    <option
                                      key={
                                        statusId
                                      }
                                      value={String(
                                        statusId
                                      )}
                                    >
                                      {
                                        statusNome
                                      }
                                    </option>
                                  );
                                }
                              )}
                            </select>

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full flex items-center gap-2"
                              onClick={() =>
                                handleEditAppointment(
                                  appointment.id
                                )
                              }
                            >
                              <Pencil className="w-3 h-3" />

                              Alterar
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="month">
          <Card>
            <CardContent className="p-3 overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 mb-2 min-w-[640px]">
                {[
                  "Dom",
                  "Seg",
                  "Ter",
                  "Qua",
                  "Qui",
                  "Sex",
                  "Sáb",
                ].map((dia) => (
                  <div
                    key={dia}
                    className="text-center text-xs font-semibold text-muted-foreground py-1"
                  >
                    {dia}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 min-w-[640px]">
                {monthDays.map((day) => {
                  const doMes = isSameMonth(
                    day.date,
                    selectedDate
                  );

                  const selecionado = isSameDay(
                    day.date,
                    selectedDate
                  );

                  const hoje = isToday(day.date);

                  const feriado = feriadoNa(
                    day.date
                  );

                  return (
                    <button
                      key={day.date.toISOString()}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setViewMode("day");
                      }}
                      title={
                        feriado
                          ? feriado.nome
                          : undefined
                      }
                      className={`min-h-[72px] sm:min-h-[92px] rounded-lg border p-2 text-left align-top transition hover:border-primary hover:bg-accent ${
                        selecionado
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border"
                      } ${
                        doMes ? "" : "opacity-40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            hoje
                              ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                              : ""
                          }`}
                        >
                          {format(day.date, "d")}
                        </span>

                        {mostrarFeriados &&
                          feriado && (
                          <span>🎌</span>
                        )}
                      </div>

                      {day.appointments.length >
                        0 && (
                        <div className="mt-1 space-y-0.5">
                          {day.appointments
                            .slice(0, 3)
                            .map((a) => (
                              <div
                                key={a.id}
                                className={`truncate rounded px-1 py-0.5 text-[10px] ${getStatusColor(
                                  a.status
                                )}`}
                                title={`${a.horario} ${a.pacienteNome}`}
                              >
                                {a.horario}{" "}
                                {a.pacienteNome}
                              </div>
                            ))}

                          {day.appointments.length >
                            3 && (
                            <div className="text-[10px] text-muted-foreground">
                              +
                              {day.appointments
                                .length - 3}{" "}
                              mais
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Popup de configuração da ocupação (estilo Google Agenda) */}
      <Dialog
        open={ocuparDialog.aberto}
        onOpenChange={(aberto) =>
          setOcuparDialog((d) => ({ ...d, aberto }))
        }
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ocupar horário</DialogTitle>
            <DialogDescription>
              {ocuparDialog.data && ocuparDialog.horario
                ? `Configurar ${format(
                    new Date(
                      `${ocuparDialog.data}T${ocuparDialog.horario}:00`
                    ),
                    "dd/MM/yyyy 'às' HH:mm"
                  )}`
                : "Configure os detalhes"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="ocupacao-tipo"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Tipo
              </label>
              <select
                id="ocupacao-tipo"
                value={ocuparDialog.tipo}
                onChange={(e) =>
                  setOcuparDialog((d) => ({
                    ...d,
                    tipo: e.target.value as TipoOcupacao,
                  }))
                }
                className="w-full border rounded-md px-3 py-2 dark:bg-slate-900"
              >
                <option value="reuniao">📅 Reunião de Equipe</option>
                <option value="grupo">👥 Grupo de Atendimento</option>
                <option value="bloqueio">🔒 Horário Bloqueado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ocupacao-titulo"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Título
              </label>
              <input
                id="ocupacao-titulo"
                type="text"
                value={ocuparDialog.titulo}
                onChange={(e) =>
                  setOcuparDialog((d) => ({
                    ...d,
                    titulo: e.target.value,
                  }))
                }
                placeholder="Ex.: Reunião de equipe"
                className="w-full border rounded-md px-3 py-2 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ocupacao-observacoes"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Observações
              </label>
              <textarea
                id="ocupacao-observacoes"
                rows={4}
                value={ocuparDialog.observacoes}
                onChange={(e) =>
                  setOcuparDialog((d) => ({
                    ...d,
                    observacoes: e.target.value,
                  }))
                }
                placeholder="Descreva detalhes do evento (pauta, participantes, justificativa do bloqueio...)"
                className="w-full border rounded-md px-3 py-2 dark:bg-slate-900 resize-none"
              />
              <p className="text-xs text-slate-400">
                Duração de 30 minutos (slot).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setOcuparDialog((d) => ({ ...d, aberto: false }))
              }
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarOcupar}
              disabled={
                loadingOcupacao ===
                `${ocuparDialog.data}-${ocuparDialog.horario}`
              }
            >
              {loadingOcupacao ===
              `${ocuparDialog.data}-${ocuparDialog.horario}`
                ? "Salvando..."
                : "Salvar ocupação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação ao liberar um horário ocupado */}
      <AlertDialog
        open={liberarDialog.aberto}
        onOpenChange={(aberto) =>
          setLiberarDialog((d) => ({ ...d, aberto }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Liberar horário?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {liberarDialog.ocupacao
                ? `"${liberarDialog.ocupacao.titulo}" será removido e o horário voltará a ficar livre.`
                : "O horário voltará a ficar livre."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();

                const ocupacao =
                  liberarDialog.ocupacao;

                setLiberarDialog({
                  aberto: false,
                  ocupacao: null,
                });

                if (ocupacao) {
                  liberarSlot(ocupacao);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, liberar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}