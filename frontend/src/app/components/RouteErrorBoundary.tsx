import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router";

import { Button } from "./ui/button";

/**
 * Captura erros de render/rota e mostra uma tela amigável
 * em vez de uma página em branco.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let titulo = "Algo deu errado";
  let detalhe =
    "Ocorreu um erro inesperado ao carregar esta tela.";

  if (isRouteErrorResponse(error)) {
    titulo = `${error.status} — ${error.statusText}`;
    detalhe =
      error.data?.message ||
      "Não foi possível carregar esta página.";
  } else if (error instanceof Error) {
    detalhe = error.message;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-5xl" aria-hidden="true">
          ⚠️
        </div>

        <h1 className="text-2xl font-semibold">{titulo}</h1>

        <p className="text-gray-500 break-words">{detalhe}</p>

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
