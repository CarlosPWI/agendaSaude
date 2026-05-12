import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function NewAppointmentPage() {
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    paciente_id: 0,
    statusagendamento_id: 0,
    data: "",
    horario: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchPacientes();
    fetchStatusAgendamento();
  }, []);

  async function fetchPacientes() {
    try {
      const token = localStorage.getItem("token");

      console.log(
        "BUSCANDO PACIENTES:",
        `${apiUrl}/pacientes`
      );

      const response = await fetch(
        `${apiUrl}/pacientes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("PACIENTES:", data);

      console.log(
        "PRIMEIRO PACIENTE:",
        data.data?.[0] || data[0]
      );

      setPacientes(data.data || data);
    } catch (error) {
      console.error(
        "ERRO AO BUSCAR PACIENTES:",
        error
      );

      toast.error("Erro ao carregar pacientes");
    }
  }

  async function fetchStatusAgendamento() {
    try {
      const token = localStorage.getItem("token");

      console.log(
        "BUSCANDO STATUS:",
        `${apiUrl}/statusagendamento`
      );

      const response = await fetch(
        `${apiUrl}/statusagendamento`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "STATUS AGENDAMENTO:",
        data
      );

      console.log(
        "PRIMEIRO STATUS:",
        data.data?.[0] || data[0]
      );

      setStatusList(data.data || data);
    } catch (error) {
      console.error(
        "ERRO AO BUSCAR STATUS:",
        error
      );

      toast.error("Erro ao carregar status");
    }
  }

  const horarios = useMemo(() => {
    return Array.from({ length: 11 }, (_, index) => {
      const hora = index + 8;

      return `${hora
        .toString()
        .padStart(2, "0")}:00`;
    });
  }, []);

  function formatarDataHoraComTimezone(
    data: string,
    horario: string
  ) {
    const dataHora = new Date(
      `${data}T${horario}:00`
    );

    return dataHora.toISOString();
  }

  function calcularDataHoraFim(
    data: string,
    horario: string
  ) {
    const dataHora = new Date(
      `${data}T${horario}:00`
    );

    dataHora.setHours(
      dataHora.getHours() + 1
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
          "Selecione um status de agendamento"
        );

        return;
      }

      if (!formData.data) {
        toast.error("Selecione uma data");

        return;
      }

      if (!formData.horario) {
        toast.error(
          "Selecione um horário"
        );

        return;
      }

      setLoading(true);

      const token = localStorage.getItem(
        "token"
      );

      const usuarioSalvo =
        localStorage.getItem("usuario");

      console.log(
        "USUARIO SALVO:",
        usuarioSalvo
      );

      if (!usuarioSalvo) {
        toast.error(
          "Usuário não encontrado"
        );

        return;
      }

      const usuario =
        JSON.parse(usuarioSalvo);

      console.log(
        "USUARIO PARSEADO:",
        usuario
      );

      const usuarioId =
        usuario.usuario_id ||
        usuario.id ||
        usuario.user_id;

      console.log(
        "USUARIO ID:",
        usuarioId
      );

      const dataHoraInicio =
        formatarDataHoraComTimezone(
          formData.data,
          formData.horario
        );

      const dataHoraFim =
        calcularDataHoraFim(
          formData.data,
          formData.horario
        );

      console.log(
        "DATA HORA INICIO:",
        dataHoraInicio
      );

      console.log(
        "DATA HORA FIM:",
        dataHoraFim
      );

      const payload = {
        usuario_id: usuarioId,

        paciente_id:
          formData.paciente_id,

        statusagendamento_id:
          formData.statusagendamento_id,

        data_hora_inicio:
          dataHoraInicio,

        data_hora_fim: dataHoraFim,

        observacoes:
          formData.observacoes?.trim() ||
          null,
      };

      console.log(
        "=================================="
      );

      console.log(
        "PAYLOAD AGENDAMENTO:"
      );

      console.log(payload);

      console.log(
        "JSON STRINGIFY:"
      );

      console.log(
        JSON.stringify(payload, null, 2)
      );

      console.log(
        "=================================="
      );

      const response = await fetch(
        `${apiUrl}/agendamentos/`,
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

      console.log(
        "STATUS RESPONSE:",
        response.status
      );

      const data = await response.json();

      console.log(
        "RESPONSE BACKEND:"
      );

      console.log(data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            "Erro ao criar agendamento"
        );
      }

      toast.success(
        "Agendamento criado com sucesso"
      );

      navigate("/dashboard");
    } catch (error: any) {
      console.error(
        "ERRO AO CRIAR AGENDAMENTO:"
      );

      console.error(error);

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
              value={String(
                formData.paciente_id
              )}
              onChange={(e) => {
                console.log(
                  "PACIENTE SELECIONADO:",
                  e.target.value
                );

                setFormData((prev) => ({
                  ...prev,
                  paciente_id: Number(
                    e.target.value
                  ),
                }));
              }}
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
              Status do Agendamento
            </label>

            <select
              required
              value={String(
                formData.statusagendamento_id
              )}
              onChange={(e) => {
                console.log(
                  "STATUS SELECIONADO:",
                  e.target.value
                );

                setFormData((prev) => ({
                  ...prev,
                  statusagendamento_id:
                    Number(
                      e.target.value
                    ),
                }));
              }}
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
                Horário de Início
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

                {horarios.map((horario) => (
                  <option
                    key={horario}
                    value={horario}
                  >
                    {horario}
                  </option>
                ))}
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
              value={formData.observacoes}
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