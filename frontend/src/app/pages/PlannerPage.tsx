import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
} from "lucide-react";

import { toast } from "sonner";
import { handleUnauthorized } from "../services/session";

import { fetchAgendamentos } from "../services/agendamentoService";

import { HORARIOS_DISPONIVEIS } from "../constants/horarios";
import { feriadoNa } from "../constants/feriados";

import { Button } from "../components/ui/button";

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
    "day" | "week"
  >("day");

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

    return agendamentos.filter(
      (agendamento) =>
        agendamento.data ===
        formattedDate
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
    ]);

  const weekAppointments =
    useMemo(() => {
      return getWeekAppointments(
        selectedDate
      );
    }, [
      selectedDate,
      agendamentos,
    ]);

  function handlePreviousDay() {
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
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Carregando
          agendamentos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">
          {error}
        </p>
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
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />

              <span className="font-medium capitalize">
                {format(
                  selectedDate,
                  "EEEE, dd 'de' MMMM 'de' yyyy",
                  {
                    locale: ptBR,
                  }
                )}
              </span>

              {feriadoNa(selectedDate) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-xs font-semibold">
                  🎌 {feriadoNa(selectedDate)?.nome}
                </span>
              )}
            </div>
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
                                    liberarSlot(
                                      ocupacao
                                    )
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
                      {feriadoNa(day.date) && (
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo
              </label>
              <select
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Título
              </label>
              <input
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Observações
              </label>
              <textarea
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
    </div>
  );
}