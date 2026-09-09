import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router";

import { format } from "date-fns";

import { toast } from "sonner";

import { HORARIOS_DISPONIVEIS } from "../constants/horarios";

import { handleUnauthorized } from "../services/session";
import { apiFetch } from "../services/apiClient";

export function ReschedulePage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const apiUrl =
    import.meta.env.VITE_API_URL;

  const [pacientes, setPacientes] =
    useState<any[]>([]);

  const [statusList, setStatusList] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingPage, setLoadingPage] =
    useState(true);

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
    try {
      setLoadingPage(true);

      await Promise.all([
        fetchPacientes(),
        fetchStatusAgendamento(),
        fetchAgendamento(),
      ]);
    } finally {
      setLoadingPage(false);
    }
  }

  async function fetchPacientes() {
    try {
      const token =
        localStorage.getItem("token");

      const response = await apiFetch(
        `${apiUrl}/pacientes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      handleUnauthorized(response.status);

      setPacientes(
        data.data || data
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Erro ao carregar pacientes"
      );
    }
  }

  async function fetchStatusAgendamento() {
    try {
      const token =
        localStorage.getItem("token");

      const response = await apiFetch(
        `${apiUrl}/statusagendamento`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      handleUnauthorized(response.status);

      setStatusList(
        data.data || data
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Erro ao carregar status"
      );
    }
  }

  async function fetchAgendamento() {
    try {
      const token =
        localStorage.getItem("token");

      const response = await apiFetch(
        `${apiUrl}/agendamentos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      handleUnauthorized(response.status);

      const agendamento =
        data.data || data;

      const dataInicio = new Date(
        agendamento.data_hora_inicio
      );

      const dataFormatada =
        format(dataInicio, "yyyy-MM-dd");

      const horarioFormatado =
        format(dataInicio, "HH:mm");

      setFormData({
        paciente_id:
          agendamento.paciente_id,

        statusagendamento_id:
          agendamento.statusagendamento_id,

        data: dataFormatada,

        horario:
          horarioFormatado,

        observacoes:
          agendamento.observacoes ||
          "",
      });
    } catch (error) {
      console.error(error);

      toast.error(
        "Erro ao carregar agendamento"
      );
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

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const usuarioSalvo =
        localStorage.getItem(
          "usuario"
        );

      if (!usuarioSalvo) {
        toast.error(
          "Usuário não encontrado"
        );

        return;
      }

      const usuario =
        JSON.parse(usuarioSalvo);

      const usuarioId =
        usuario.usuario_id ||
        usuario.id ||
        usuario.user_id;

      const dataHoraInicio =
        formatarDataHoraComTimezone(
          formData.data,
          formData.horario
        );

      const payload = {
        usuario_id: usuarioId,

        paciente_id:
          formData.paciente_id,

        statusagendamento_id:
          formData.statusagendamento_id,

        data_hora_inicio:
          dataHoraInicio,

        observacoes:
          formData.observacoes?.trim() ||
          null,
      };

      const response = await apiFetch(
        `${apiUrl}/agendamentos/${id}`,
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
      handleUnauthorized(response.status);

      const errorMessage =
        data.message ||
        data.detail?.[0]?.msg ||
        data.detail ||
        "Erro ao reagendar";

      throw new Error(errorMessage);
      }

      toast.success(
        "Agendamento alterado com sucesso"
      );

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          "Erro ao reagendar"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>
          Carregando agendamento...
        </p>
      </div>
    );
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
          Alterar Agendamento
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
                Selecione um paciente
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
              Status
            </label>

            <select
              required
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
                Selecione um status
              </option>

              {statusList.map(
                (status: any) => {
                  const statusId =
                    status.id ||
                    status.statusagendamento_id;

                  const statusNome =
                    status.nome;

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    data:
                      e.target.value,
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
                value={
                  formData.horario
                }
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
              placeholder="Digite observações do agendamento"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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