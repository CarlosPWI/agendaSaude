import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { NewAppointmentPage } from "./pages/NewAppointmentPage";
import { ReschedulePage } from "./pages/ReschedulePage";
import { PlannerPage } from "./pages/PlannerPage";

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
        Component: PlannerPage,
      },
      {
        path: "consultas",
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
    ],
  },
]);