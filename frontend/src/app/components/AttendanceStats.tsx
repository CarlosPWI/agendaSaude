import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

import {
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { Agendamento } from "../types/agendamento";

interface AttendanceStatsProps {
  appointments: Agendamento[];
}

export function AttendanceStats({
  appointments,
}: AttendanceStatsProps) {
  const total = appointments.length;

  const attended = appointments.filter(
    (a) => a.status === "concluído"
  ).length;

  const scheduled = appointments.filter(
    (a) => a.status === "agendado"
  ).length;

  const cancelled = appointments.filter(
    (a) => a.status === "cancelado"
  ).length;

  const attendanceRate =
    total > 0
      ? ((attended / total) * 100).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {total}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Realizados</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {attended}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agendados</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {scheduled}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancelados</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {cancelled}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxa</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {attendanceRate}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}