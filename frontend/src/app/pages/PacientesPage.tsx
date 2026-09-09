import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { format, parseISO } from "date-fns";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { Badge } from "../components/ui/badge";

import { Search, Plus, User, Phone, Users, Edit, X } from "lucide-react";

import { toast } from "sonner";

import { Paciente, fetchPacientes } from "../services/pacienteService";
import {
  AgenteComunitario,
  fetchAgentes,
} from "../services/agenteService";

export function PacientesPage() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [agentes, setAgentes] = useState<AgenteComunitario[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchNome, setSearchNome] = useState("");
  const [searchSus, setSearchSus] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "ativo" | "inativo"
  >("todos");

  useEffect(() => {
    async function carregar() {
      try {
        const [pac, agt] = await Promise.all([
          fetchPacientes(),
          fetchAgentes(),
        ]);

        setPacientes(pac);
        setAgentes(agt);
      } catch {
        toast.error("Erro ao carregar pacientes");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const agentesPorId = useMemo(() => {
    const mapa: Record<number, string> = {};

    for (const agente of agentes) {
      mapa[agente.agentecomunitario_id] = agente.nome;
    }

    return mapa;
  }, [agentes]);

  const filtrados = useMemo(() => {
    return pacientes.filter((paciente) => {
      const nomeOk =
        !searchNome ||
        paciente.nome
          .toLowerCase()
          .includes(searchNome.toLowerCase());

      const susOk =
        !searchSus || paciente.numero_sus.includes(searchSus);

      const statusOk =
        statusFilter === "todos" ||
        paciente.status === statusFilter;

      return nomeOk && susOk && statusOk;
    });
  }, [pacientes, searchNome, searchSus, statusFilter]);

  function formatarData(data: string | null) {
    if (!data) return "-";

    const parsed = parseISO(data);

    if (isNaN(parsed.getTime())) return data;

    return format(parsed, "dd/MM/yyyy");
  }

  function limparFiltros() {
    setSearchNome("");
    setSearchSus("");
    setStatusFilter("todos");
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        Carregando pacientes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">
            Pacientes
          </h2>

          <p className="text-gray-500 mt-1">
            {pacientes.length} cadastrados
          </p>
        </div>

        <Button
          onClick={() =>
            navigate("/dashboard/pacientes/novo")
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Nome</Label>

              <Input
                placeholder="Buscar por nome"
                value={searchNome}
                onChange={(e) =>
                  setSearchNome(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Nº SUS</Label>

              <Input
                placeholder="Buscar por nº do SUS"
                value={searchSus}
                onChange={(e) =>
                  setSearchSus(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Status</Label>

              <Select
                value={statusFilter}
                onValueChange={(value: any) =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchNome || searchSus || statusFilter !== "todos") && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={limparFiltros}
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Nº SUS</TableHead>
                <TableHead>Nascimento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtrados.map((paciente) => (
                <TableRow key={paciente.paciente_id}>
                  <TableCell>
                    {paciente.paciente_id}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {paciente.nome}
                    </div>
                  </TableCell>

                  <TableCell>
                    {paciente.numero_sus}
                  </TableCell>

                  <TableCell>
                    {formatarData(paciente.data_nascimento)}
                  </TableCell>

                  <TableCell>
                    {paciente.telefone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {paciente.telefone}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {agentesPorId[paciente.agentecomunitario_id] ||
                        `#${paciente.agentecomunitario_id}`}
                    </span>
                  </TableCell>

                  <TableCell>
                    {paciente.status === "ativo" ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(
                          `/dashboard/pacientes/alterar/${paciente.paciente_id}`
                        )
                      }
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum paciente encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
