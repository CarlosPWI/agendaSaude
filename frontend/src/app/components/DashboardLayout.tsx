import { Outlet, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Calendar, LogOut } from "lucide-react";

export function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
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
                <p className="text-sm text-gray-500">Olá, Dra. [Nome]</p>
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
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
