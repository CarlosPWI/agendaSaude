import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { HORARIOS_DISPONIVEIS } from "../constants/horarios";
import { handleUnauthorized } from "../services/session";
import { apiFetch } from "../services/apiClient";

export function NewAppointmentPage() {
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const [pacientes, setPacientes] =
    useState<any[]>([]);

  const [statusList, setStatusList] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingPacientes, setLoadingPacientes] =
    useState(false);

  const [loadingStatus, setLoadingStatus] =
    useState(false);

  const [formData, setFormData] =
    useState({
      paciente_id: 0,
      statusagendamento_id: 0,
      data: "",
      horario: "",
      observacoes: "",
    });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    await Promise.all([
      fetchPacientes(),
      fetchStatusAgendamento(),
    ]);
  }

  async function fetchPacientes() {
    try {
      setLoadingPacientes(true);

      if (!apiUrl) {
        throw new Error(
          "VITE_API_URL não configurada"
        );
      }

      const token =
        localStorage.getItem("token");

      const response = await apiFetch(
        `${apiUrl}/pacientes/`,
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
        handleUnauthorized(response.status);

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Erro ao buscar pacientes"
        );
      }

      const data =
        await response.json();

      const lista =
        data?.data || data || [];

      if (!Array.isArray(lista)) {
        throw new Error(
          "Resposta inválida da API de pacientes"
        );
      }

      setPacientes(lista);
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao carregar pacientes"
      );
    } finally {
      setLoadingPacientes(false);
    }
  }

  async function fetchStatusAgendamento() {
    try {
      setLoadingStatus(true);

      if (!apiUrl) {
        throw new Error(
          "VITE_API_URL não configurada"
        );
      }

      const token =
        localStorage.getItem("token");

      const response = await apiFetch(
        `${apiUrl}/statusagendamento/`,
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
        handleUnauthorized(response.status);

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Erro ao buscar status"
        );
      }

      const data =
        await response.json();

      const lista =
        data?.data || data || [];

      if (!Array.isArray(lista)) {
        throw new Error(
          "Resposta inválida da API de status"
        );
      }

      setStatusList(lista);
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao carregar status"
      );
    } finally {
      setLoadingStatus(false);
    }
  }

  const horarios = HORARIOS_DISPONIVEIS;

  function formatarDataHoraComTimezone(
    data: string,
    horario: string
  ) {
    const dataHora = new Date(
      `${data}T${horario}:00`
    );

    return dataHora.toISOString();
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      if (!formData.paciente_id) {
        toast.error(
          "Selecione um paciente"
        );

        return;
      }

      if (
        !formData.statusagendamento_id
      ) {
        toast.error(
          "Selecione um status"
        );

        return;
      }

      if (!formData.data) {
        toast.error(
          "Selecione uma data"
        );

        return;
      }

      if (!formData.horario) {
        toast.error(
          "Selecione um horário"
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
        usuario_id: usuarioId,

        paciente_id:
          formData.paciente_id,

        statusagendamento_id:
          formData.statusagendamento_id,

        data_hora_inicio:
          formatarDataHoraComTimezone(
            formData.data,
            formData.horario
          ),

        observacoes:
          formData.observacoes.trim() ||
          null,
      };

      const response = await apiFetch(
        `${apiUrl}/agendamentos/`,
        {
          method: "POST",

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
        handleUnauthorized(response.status);

        throw new Error(
          data.message ||
            data.detail?.[0]?.msg ||
            data.detail ||
            "Erro ao criar agendamento"
        );
      }

      toast.success(
        "Agendamento criado com sucesso"
      );

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao criar agendamento"
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

        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard/pacientes/novo"
            )
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Criar Paciente
        </button>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">
          Novo Agendamento
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Paciente
            </label>

            <select
              required
              disabled={
                loadingPacientes
              }
              value={String(
                formData.paciente_id
              )}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paciente_id: Number(
                    e.target.value
                  ),
                }))
              }
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="0">
                {loadingPacientes
                  ? "Carregando pacientes..."
                  : "Selecione um paciente"}
              </option>

              {pacientes.map(
                (paciente: any) => {
                  const pacienteId =
                    paciente.id ||
                    paciente.paciente_id;

                  const pacienteNome =
                    paciente.nome ||
                    paciente.paciente_nome;

                  return (
                    <option
                      key={pacienteId}
                      value={String(
                        pacienteId
                      )}
                    >
                      {pacienteNome}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Status do Agendamento
            </label>

            <select
              required
              disabled={
                loadingStatus
              }
              value={String(
                formData.statusagendamento_id
              )}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  statusagendamento_id:
                    Number(
                      e.target.value
                    ),
                }))
              }
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="0">
                {loadingStatus
                  ? "Carregando status..."
                  : "Selecione um status"}
              </option>

              {statusList.map(
                (status: any) => {
                  const statusId =
                    status.id ||
                    status.statusagendamento_id;

                  const statusNome =
                    status.nome ||
                    status.descricao;

                  return (
                    <option
                      key={statusId}
                      value={String(
                        statusId
                      )}
                    >
                      {statusNome}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Data
              </label>

              <input
                type="date"
                required
                value={formData.data}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    data: e.target.value,
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Horário
              </label>

              <select
                required
                value={formData.horario}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    horario:
                      e.target.value,
                  }))
                }
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">
                  Selecione um horário
                </option>

                {horarios.map(
                  (horario) => (
                    <option
                      key={horario}
                      value={horario}
                    >
                      {horario}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Observações
            </label>

            <textarea
              rows={4}
              maxLength={250}
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
                : "Criar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}