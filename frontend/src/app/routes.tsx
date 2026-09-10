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
import { NotFoundPage } from "./pages/NotFoundPage";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/register",
    Component: RegisterPage,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
    ErrorBoundary: RouteErrorBoundary,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    ErrorBoundary: RouteErrorBoundary,
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
  {
    path: "*",
    Component: NotFoundPage,
  },
]);