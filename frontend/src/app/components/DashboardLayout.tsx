import { useEffect, useState } from "react";
import { Outlet, useNavigate, Navigate, NavLink, useLocation } from "react-router";
import { Button } from "./ui/button";
import {
  Calendar,
  CalendarDays,
  CalendarPlus,
  LogOut,
  Users,
  Stethoscope,
  TrendingUp,
  Moon,
  Sun,
  HelpCircle,
  Settings,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { GuiaOverlay } from "./GuiaOverlay";

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
  const location = useLocation();

  // Ferramentas extras (Tela escura + Guia) — ocultas por padrão
  const [mostrarFerramentas, setMostrarFerramentas] = useState(() => {
    return localStorage.getItem("agenda_ferramentas") === "true";
  });
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem("agenda_tema_escuro") === "true";
  });
  const [guiaAberto, setGuiaAberto] = useState(false);

  // Menu lateral no mobile
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", temaEscuro);
    localStorage.setItem("agenda_tema_escuro", String(temaEscuro));
  }, [temaEscuro]);

  const alternarFerramentas = () => {
    setMostrarFerramentas((v) => {
      const novo = !v;
      localStorage.setItem("agenda_ferramentas", String(novo));
      return novo;
    });
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-2">
              <div className="flex items-center gap-3" data-guia="cabecalho">
                <button
                  type="button"
                  onClick={() => setMenuAberto(true)}
                  aria-label="Abrir menu"
                  className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <Menu className="w-6 h-6" />
                </button>

                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Agenda Saúde
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Olá, {usuario?.nome || "Usuário"}
                  </p>
                </div>
              </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Botões extras só quando habilitados */}
              {mostrarFerramentas && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setTemaEscuro((v) => !v)}
                    className="hidden sm:flex items-center gap-2"
                    aria-label={
                      temaEscuro
                        ? "Desativar tela escura"
                        : "Ativar tela escura"
                    }
                    title={temaEscuro ? "Desativar tela escura" : "Ativar tela escura"}
                  >
                    {temaEscuro ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                    <span className="hidden lg:inline">Tela escura</span>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setGuiaAberto(true)}
                    className="hidden sm:flex items-center gap-2"
                    aria-label="Abrir guia passo a passo"
                    title="Abrir guia passo a passo"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden lg:inline">Guia</span>
                  </Button>
                </>
              )}

              {/* Engrenagem para mostrar/ocultar as ferramentas */}
              <Button
                variant="ghost"
                onClick={alternarFerramentas}
                className={`flex items-center gap-2 ${
                  mostrarFerramentas ? "text-blue-600" : ""
                }`}
                aria-label="Mostrar ou ocultar ferramentas"
                title="Mostrar/ocultar ferramentas (Tela escura e Guia)"
              >
                <Settings className="w-4 h-4" />
              </Button>

              <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2" aria-label="Sair" data-guia="sair">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          className="hidden md:block border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5">
              {menuItens.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    data-guia={`menu-${item.label
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
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

      {/* Menu lateral (mobile) */}
      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Agenda Saúde
            </SheetTitle>
          </SheetHeader>

          <nav
            aria-label="Navegação principal"
            className="flex flex-col gap-1 p-3"
          >
            {menuItens.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {mostrarFerramentas && (
            <div className="mt-auto border-t p-3 space-y-1">
              <Button
                variant="ghost"
                onClick={() => {
                  setTemaEscuro((v) => !v);
                  setMenuAberto(false);
                }}
                className="w-full justify-start gap-2"
              >
                {temaEscuro ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {temaEscuro ? "Tela clara" : "Tela escura"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setGuiaAberto(true);
                  setMenuAberto(false);
                }}
                className="w-full justify-start gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Guia
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <GuiaOverlay aberto={guiaAberto} onFechar={() => setGuiaAberto(false)} />
    </div>
  );
}
