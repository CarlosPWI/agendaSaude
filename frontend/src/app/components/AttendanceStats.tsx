import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, XCircle, Calendar, AlertCircle } from "lucide-react";
import { Agendamento } from "../data/mockData";

interface AttendanceStatsProps {
  appointments: Agendamento[];
}

export function AttendanceStats({ appointments }: AttendanceStatsProps) {
  const stats = {
    total: appointments.length,
    attended: appointments.filter((apt) => apt.attended && apt.status === "concluído").length,
    notAttended: appointments.filter((apt) => !apt.attended && apt.status === "concluído").length,
    scheduled: appointments.filter((apt) => apt.status === "agendado").length,
    cancelled: appointments.filter((apt) => apt.status === "cancelado").length,
  };

  const attendanceRate = stats.total > 0 
    ? ((stats.attended / (stats.attended + stats.notAttended)) * 100).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
          <Calendar className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-gray-500 mt-1">Todas as consultas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Realizados</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.attended}</div>
          <p className="text-xs text-gray-500 mt-1">Pacientes compareceram</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Não Realizados</CardTitle>
          <XCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.notAttended}</div>
          <p className="text-xs text-gray-500 mt-1">Pacientes faltaram</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          <p className="text-xs text-gray-500 mt-1">Aguardando atendimento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Comparecimento</CardTitle>
          <AlertCircle className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {isNaN(Number(attendanceRate)) ? '0' : attendanceRate}%
          </div>
          <p className="text-xs text-gray-500 mt-1">De consultas concluídas</p>
        </CardContent>
      </Card>
    </div>
  );
}
