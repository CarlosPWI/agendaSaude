import { Outlet, useNavigate, Navigate, NavLink } from "react-router";
import { Button } from "./ui/button";
import {
  Calendar,
  CalendarDays,
  CalendarPlus,
  LogOut,
  Users,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

const menuItens = [
  { to: "/dashboard", label: "Planner", icon: Calendar },
  { to: "/dashboard/consultas", label: "Consultas", icon: CalendarDays },
  {
    to: "/dashboard/novo-agendamento",
    label: "Novo Agendamento",
    icon: CalendarPlus,
  },
  { to: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  {
    to: "/dashboard/agentescomunitarios",
    label: "Agentes",
    icon: Stethoscope,
  },
  { to: "/dashboard/inteligencia", label: "Up Visual", icon: TrendingUp },
];

export function DashboardLayout() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  let usuario: any = null;

  try {
    const usuarioSalvo = localStorage.getItem("usuario");
    usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  } catch {
    usuario = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Agenda Saúde
                </h1>
                <p className="text-sm text-gray-500">Olá, {usuario?.nome || "Usuário"}</p>
              </div>
            </div>
            <Button
               variant="ghost"
               onClick={handleLogout}
               className="flex items-center gap-2"
             >
               <LogOut className="w-4 h-4" />
               Sair
             </Button>
          </div>
        </div>

        <nav className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5">
              {menuItens.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
