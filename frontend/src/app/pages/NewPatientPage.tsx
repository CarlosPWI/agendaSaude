import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { handleUnauthorized } from "../services/session";
import { apiFetch } from "../services/apiClient";
import {
  EMAIL_REGEX,
  mascararTelefone,
} from "../utils/validators";

export function NewPatientPage() {
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");

  const [agentes, setAgentes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    agentecomunitario_id: 0,
    nome: "",
    numero_sus: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    observacoes: "",
    status: "ativo",
  });

  useEffect(() => {
    fetchAgentesComunitarios();
  }, []);

  async function fetchAgentesComunitarios() {
    try {
      const token = localStorage.getItem("token");

      const response = await apiFetch(
        `${apiUrl}/agentescomunitarios/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      handleUnauthorized(response.status);

      setAgentes(data.data || data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Erro ao carregar agentes comunitários"
      );
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      if (
        !formData.agentecomunitario_id
      ) {
        toast.error(
          "Selecione um agente comunitário"
        );

        return;
      }

      if (!formData.nome.trim()) {
        toast.error(
          "Informe o nome do paciente"
        );

        return;
      }

      if (
        !formData.numero_sus.trim()
      ) {
        toast.error(
          "Informe o número do SUS"
        );

        return;
      }

      if (
        !formData.data_nascimento
      ) {
        toast.error(
          "Informe a data de nascimento"
        );

        return;
      }

      const email = formData.email.trim();

      if (!email) {
        setEmailError(
          "O e-mail é obrigatório"
        );

        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        setEmailError(
          "Informe um e-mail válido (ex.: nome@provedor.com)"
        );

        return;
      }

      setEmailError("");

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const payload = {
        agentecomunitario_id:
          formData.agentecomunitario_id,

        nome: formData.nome.trim(),

        numero_sus:
          formData.numero_sus.trim(),

        email:
          formData.email.trim() || null,

        telefone:
          formData.telefone.trim() ||
          null,

        data_nascimento:
          formData.data_nascimento,

        observacoes:
          formData.observacoes.trim() ||
          null,

        status: formData.status,
      };

      const response = await apiFetch(
        `${apiUrl}/pacientes/`,
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
            "Erro ao criar paciente"
        );
      }

      toast.success(
        "Paciente criado com sucesso"
      );

      navigate(
        "/dashboard/novo-agendamento"
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao criar paciente"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard/agentescomunitarios/novo"
            )
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Criar Agente Comunitário
        </button>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">
          Novo Paciente
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="agentecomunitario_id"
              className="text-sm font-medium"
            >
              Agente Comunitário
            </label>

            <select
              id="agentecomunitario_id"
              required
              value={String(
                formData.agentecomunitario_id
              )}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  agentecomunitario_id:
                    Number(
                      e.target.value
                    ),
                }))
              }
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="0">
                Selecione um agente
              </option>

              {agentes.map(
                (agente: any) => {
                  const agenteId =
                    agente.id ||
                    agente.agentecomunitario_id;

                  const agenteNome =
                    agente.nome ||
                    agente.usuario_nome;

                  return (
                    <option
                      key={agenteId}
                      value={String(
                        agenteId
                      )}
                    >
                      {agenteNome}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="nome"
              className="text-sm font-medium"
            >
              Nome Completo
            </label>

            <input
              id="nome"
              type="text"
              required
              maxLength={150}
              value={formData.nome}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nome: e.target.value,
                }))
              }
              className="w-full border rounded-md px-3 py-2"
              placeholder="Nome completo do paciente"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="numero_sus"
                className="text-sm font-medium"
              >
                Número do SUS
              </label>

              <input
                id="numero_sus"
                type="text"
                required
                maxLength={20}
                value={formData.numero_sus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    numero_sus:
                      e.target.value,
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
                placeholder="Número do SUS"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="data_nascimento"
                className="text-sm font-medium"
              >
                Data de Nascimento
              </label>

              <input
                id="data_nascimento"
                type="date"
                required
                value={
                  formData.data_nascimento
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    data_nascimento:
                      e.target.value,
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                E-mail <span className="text-red-500">*</span>
              </label>

              <input
                id="email"
                type="email"
                required
                aria-invalid={emailError ? true : undefined}
                aria-describedby={
                  emailError ? "email-error" : undefined
                }
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));

                  if (emailError) {
                    setEmailError("");
                  }
                }}
                className={`w-full border rounded-md px-3 py-2 ${
                  emailError ? "border-red-500" : ""
                }`}
                placeholder="email@exemplo.com"
              />

              {emailError && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-sm text-red-600"
                >
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="telefone"
                className="text-sm font-medium"
              >
                Telefone
              </label>

              <input
                id="telefone"
                type="tel"
                inputMode="numeric"
                maxLength={20}
                value={formData.telefone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    telefone: mascararTelefone(
                      e.target.value
                    ),
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="status"
              className="text-sm font-medium"
            >
              Status
            </label>

            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status:
                    e.target.value,
                }))
              }
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="ativo">
                Ativo
              </option>

              <option value="inativo">
                Inativo
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="observacoes"
              className="text-sm font-medium"
            >
              Observações
            </label>

            <textarea
              id="observacoes"
              rows={5}
              maxLength={500}
              value={formData.observacoes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observacoes:
                    e.target.value,
                }))
              }
              className="w-full border rounded-md px-3 py-2"
              placeholder="Observações do paciente"
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
                : "Criar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}