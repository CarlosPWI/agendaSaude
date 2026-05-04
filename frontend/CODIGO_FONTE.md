# Código Fonte Completo - Sistema de Agendamento Médico

## Índice de Arquivos
1. [Dados Mock](#1-dados-mock---mockdatats)
2. [Rotas](#2-rotas---routestsx)
3. [LoginPage](#3-loginpage---loginpagetsx)
4. [AppointmentsPage](#4-appointmentspage---appointmentspagetsx)
5. [NewAppointmentPage](#5-newappointmentpage---newappointmentpagetsx)
6. [ReschedulePage](#6-reschedulepage---reschedulepagetsx)
7. [PlannerPage](#7-plannerpage---plannerpagetsx)
8. [AvailableSlotsPage](#8-availableslotspage---availableslotspagetsx)
9. [AnalyticsDashboardPage](#9-analyticsdashboardpage---analyticsdashboardpagetsx)
10. [DashboardLayout](#10-dashboardlayout---dashboardlayouttsx)
11. [AttendanceStats](#11-attendancestats---attendancestatstsx)

---

## 1. Dados Mock - `mockData.ts`

```typescript
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
  date: string;
  time: string;
  status: "agendado" | "concluído" | "cancelado";
  attended: boolean; // true = realizado, false = não realizado
}

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "P001",
    patientName: "Maria Silva",
    professionalId: "D001",
    professionalName: "Dr. João Santos",
    specialty: "Cardiologia",
    date: "2026-03-28",
    time: "09:00",
    status: "agendado",
    attended: false,
  },
  {
    id: "2",
    patientId: "P002",
    patientName: "Carlos Oliveira",
    professionalId: "D002",
    professionalName: "Dra. Ana Paula",
    specialty: "Ortopedia",
    date: "2026-03-28",
    time: "10:30",
    status: "agendado",
    attended: false,
  },
  {
    id: "3",
    patientId: "P003",
    patientName: "Fernanda Costa",
    professionalId: "D003",
    professionalName: "Dr. Pedro Almeida",
    specialty: "Dermatologia",
    date: "2026-03-29",
    time: "14:00",
    status: "agendado",
    attended: false,
  },
  {
    id: "4",
    patientId: "P004",
    patientName: "Roberto Lima",
    professionalId: "D001",
    professionalName: "Dr. João Santos",
    specialty: "Cardiologia",
    date: "2026-03-29",
    time: "11:00",
    status: "agendado",
    attended: false,
  },
  {
    id: "5",
    patientId: "P005",
    patientName: "Julia Mendes",
    professionalId: "D004",
    professionalName: "Dra. Beatriz Rocha",
    specialty: "Pediatria",
    date: "2026-03-30",
    time: "08:30",
    status: "agendado",
    attended: false,
  },
  {
    id: "6",
    patientId: "P006",
    patientName: "André Souza",
    professionalId: "D005",
    professionalName: "Dr. Marcos Ferreira",
    specialty: "Oftalmologia",
    date: "2026-03-30",
    time: "15:00",
    status: "agendado",
    attended: false,
  },
  {
    id: "7",
    patientId: "P007",
    patientName: "Patricia Gomes",
    professionalId: "D002",
    professionalName: "Dra. Ana Paula",
    specialty: "Ortopedia",
    date: "2026-03-31",
    time: "09:30",
    status: "agendado",
    attended: false,
  },
  {
    id: "8",
    patientId: "P001",
    patientName: "Maria Silva",
    professionalId: "D001",
    professionalName: "Dr. João Santos",
    specialty: "Cardiologia",
    date: "2026-03-25",
    time: "10:00",
    status: "concluído",
    attended: true,
  },
  {
    id: "9",
    patientId: "P008",
    patientName: "Lucas Pereira",
    professionalId: "D006",
    professionalName: "Dra. Camila Dias",
    specialty: "Neurologia",
    date: "2026-04-01",
    time: "16:00",
    status: "agendado",
    attended: false,
  },
  {
    id: "10",
    patientId: "P009",
    patientName: "Isabela Martins",
    professionalId: "D003",
    professionalName: "Dr. Pedro Almeida",
    specialty: "Dermatologia",
    date: "2026-04-02",
    time: "13:30",
    status: "agendado",
    attended: false,
  },
  {
    id: "11",
    patientId: "P010",
    patientName: "Ricardo Fernandes",
    professionalId: "D002",
    professionalName: "Dra. Ana Paula",
    specialty: "Ortopedia",
    date: "2026-03-24",
    time: "14:00",
    status: "concluído",
    attended: true,
  },
  {
    id: "12",
    patientId: "P011",
    patientName: "Camila Santos",
    professionalId: "D003",
    professionalName: "Dr. Pedro Almeida",
    specialty: "Dermatologia",
    date: "2026-03-23",
    time: "11:30",
    status: "concluído",
    attended: false,
  },
  {
    id: "13",
    patientId: "P012",
    patientName: "Bruno Alves",
    professionalId: "D004",
    professionalName: "Dra. Beatriz Rocha",
    specialty: "Pediatria",
    date: "2026-03-22",
    time: "09:00",
    status: "concluído",
    attended: true,
  },
  {
    id: "14",
    patientId: "P013",
    patientName: "Larissa Oliveira",
    professionalId: "D005",
    professionalName: "Dr. Marcos Ferreira",
    specialty: "Oftalmologia",
    date: "2026-03-26",
    time: "16:30",
    status: "cancelado",
    attended: false,
  },
];

export const specialties = [
  "Todas",
  "Cardiologia",
  "Ortopedia",
  "Dermatologia",
  "Pediatria",
  "Oftalmologia",
  "Neurologia",
];

export const professionals = [
  { id: "D001", name: "Dr. João Santos", specialty: "Cardiologia" },
  { id: "D002", name: "Dra. Ana Paula", specialty: "Ortopedia" },
  { id: "D003", name: "Dr. Pedro Almeida", specialty: "Dermatologia" },
  { id: "D004", name: "Dra. Beatriz Rocha", specialty: "Pediatria" },
  { id: "D005", name: "Dr. Marcos Ferreira", specialty: "Oftalmologia" },
  { id: "D006", name: "Dra. Camila Dias", specialty: "Neurologia" },
];
```

---

## 2. Rotas - `routes.tsx`

```typescript
import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { NewAppointmentPage } from "./pages/NewAppointmentPage";
import { ReschedulePage } from "./pages/ReschedulePage";
import { AnalyticsDashboardPage } from "./pages/AnalyticsDashboardPage";
import { PlannerPage } from "./pages/PlannerPage";
import { AvailableSlotsPage } from "./pages/AvailableSlotsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: AppointmentsPage,
      },
      {
        path: "novo-agendamento",
        Component: NewAppointmentPage,
      },
      {
        path: "reagendar/:id",
        Component: ReschedulePage,
      },
      {
        path: "analytics",
        Component: AnalyticsDashboardPage,
      },
      {
        path: "planner",
        Component: PlannerPage,
      },
      {
        path: "horarios-vagos",
        Component: AvailableSlotsPage,
      },
    ],
  },
]);
```

---

## 3. LoginPage - `LoginPage.tsx`

```typescript
import { useState } from "react";
import { useNavigate } from "react-router";
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
import { Calendar } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - em produção, validaria com backend
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Sistema de Agendamento Médico
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 4. AppointmentsPage - `AppointmentsPage.tsx`

**NOTA**: Este arquivo é muito extenso (500+ linhas). Aqui está a estrutura principal:

```typescript
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
// ... imports de componentes UI

export function AppointmentsPage() {
  const navigate = useNavigate();
  
  // Estados
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [searchPatientName, setSearchPatientName] = useState("");
  const [searchProfessionalName, setSearchProfessionalName] = useState("");
  const [attendedFilter, setAttendedFilter] = useState<"all" | "attended" | "not-attended">("all");

  // Filtros com useMemo
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      // Lógica de filtro por especialidade, data, paciente, profissional
      // ...
    });
  }, [appointments, selectedSpecialty, searchStartDate, searchEndDate, searchPatientName, searchProfessionalName, attendedFilter]);

  // Funções
  const handleCancelAppointment = (id: string) => { /* ... */ };
  const confirmCancel = () => { /* ... */ };
  const getStatusBadge = (status: string) => { /* ... */ };
  const getAttendanceBadge = (appointment: Appointment) => { /* ... */ };
  const clearFilters = () => { /* ... */ };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botões de navegação */}
      {/* AttendanceStats */}
      {/* Card de Filtros */}
      {/* Tabs: Lista e Por Especialidade */}
      {/* AlertDialog de Cancelamento */}
    </div>
  );
}
```

**Principais recursos**:
- Filtros avançados (especialidade, período, paciente, profissional)
- Duas visualizações: Lista completa e agrupada por especialidade
- Ações: Reagendar e Cancelar
- Badges coloridos para status
- Dialog de confirmação de cancelamento

---

## 5. NewAppointmentPage - `NewAppointmentPage.tsx`

```typescript
import { useState } from "react";
import { useNavigate } from "react-router";
// ... imports

export function NewAppointmentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    specialty: "",
    professionalId: "",
    date: "",
    time: "",
  });

  const filteredProfessionals = formData.specialty
    ? professionals.filter((prof) => prof.specialty === formData.specialty)
    : professionals;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Consulta agendada com sucesso!", {
      description: `${formData.patientName} - ${formData.date} às ${formData.time}`,
    });
    navigate("/dashboard");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Campo: Nome do Paciente */}
            {/* Campo: Tipos Usuários (Especialidade) */}
            {/* Campo: Usuários (Profissional) - Dependente da especialidade */}
            {/* Campo: Data */}
            {/* Campo: Horário */}
            {/* Botões: Confirmar e Cancelar */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 6. ReschedulePage - `ReschedulePage.tsx`

```typescript
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
// ... imports

export function ReschedulePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [appointment, setAppointment] = useState(
    mockAppointments.find((apt) => apt.id === id)
  );
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    if (appointment) {
      setNewDate(appointment.date);
      setNewTime(appointment.time);
    }
  }, [appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    toast.success("Consulta reagendada com sucesso!", {
      description: `Nova data: ${new Date(newDate + "T00:00:00").toLocaleDateString("pt-BR")} às ${newTime}`,
    });
    navigate("/dashboard");
  };

  if (!appointment) {
    return (
      <Alert variant="destructive">
        Consulta não encontrada
      </Alert>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reagendar Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Box: Informações Atuais */}
          <form onSubmit={handleSubmit}>
            {/* Campo: Nova Data */}
            {/* Campo: Novo Horário */}
            {/* Alert: Aviso de notificação */}
            {/* Botões: Confirmar e Cancelar */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 7. PlannerPage - `PlannerPage.tsx`

**Arquivo extenso com 2 visualizações**: Diária e Semanal

```typescript
export function PlannerPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Horários de 8h às 18h30 (intervalos de 30min)
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const getDayAppointments = (date: Date) => { /* ... */ };
  const getWeekAppointments = (date: Date) => { /* ... */ };

  const todayAppointments = useMemo(() => getDayAppointments(selectedDate), [selectedDate]);
  const weekAppointments = useMemo(() => getWeekAppointments(selectedDate), [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Navegação de Data: Anterior/Hoje/Próximo */}
      
      <Tabs defaultValue="day">
        <TabsList>
          <TabsTrigger value="day">Visualização Diária</TabsTrigger>
          <TabsTrigger value="week">Visualização Semanal</TabsTrigger>
        </TabsList>

        {/* Tab: Visualização Diária - Grade horária */}
        <TabsContent value="day">
          {/* Para cada horário, mostra consulta ou "Horário livre" */}
        </TabsContent>

        {/* Tab: Visualização Semanal - 7 dias */}
        <TabsContent value="week">
          {/* Grid de 7 colunas, uma para cada dia da semana */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 8. AvailableSlotsPage - `AvailableSlotsPage.tsx`

```typescript
export function AvailableSlotsPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [selectedProfessional, setSelectedProfessional] = useState("Todos");

  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  // Calcula horários vagos
  const availableSlots = useMemo(() => {
    const occupied = mockAppointments.filter((apt) => {
      // Filtra consultas ocupadas do dia
      // ...
    });

    const occupiedTimes = new Set(occupied.map((apt) => apt.time));
    return timeSlots.filter((time) => !occupiedTimes.has(time));
  }, [selectedDate, selectedSpecialty, selectedProfessional, timeSlots]);

  // Agrupa por período
  const slotsByPeriod = useMemo(() => {
    const morning = availableSlots.filter((time) => parseInt(time.split(":")[0]) < 12);
    const afternoon = availableSlots.filter((time) => {
      const hour = parseInt(time.split(":")[0]);
      return hour >= 12 && hour < 18;
    });
    const evening = availableSlots.filter((time) => parseInt(time.split(":")[0]) >= 18);

    return { morning, afternoon, evening };
  }, [availableSlots]);

  return (
    <div className="space-y-6">
      {/* Filtros: Data, Tipo Usuário, Usuário */}
      {/* Cards: Total, Manhã, Tarde, Noite */}
      {/* Lista de horários agrupados por período */}
    </div>
  );
}
```

---

## 9. AnalyticsDashboardPage - `AnalyticsDashboardPage.tsx`

```typescript
import { LineChart, BarChart, PieChart, ... } from "recharts";

export function AnalyticsDashboardPage() {
  const navigate = useNavigate();

  // Cálculo de estatísticas
  const stats = useMemo(() => {
    const total = mockAppointments.length;
    const scheduled = mockAppointments.filter((apt) => apt.status === "agendado").length;
    const attended = mockAppointments.filter(
      (apt) => apt.attended && apt.status === "concluído"
    ).length;
    const notAttended = mockAppointments.filter(
      (apt) => !apt.attended && apt.status === "concluído"
    ).length;
    const cancelled = mockAppointments.filter((apt) => apt.status === "cancelado").length;
    const completed = attended + notAttended;
    const attendanceRate = completed > 0 ? ((attended / completed) * 100).toFixed(1) : 0;

    return { total, scheduled, attended, notAttended, cancelled, completed, attendanceRate };
  }, []);

  // Dados para gráfico de pizza
  const pieData = [
    { name: "Agendados", value: stats.scheduled, color: "#3b82f6" },
    { name: "Realizados", value: stats.attended, color: "#16a34a" },
    { name: "Não Realizados", value: stats.notAttended, color: "#ea580c" },
    { name: "Cancelados", value: stats.cancelled, color: "#dc2626" },
  ];

  // Dados para gráfico de barras por especialidade
  const specialtyData = useMemo(() => {
    // Agrupa por especialidade e calcula realizados/não realizados
    // ...
  }, []);

  // Dados para gráfico de linha temporal
  const timelineData = useMemo(() => {
    // Agrupa por data e calcula taxa de comparecimento
    // ...
  }, []);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas: Total, Agendados, Realizados, Não Realizados */}
      {/* Card Destacado: Taxa de Comparecimento */}
      
      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza: Distribuição de Status */}
        <Card>
          <PieChart>
            <Pie data={pieData} />
          </PieChart>
        </Card>

        {/* Gráfico de Barras: Por Especialidade */}
        <Card>
          <BarChart data={specialtyData}>
            <Bar dataKey="Realizados" fill="#16a34a" />
            <Bar dataKey="Não Realizados" fill="#ea580c" />
            <Bar dataKey="Agendados" fill="#3b82f6" />
          </BarChart>
        </Card>
      </div>

      {/* Gráfico de Linha: Evolução Temporal */}
      <Card>
        <LineChart data={timelineData}>
          <Line dataKey="attended" stroke="#16a34a" />
          <Line dataKey="notAttended" stroke="#ea580c" />
          <Line dataKey="rate" stroke="#7c3aed" />
        </LineChart>
      </Card>

      {/* Cards de Insights */}
    </div>
  );
}
```

---

## 10. DashboardLayout - `DashboardLayout.tsx`

```typescript
import { Outlet, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { LogOut, Calendar } from "lucide-react";

export function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema de Agendamento Médico
                </h1>
                <p className="text-sm text-gray-500">Gestão de Consultas</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## 11. AttendanceStats - `AttendanceStats.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, XCircle, Calendar, AlertCircle } from "lucide-react";
import { Appointment } from "../data/mockData";

interface AttendanceStatsProps {
  appointments: Appointment[];
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
```

---

## Resumo dos Arquivos

| Arquivo | Linhas Aprox. | Descrição |
|---------|---------------|-----------|
| mockData.ts | 200 | Dados mockados e interfaces |
| routes.tsx | 40 | Configuração de rotas |
| LoginPage.tsx | 80 | Tela de login |
| AppointmentsPage.tsx | 510 | Página principal de consultas |
| NewAppointmentPage.tsx | 195 | Formulário de novo agendamento |
| ReschedulePage.tsx | 170 | Formulário de reagendamento |
| PlannerPage.tsx | 350 | Planner visual dia/semana |
| AvailableSlotsPage.tsx | 380 | Visualização de horários vagos |
| AnalyticsDashboardPage.tsx | 385 | Dashboard com gráficos |
| DashboardLayout.tsx | 70 | Layout principal |
| AttendanceStats.tsx | 85 | Componente de estatísticas |

**Total estimado**: ~2.465 linhas de código TypeScript/React

---

## Observações Importantes

### Componentes UI (shadcn/ui)
Os componentes da pasta `src/app/components/ui/` são importados do shadcn/ui e não foram listados aqui pois são componentes padrão da biblioteca. Incluem:

- Button, Card, Input, Label
- Select, Table, Tabs, Badge
- Alert, Dialog, Tooltip
- E outros componentes UI

### Estilização
O projeto usa **Tailwind CSS v4** com classes utilitárias inline. Os tokens customizados estão em `src/styles/theme.css`.

### Estado e Performance
- Uso extensivo de `useMemo` para otimizar filtros e cálculos
- Estado local com `useState`
- Sem gerenciamento de estado global (não necessário para o escopo atual)

### Navegação
- React Router v7 com `useNavigate` e `useParams`
- Rotas aninhadas sob `/dashboard`

---

**Fim do Código Fonte Completo**
