import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { NewAppointmentPage } from "./pages/NewAppointmentPage";
import { NewPatientPage } from "./pages/NewPatientPage";
import { EditPatientPage } from "./pages/EditPatientPage";
import { NewAgenteComunitarioPage } from "./pages/NewAgenteComunitarioPage";
import { ReschedulePage } from "./pages/ReschedulePage";
import { PlannerPage } from "./pages/PlannerPage";
import { PacientesPage } from "./pages/PacientesPage";
import { AgentesComunitariosPage } from "./pages/AgentesComunitariosPage";
import { UpVisualPage } from "./pages/UpVisualPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: PlannerPage,
      },
      {
        path: "consultas",
        Component: AppointmentsPage,
      },
      {
        path: "pacientes",
        Component: PacientesPage,
      },
      {
        path: "agentescomunitarios",
        Component: AgentesComunitariosPage,
      },
      {
        path: "inteligencia",
        Component: UpVisualPage,
      },
      {
        path: "novo-agendamento",
        Component: NewAppointmentPage,
      },
      {
        path: "pacientes/novo",
        Component: NewPatientPage,
      },
      {
        path: "pacientes/alterar/:id",
        Component: EditPatientPage,
      },
      {
        path: "agentescomunitarios/novo",
        Component: NewAgenteComunitarioPage,
      },
      {
        path: "reagendar/:id",
        Component: ReschedulePage,
      },
    ],
  },
]);