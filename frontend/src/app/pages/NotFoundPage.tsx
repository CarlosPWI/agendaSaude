import { useNavigate } from "react-router";

import { Button } from "../components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <p className="text-6xl font-bold text-blue-600">404</p>

        <h1 className="text-2xl font-semibold">
          Página não encontrada
        </h1>

        <p className="text-gray-500">
          O endereço que você acessou não existe ou foi
          movido.
        </p>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>

          <Button onClick={() => navigate("/dashboard")}>
            Ir para o Planner
          </Button>
        </div>
      </div>
    </div>
  );
}
