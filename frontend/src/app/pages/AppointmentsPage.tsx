import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import { Calendar, Plus, Search, Clock, User, X, Edit, CheckCircle2 } from "lucide-react";
import { Agendamento } from "../data/mockData";
import { fetchAgendamentos, cancelAgendamento } from "../services/agendamentoService";
import { toast } from "sonner";
import { AttendanceStats } from "../components/AttendanceStats";

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Agendamento[]>([]);
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [searchPatientName, setSearchPatientName] = useState("");
  const [attendedFilter, setAttendedFilter] = useState<"all" | "attended" | "not-attended">("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const loadAppointments = () => {
    fetchAgendamentos().then(setAppointments);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      // Filtro de data por período
      let dateMatch = true;
      const appointmentDate = new Date(appointment.date + "T00:00:00");
      
      if (searchStartDate && searchEndDate) {
        const startDate = new Date(searchStartDate + "T00:00:00");
        const endDate = new Date(searchEndDate + "T23:59:59");
        dateMatch = appointmentDate >= startDate && appointmentDate <= endDate;
      } else if (searchStartDate) {
        const startDate = new Date(searchStartDate + "T00:00:00");
        dateMatch = appointmentDate >= startDate;
      } else if (searchEndDate) {
        const endDate = new Date(searchEndDate + "T23:59:59");
        dateMatch = appointmentDate <= endDate;
      }
      
      const patientMatch =
        !searchPatientName ||
        appointment.patientName.toLowerCase().includes(searchPatientName.toLowerCase());
        
      const attendedMatch =
        attendedFilter === "all" ||
        (attendedFilter === "attended" && appointment.status === "concluído") ||
        (attendedFilter === "not-attended" && appointment.status === "agendado");

      return dateMatch && patientMatch && attendedMatch;
    });
  }, [appointments, searchStartDate, searchEndDate, searchPatientName, attendedFilter]);

  const handleCancelAppointment = (id: string) => {
    setAppointmentToCancel(id);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (appointmentToCancel) {
      await cancelAgendamento(appointmentToCancel);
      toast.success("Consulta cancelada com sucesso!");
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      loadAppointments(); // Recarrega os dados após o cancelamento
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      agendado: "default",
      concluído: "secondary",
      cancelado: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getAttendanceBadge = (appointment: Agendamento) => {
    if (appointment.status === "concluído") {
      if (appointment.attended) {
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Realizado
          </Badge>
        );
      } else {
        return (
          <Badge variant="default" className="bg-orange-600 hover:bg-orange-700">
            <X className="w-3 h-3 mr-1" />
            Não Realizado
          </Badge>
        );
      }
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  const clearFilters = () => {
    setSearchStartDate("");
    setSearchEndDate("");
    setSearchPatientName("");
    setAttendedFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Agenda de Consultas</h2>
          <p className="text-gray-600 mt-1">
            Gerencie e consulte todos os agendamentos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Planner
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

      <AttendanceStats appointments={appointments} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
          <CardDescription>
            Busque consultas por data, paciente ou status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateStart">Data Inicial</Label>
              <Input
                id="dateStart"
                type="date"
                value={searchStartDate}
                onChange={(e) => setSearchStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateEnd">Data Final</Label>
              <Input
                id="dateEnd"
                type="date"
                value={searchEndDate}
                onChange={(e) => setSearchEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientName">Nome do Paciente</Label>
              <Input
                id="patientName"
                type="text"
                placeholder="Digite o nome do paciente"
                value={searchPatientName}
                onChange={(e) => setSearchPatientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendedFilter">Status</Label>
              <Select value={attendedFilter} onValueChange={setAttendedFilter as any}>
                <SelectTrigger id="attendedFilter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="attended">Atendidos</SelectItem>
                  <SelectItem value="not-attended">Não Atendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchStartDate || searchEndDate || searchPatientName || attendedFilter !== "all") && (
            <div className="mt-4">
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Todas as Consultas ({filteredAppointments.length})
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{appointment.patientName}</div>
                        <div className="text-xs text-gray-500">
                          {appointment.patientId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(appointment.date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {appointment.time}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>{getAttendanceBadge(appointment)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {appointment.status === "agendado" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/dashboard/reagendar/${appointment.id}`)
                            }
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Reagendar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma consulta encontrada com os filtros selecionados.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, cancelar consulta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
