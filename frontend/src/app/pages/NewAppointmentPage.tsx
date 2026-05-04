import { useState } from "react";
import { useNavigate } from "react-router";
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
import { ArrowLeft, Calendar, Check } from "lucide-react";
import { toast } from "sonner";
import { createAgendamento } from "../services/agendamentoService";

export function NewAppointmentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    date: "",
    time: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAgendamento({
        patientId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        patientName: formData.patientName,
        date: formData.date,
        time: formData.time,
      });

      toast.success("Consulta agendada com sucesso!", {
        description: `${formData.patientName} - ${formData.date} às ${formData.time}`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao agendar consulta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
            Novo Agendamento
          </CardTitle>
          <CardDescription>
            Preencha os dados para agendar uma nova sessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patientName">Nome do Paciente *</Label>
              <Input
                id="patientName"
                placeholder="Nome completo do paciente"
                value={formData.patientName}
                onChange={(e) => handleInputChange("patientName", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {loading ? "Salvando..." : "Confirmar Agendamento"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
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
