import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import { fetchAgendamentos } from "../services/agendamentoService";

import { Button } from "../components/ui/button";

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

interface Agendamento {
  id: string;

  data: string;

  horario: string;

  status: string;

  pacienteNome: string;
}

export function PlannerPage() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(
    new Date()
  );

  const [viewMode, setViewMode] = useState<
    "day" | "week"
  >("day");

  const [agendamentos, setAgendamentos] = useState<
    Agendamento[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  async function carregarAgendamentos() {
    try {
      setLoading(true);

      const response = await fetchAgendamentos();

      const lista =
        response?.data ||
        response?.agendamentos ||
        response ||
        [];

      const agendamentosFormatados = lista.map(
        (item: any) => {
          const dataInicio = new Date(
            item.data_hora_inicio
          );

          return {
            id: String(item.agendamento_id),

            data: format(
              dataInicio,
              "yyyy-MM-dd"
            ),

            horario: format(
              dataInicio,
              "HH:mm"
            ),

            status:
              item.statusagendamento?.nome ||
              "Agendado",

            pacienteNome:
              item.pacientes?.nome ||
              `Paciente ${item.paciente_id}`,
          };
        }
      );

      setAgendamentos(
        agendamentosFormatados
      );
    } catch {
      setError(
        "Erro ao carregar agendamentos"
      );
    } finally {
      setLoading(false);
    }
  }

  const timeSlots = Array.from(
    { length: 11 },
    (_, i) => {
      const hour = i + 8;

      return `${hour
        .toString()
        .padStart(2, "0")}:00`;
    }
  );

  function getDayAppointments(date: Date) {
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

  function getWeekAppointments(date: Date) {
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
            getDayAppointments(currentDay),
        };
      }
    );
  }

  const todayAppointments = useMemo(() => {
    return getDayAppointments(selectedDate);
  }, [selectedDate, agendamentos]);

  const weekAppointments = useMemo(() => {
    return getWeekAppointments(selectedDate);
  }, [selectedDate, agendamentos]);

  function handlePreviousDay() {
    const previous = new Date(
      selectedDate
    );

    previous.setDate(
      previous.getDate() -
        (viewMode === "week" ? 7 : 1)
    );

    setSelectedDate(previous);
  }

  function handleNextDay() {
    const next = new Date(selectedDate);

    next.setDate(
      next.getDate() +
        (viewMode === "week" ? 7 : 1)
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
        appointment.horario === time
    );
  }

  function getStatusColor(
    status: string
  ) {
    switch (
      status?.toLowerCase()
    ) {
      case "concluido":
      case "concluído":
        return "bg-green-100 border-green-300";

      case "cancelado":
        return "bg-red-100 border-red-300";

      default:
        return "bg-blue-100 border-blue-300";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Carregando agendamentos...
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
            Visualize seus agendamentos
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
                onClick={handlePreviousDay}
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
                onClick={handleNextDay}
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={viewMode}
        onValueChange={(value) =>
          setViewMode(
            value as "day" | "week"
          )
        }
      >
        <TabsList>
          <TabsTrigger value="day">
            Visualização Diária
          </TabsTrigger>

          <TabsTrigger value="week">
            Visualização Semanal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <div className="space-y-2">
            {timeSlots.map((slot) => {
              const appointment =
                getAppointmentByTime(slot);

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
                      ) : (
                        <div className="flex-1 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                          Horário livre
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="week">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {weekAppointments.map((day) => (
              <Card
                key={day.date.toISOString()}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm capitalize">
                    {format(
                      day.date,
                      "EEE dd/MM",
                      {
                        locale: ptBR,
                      }
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  {day.appointments.length ===
                    0 && (
                    <div className="text-sm text-muted-foreground">
                      Sem agendamentos
                    </div>
                  )}

                  {day.appointments.map(
                    (appointment) => (
                      <div
                        key={appointment.id}
                        className={`rounded-lg border p-2 text-sm ${getStatusColor(
                          appointment.status
                        )}`}
                      >
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
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}