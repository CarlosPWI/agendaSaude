import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowLeft, Calendar, Check, AlertCircle } from "lucide-react";
import { Agendamento } from "../data/mockData";
import { fetchAgendamentoById, updateAgendamento } from "../services/agendamentoService";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../components/ui/alert";

export function ReschedulePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState<Agendamento | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [observacoes, setObservacoes] = useState(""); // 👇 Adicionamos o estado aqui

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchAgendamentoById(id).then((data) => {
        if (data) {
          setAppointment(data);
          setNewDate(data.date);
          setNewTime(data.time);
          setObservacoes(data.observacoes || ""); // 👇 Garantimos que o texto salvo carregue aqui
        }
        setLoading(false);
      });
    }
  }, [id]);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setSaving(true);
    try {
      await updateAgendamento(appointment.id, { date: newDate, time: newTime, observacoes }); 
      
      toast.success("Consulta reagendada com sucesso!", {
        description: `Nova data: ${new Date(newDate + "T00:00:00").toLocaleDateString("pt-BR")} às ${newTime}`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao reagendar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
        <p className="text-gray-500">Carregando dados da consulta...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Consulta não encontrada. Verifique o ID e tente novamente.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Reagendar Consulta
          </CardTitle>
          <CardDescription>
            Altere a data e horário da sessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <h3 className="font-semibold text-gray-900">Informações Atuais</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Paciente:</span>{" "}
                <span className="font-medium">{appointment.patientName}</span>
              </div>
              <div>
                <span className="text-gray-600">ID do Paciente:</span>{" "}
                <span className="font-medium">{appointment.patientId}</span>
              </div>
              <div>
                <span className="text-gray-600">Data Atual:</span>{" "}
                <span className="font-medium">
                  {new Date(appointment.date + "T00:00:00").toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Horário Atual:</span>{" "}
                <span className="font-medium">{appointment.time}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newDate">Nova Data *</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newTime">Novo Horário *</Label>
                <Input
                  id="newTime"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações sobre a sessão</Label>
                <textarea
                id="observacoes"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                placeholder="Ex: Paciente relatou dores... / Lembrete de cobrar o exame..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ao confirmar o reagendamento, certifique-se de avisar o paciente sobre a nova data.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {saving ? "Salvando..." : "Confirmar Reagendamento"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => navigate("/dashboard")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
