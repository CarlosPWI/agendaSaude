import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router";

import { toast } from "sonner";

export function EditPatientPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const apiUrl =
    import.meta.env.VITE_API_URL;

  const [loading, setLoading] =
    useState(false);

  const [loadingPatient, setLoadingPatient] =
    useState(false);

  const [loadingAgentes, setLoadingAgentes] =
    useState(false);

  const [agentes, setAgentes] =
    useState<any[]>([]);

  const [formData, setFormData] =
    useState({
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
    carregarDados();
  }, [id]);

  async function carregarDados() {
    await Promise.all([
      fetchPaciente(),
      fetchAgentesComunitarios(),
    ]);
  }

  async function fetchPaciente() {
    try {
      setLoadingPatient(true);

      if (!apiUrl) {
        throw new Error(
          "VITE_API_URL não configurada"
        );
      }

      if (!id) {
        throw new Error(
          "Paciente inválido"
        );
      }

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/pacientes/${id}`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Erro ao buscar paciente"
        );
      }

      const data =
        await response.json();

      const paciente =
        data?.data || data;

      if (!paciente) {
        throw new Error(
          "Paciente não encontrado"
        );
      }

      setFormData({
        agentecomunitario_id:
          paciente.agentecomunitario_id ||
          0,

        nome: paciente.nome || "",

        numero_sus:
          paciente.numero_sus || "",

        email:
          paciente.email || "",

        telefone:
          paciente.telefone || "",

        data_nascimento:
          paciente.data_nascimento
            ?.split("T")[0] || "",

        observacoes:
          paciente.observacoes || "",

        status:
          paciente.status || "ativo",
      });
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao carregar paciente"
      );
    } finally {
      setLoadingPatient(false);
    }
  }

  async function fetchAgentesComunitarios() {
    try {
      setLoadingAgentes(true);

      if (!apiUrl) {
        throw new Error(
          "VITE_API_URL não configurada"
        );
      }

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/agentescomunitarios/`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Erro ao buscar agentes"
        );
      }

      const data =
        await response.json();

      const lista =
        data?.data || data || [];

      if (!Array.isArray(lista)) {
        throw new Error(
          "Resposta inválida da API"
        );
      }

      setAgentes(lista);
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao carregar agentes"
      );
    } finally {
      setLoadingAgentes(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      if (!id) {
        throw new Error(
          "Paciente inválido"
        );
      }

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

      if (!apiUrl) {
        throw new Error(
          "VITE_API_URL não configurada"
        );
      }

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const usuarioSalvo =
        localStorage.getItem("usuario");

      if (!usuarioSalvo) {
        throw new Error(
          "Usuário não encontrado"
        );
      }

      const usuario =
        JSON.parse(usuarioSalvo);

      const usuarioId =
        usuario.usuario_id ||
        usuario.id ||
        usuario.user_id;

      if (!usuarioId) {
        throw new Error(
          "Usuário inválido"
        );
      }

      const payload = {
        agentecomunitario_id:
          formData.agentecomunitario_id,

        nome: formData.nome.trim(),

        numero_sus:
          formData.numero_sus.trim(),

        email:
          formData.email.trim() ||
          null,

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

      const response = await fetch(
        `${apiUrl}/pacientes/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail?.[0]?.msg ||
            data.detail ||
            "Erro ao atualizar paciente"
        );
      }

      toast.success(
        "Paciente atualizado com sucesso"
      );

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao atualizar paciente"
      );
    } finally {
      setLoading(false);
    }
  }

  if (
    loadingPatient ||
    loadingAgentes
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Carregando dados...
        </p>
      </div>
    );
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
          Editar Paciente
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Agente Comunitário
            </label>

            <select
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
            <label className="text-sm font-medium">
              Nome Completo
            </label>

            <input
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
              <label className="text-sm font-medium">
                Número do SUS
              </label>

              <input
                type="text"
                required
                maxLength={20}
                value={
                  formData.numero_sus
                }
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
              <label className="text-sm font-medium">
                Data de Nascimento
              </label>

              <input
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
              <label className="text-sm font-medium">
                E-mail
              </label>

              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email:
                      e.target.value,
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Telefone
              </label>

              <input
                type="text"
                maxLength={20}
                value={formData.telefone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    telefone:
                      e.target.value,
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Status
            </label>

            <select
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
            <label className="text-sm font-medium">
              Observações
            </label>

            <textarea
              rows={5}
              maxLength={500}
              value={
                formData.observacoes
              }
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
                : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}