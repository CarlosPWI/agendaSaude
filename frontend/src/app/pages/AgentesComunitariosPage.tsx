import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { Search, Plus, Users, Pencil, X } from "lucide-react";

import { toast } from "sonner";

import { fetchPacientes } from "../services/pacienteService";
import {
  AgenteComunitario,
  fetchAgentes,
  atualizarAgente,
} from "../services/agenteService";

export function AgentesComunitariosPage() {
  const navigate = useNavigate();

  const [agentes, setAgentes] = useState<AgenteComunitario[]>([]);
  const [pacientesPorAgente, setPacientesPorAgente] = useState<
    Record<number, number>
  >({});

  const [loading, setLoading] = useState(true);
  const [searchNome, setSearchNome] = useState("");

  const [editando, setEditando] = useState<AgenteComunitario | null>(null);
  const [nomeNovo, setNomeNovo] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const [agt, pac] = await Promise.all([
        fetchAgentes(),
        fetchPacientes(),
      ]);

      setAgentes(agt);

      const contagem: Record<number, number> = {};

      for (const p of pac) {
        contagem[p.agentecomunitario_id] =
          (contagem[p.agentecomunitario_id] || 0) + 1;
      }

      setPacientesPorAgente(contagem);
    } catch {
      toast.error("Erro ao carregar agentes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    return agentes.filter((agente) =>
      agente.nome.toLowerCase().includes(searchNome.toLowerCase())
    );
  }, [agentes, searchNome]);

  function abrirEdicao(agente: AgenteComunitario) {
    setEditando(agente);
    setNomeNovo(agente.nome);
  }

  async function salvarEdicao() {
    if (!editando) return;

    const nome = nomeNovo.trim();

    if (!nome) {
      toast.error("Informe o nome do agente");
      return;
    }

    try {
      setSalvando(true);

      await atualizarAgente(editando.agentecomunitario_id, nome);

      toast.success("Agente atualizado");

      setEditando(null);

      carregar();
    } catch {
      toast.error("Erro ao atualizar agente");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        Carregando agentes comunitários...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">
            Agentes Comunitários
          </h2>

          <p className="text-gray-500 mt-1">
            {agentes.length} cadastrados
          </p>
        </div>

        <Button
          onClick={() =>
            navigate("/dashboard/agentescomunitarios/novo")
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-w-sm">
            <Label>Nome</Label>

            <Input
              placeholder="Buscar por nome"
              value={searchNome}
              onChange={(e) => setSearchNome(e.target.value)}
            />
          </div>

          {searchNome && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchNome("")}
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
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
                <TableHead>Pacientes vinculados</TableHead>
                <TableHead className="text-right">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtrados.map((agente) => (
                <TableRow key={agente.agentecomunitario_id}>
                  <TableCell>
                    {agente.agentecomunitario_id}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {agente.nome}
                    </div>
                  </TableCell>

                  <TableCell>
                    {pacientesPorAgente[
                      agente.agentecomunitario_id
                    ] || 0}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirEdicao(agente)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar nome
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum agente encontrado
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={editando !== null}
        onOpenChange={(open) => {
          if (!open) setEditando(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar agente</DialogTitle>

            <DialogDescription>
              Altere o nome do agente comunitário
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label>Nome</Label>

            <Input
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditando(null)}
            >
              Cancelar
            </Button>

            <Button
              onClick={salvarEdicao}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
