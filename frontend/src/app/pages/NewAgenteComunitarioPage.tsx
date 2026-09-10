import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { handleUnauthorized } from "../services/session";
import { apiFetch } from "../services/apiClient";

export function NewAgenteComunitarioPage() {
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
  });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      if (!formData.nome.trim()) {
        toast.error(
          "Informe o nome do agente comunitário"
        );

        return;
      }

      if (
        formData.nome.trim().length > 50
      ) {
        toast.error(
          "O nome deve possuir no máximo 50 caracteres"
        );

        return;
      }

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const payload = {
        nome: formData.nome.trim(),
      };

      const response = await apiFetch(
        `${apiUrl}/agentescomunitarios/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        handleUnauthorized(response.status);

        throw new Error(
          data.message ||
            data.detail ||
            "Erro ao criar agente comunitário"
        );
      }

      toast.success(
        "Agente comunitário criado com sucesso"
      );

      navigate(
        "/dashboard/pacientes/novo"
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao criar agente comunitário"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">
          Novo Agente Comunitário
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="agente-nome"
              className="text-sm font-medium"
            >
              Nome
            </label>

            <input
              id="agente-nome"
              type="text"
              required
              maxLength={50}
              value={formData.nome}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nome: e.target.value,
                }))
              }
              className="w-full border rounded-md px-3 py-2"
              placeholder="Nome do agente comunitário"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : "Criar Agente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}