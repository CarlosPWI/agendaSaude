import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Calendar, Clock, User, List, Plus } from "lucide-react";
import { Agendamento } from "../data/mockData";
import { fetchAgendamentos } from "../services/agendamentoService";

export function PlannerPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  useEffect(() => {
    fetchAgendamentos().then(setAgendamentos);
  }, []);

  // Função para obter agendamentos do dia
  const getDayAppointments = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return agendamentos
      .filter((apt) => apt.date === dateStr && apt.status !== "cancelado")
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Função para obter agendamentos da semana
  const getWeekAppointments = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dateStr = currentDay.toISOString().split("T")[0];
      const appointments = agendamentos
        .filter((apt) => apt.date === dateStr && apt.status !== "cancelado")
        .sort((a, b) => a.time.localeCompare(b.time));

      weekDays.push({
        date: currentDay,
        dateStr,
        appointments,
      });
    }
    return weekDays;
  };

  const todayAppointments = useMemo(() => getDayAppointments(selectedDate), [selectedDate, agendamentos]);
  const weekAppointments = useMemo(() => getWeekAppointments(selectedDate), [selectedDate, agendamentos]);

  // Horários disponíveis (8h às 18h)
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const getStatusColor = (appointment: Agendamento) => {
    if (appointment.status === "agendado") return "bg-blue-100 border-blue-300 text-blue-800";
    if (appointment.status === "concluído" && appointment.attended) return "bg-green-100 border-green-300 text-green-800";
    if (appointment.status === "concluído" && !appointment.attended) return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-gray-100 border-gray-300 text-gray-800";
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    const jump = viewMode === "week" ? days * 7 : days;
    newDate.setDate(selectedDate.getDate() + jump);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Planner de Agendamentos</h2>
          <p className="text-gray-600 mt-1">
            Visualização diária e semanal dos agendamentos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/dashboard/consultas")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            Lista de Consultas
          </Button>
          <Button
            onClick={() => navigate("/dashboard/novo-agendamento")}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Navegação de Data */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={() => navigateDate(-1)} variant="outline" size="sm">
                ← Anterior
              </Button>
              <Button onClick={goToToday} variant="outline" size="sm">
                Hoje
              </Button>
              <Button onClick={() => navigateDate(1)} variant="outline" size="sm">
                Próximo →
              </Button>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="w-5 h-5" />
              {viewMode === "day" ? (
                selectedDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              ) : (
                weekAppointments.length === 7 ? `${weekAppointments[0].date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} a ${weekAppointments[6].date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}` : ""
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "day" | "week")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="day">Visualização Diária</TabsTrigger>
          <TabsTrigger value="week">Visualização Semanal</TabsTrigger>
        </TabsList>

        {/* Visualização Diária */}
        <TabsContent value="day" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Agendamentos do Dia</span>
                <Badge variant="secondary">{todayAppointments.length} consultas</Badge>
              </CardTitle>
              <CardDescription>
                {selectedDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeSlots.map((timeSlot) => {
                  const appointment = todayAppointments.find((apt) => apt.time === timeSlot);

                  return (
                    <div
                      key={timeSlot}
                      className="grid grid-cols-12 gap-4 items-center py-2 border-b last:border-b-0"
                    >
                      <div className="col-span-2 flex items-center gap-2 font-medium text-gray-700">
                        <Clock className="w-4 h-4" />
                        {timeSlot}
                      </div>
                      <div className="col-span-10">
                        {appointment ? (
                          <div
                            className={`p-3 rounded-lg border-2 ${getStatusColor(appointment)}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 font-semibold">
                                  <User className="w-4 h-4" />
                                  {appointment.patientName}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant={appointment.status === "agendado" ? "default" : "secondary"}>
                                  {appointment.status}
                                </Badge>
                                <span className="text-xs text-gray-600">ID: {appointment.id}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-gray-50 text-gray-400 text-sm text-center">
                            Horário livre
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {todayAppointments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum agendamento para este dia.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visualização Semanal */}
        <TabsContent value="week" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos da Semana</CardTitle>
              <CardDescription>
                {weekAppointments[0]?.date.toLocaleDateString("pt-BR")} até{" "}
                {weekAppointments[6]?.date.toLocaleDateString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3">
                {weekAppointments.map((day, index) => {
                  const isToday =
                    day.dateStr === new Date().toISOString().split("T")[0];
                  const isSelected = day.dateStr === selectedDate.toISOString().split("T")[0];

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg overflow-hidden ${
                        isSelected ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <div
                        className={`p-3 text-center ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {day.date.toLocaleDateString("pt-BR", { weekday: "short" })}
                        </div>
                        <div className="text-lg font-bold">
                          {day.date.getDate()}
                        </div>
                        <div className="text-xs">
                          {day.date.toLocaleDateString("pt-BR", { month: "short" })}
                        </div>
                      </div>
                      <div className="p-2 bg-white min-h-[300px] space-y-2">
                        {day.appointments.length > 0 ? (
                          day.appointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={`p-2 rounded border text-xs ${getStatusColor(apt)}`}
                            >
                              <div className="font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {apt.time}
                              </div>
                              <div className="mt-1 truncate">{apt.patientName}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-400 text-xs mt-4">
                            Sem agendamentos
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 px-2 py-1 text-center border-t">
                        <span className="text-xs font-medium text-gray-600">
                          {day.appointments.length} consulta{day.appointments.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
