// ============================================================================
// UP VISUAL (Inteligência & Performance) — STATUS: PROVISÓRIO
// Tela experimental de demonstração analítica (dados MOCK determinísticos).
// PODE SER REMOVIDA OU MODIFICADA A QUALQUER MOMENTO sem impacto nas demais
// telas. Remoção: apagar esta página, a rota "inteligencia" em routes.tsx,
// o item "Up Visual" em DashboardLayout.tsx e os arquivos upvisualData.ts e
// components/upvisual/OcupacaoCalendar.tsx.
// ============================================================================
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  CalendarDays,
  Users,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  X,
} from "lucide-react";

import {
  RegistroAnalitico,
  gerarMes,
  ocupacaoPorDia,
  gerarInsights,
  scoreRisco,
  DIAS_SEMANA,
} from "../services/upVisualData";
import { OcupacaoCalendar } from "../components/upvisual/OcupacaoCalendar";

const CORES_PIE = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9"];
const COR_EMERALD = "#10b981";
const COR_ROSE = "#f43f5e";
const COR_AMBER = "#f59e0b";

export function UpVisualPage() {
  const hoje = new Date();
  const base = useMemo(
    () => gerarMes(hoje.getFullYear(), hoje.getMonth() + 1),
    []
  );

  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [medico, setMedico] = useState("todos");
  const [especialidade, setEspecialidade] = useState("todas");

  const medicos = useMemo(
    () => [...new Set(base.map((r) => r.medico))],
    [base]
  );
  const especialidades = useMemo(
    () => [...new Set(base.map((r) => r.especialidade))],
    [base]
  );

  const filtrados = useMemo(
    () =>
      base.filter(
        (r) =>
          (medico === "todos" || r.medico === medico) &&
          (especialidade === "todas" || r.especialidade === especialidade)
      ),
    [base, medico, especialidade]
  );

  const dadosTela = useMemo(() => {
    if (diaSelecionado) {
      return filtrados.filter((r) => r.dia === diaSelecionado);
    }
    return filtrados;
  }, [filtrados, diaSelecionado]);

  const ocupacao = useMemo(() => ocupacaoPorDia(filtrados), [filtrados]);

  const kpis = useMemo(() => {
    const total = dadosTela.length;
    const compareceu = dadosTela.filter((r) => r.status === "compareceu");
    const cancelado = dadosTela.filter((r) => r.status === "cancelado");
    const noShow = dadosTela.filter((r) => r.status === "no_show");
    const taxaComparecimento = total ? Math.round((compareceu.length / total) * 100) : 0;
    return {
      total,
      taxaComparecimento,
      cancelados: cancelado.length,
      noShow: noShow.length,
    };
  }, [dadosTela]);

  const dadosBarras = useMemo(() => {
    if (diaSelecionado) {
      const mapa = new Map<number, { horario: string; compareceu: number; faltou: number }>();
      for (const r of dadosTela) {
        const at = mapa.get(r.horario) || {
          horario: `${r.horario}h`,
          compareceu: 0,
          faltou: 0,
        };
        if (r.status === "compareceu") at.compareceu += 1;
        else at.faltou += 1;
        mapa.set(r.horario, at);
      }
      return [...mapa.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => v);
    }
    const mapa = new Map<
      number,
      { dia: string; compareceu: number; faltou: number }
    >();
    for (const r of dadosTela) {
      const at = mapa.get(r.diaSemana) || {
        dia: DIAS_SEMANA[r.diaSemana],
        compareceu: 0,
        faltou: 0,
      };
      if (r.status === "compareceu") at.compareceu += 1;
      else at.faltou += 1;
      mapa.set(r.diaSemana, at);
    }
    return [...mapa.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v);
  }, [dadosTela, diaSelecionado]);

  const dadosPizza = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const r of dadosTela) {
      if (r.status !== "compareceu") continue;
      mapa.set(
        r.paciente.faixaEtaria,
        (mapa.get(r.paciente.faixaEtaria) || 0) + 1
      );
    }
    return [...mapa.entries()]
      .map(([faixa, valor]) => ({ faixa, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [dadosTela]);

  const risco = useMemo(() => {
    const marcados = dadosTela
      .filter(
        (r) =>
          r.paciente.faltasRecentes >= 2 ||
          r.status === "no_show" ||
          (r.status === "cancelado" && r.paciente.faltasRecentes >= 1)
      )
      .map((r) => ({
        nome: r.paciente.nome,
        telefone: r.paciente.telefone,
        faixa: r.paciente.faixaEtaria,
        distancia: r.paciente.distanciaKm,
        horario: `${r.horario}h`,
        status: r.status,
        score: scoreRisco(r.paciente, r.status !== "compareceu"),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    return marcados;
  }, [dadosTela]);

  const insights = useMemo(() => gerarInsights(dadosTela), [dadosTela]);

  const tituloData = diaSelecionado
    ? format(new Date(hoje.getFullYear(), hoje.getMonth(), diaSelecionado), "dd/MM/yyyy")
    : format(hoje, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="space-y-5">
      {/* Barra sticky de filtros */}
      <div className="sticky top-[104px] z-20 rounded-xl border dark:border-slate-700 dark:bg-slate-900/90 backdrop-blur p-3 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-auto">
          <span className="w-9 h-9 rounded-lg bg-blue-600 text-white grid place-items-center">
            <TrendingUp className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold dark:text-slate-100 leading-tight">
              Inteligência & Performance
            </h2>
            <p className="text-xs dark:dark:text-slate-500">{tituloData}</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs dark:text-slate-300">
          Período
          <select
            value={diaSelecionado ? "dia" : "mes"}
            onChange={(e) =>
              setDiaSelecionado(e.target.value === "dia" ? hoje.getDate() : null)
            }
            className="border rounded-lg px-2 py-1.5 text-sm dark:bg-slate-900"
          >
            <option value="mes">Mês atual</option>
            <option value="dia">Hoje</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs dark:text-slate-300">
          Médico
          <select
            value={medico}
            onChange={(e) => setMedico(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-sm dark:bg-slate-900"
          >
            <option value="todos">Todos</option>
            {medicos.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs dark:text-slate-300">
          Especialidade
          <select
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-sm dark:bg-slate-900"
          >
            <option value="todas">Todas</option>
            {especialidades.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </label>

        {diaSelecionado && (
          <button
            onClick={() => setDiaSelecionado(null)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <X className="w-3.5 h-3.5" /> Limpar dia
          </button>
        )}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* KPIs */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Kpi
            icon={<CalendarDays className="w-5 h-5" />}
            cor="bg-blue-50 text-blue-600"
            rotulo="Agendamentos"
            valor={String(kpis.total)}
            detalhe={`${kpis.cancelados} cancelados · ${kpis.noShow} no-show`}
          />
          <Kpi
            icon={<Users className="w-5 h-5" />}
            cor="bg-emerald-50 text-emerald-600"
            rotulo="Comparecimento"
            valor={`${kpis.taxaComparecimento}%`}
            detalhe="sobre o total do período"
          />
          <Kpi
            icon={<AlertTriangle className="w-5 h-5" />}
            cor="bg-amber-50 text-amber-600"
            rotulo="Taxa de falta"
            valor={
              kpis.total
                ? `${Math.round(((kpis.cancelados + kpis.noShow) / kpis.total) * 100)}%`
                : "0%"
            }
            detalhe="no-show + cancelamento"
          />
        </div>

        {/* Mini calendário de ocupação */}
        <div className="col-span-12 lg:col-span-3">
          <OcupacaoCalendar
            ano={hoje.getFullYear()}
            mes={hoje.getMonth() + 1}
            ocupacao={ocupacao}
            selecionado={
              diaSelecionado
                ? new Date(hoje.getFullYear(), hoje.getMonth(), diaSelecionado)
                : null
            }
            onSelecionar={setDiaSelecionado}
          />
        </div>

        {/* Gráfico de sazonalidade / horário */}
        <div className="col-span-12 lg:col-span-7 rounded-xl border dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm">
          <h3 className="text-sm font-semibold dark:text-slate-200 mb-1">
            {diaSelecionado
              ? "Faltas vs. comparecimentos por horário"
              : "Sazonalidade — faltas vs. comparecimentos por dia"}
          </h3>
          <p className="text-xs dark:text-slate-500 mb-3">
            Clique em um dia no calendário para filtrar até o nível de horário.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dadosBarras}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={diaSelecionado ? "horario" : "dia"} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip cursor={{ fill: "#f1f5f9" }} />
              <Legend />
              <Bar dataKey="compareceu" name="Compareceu" fill={COR_EMERALD} radius={[4, 4, 0, 0]} />
              <Bar dataKey="faltou" name="Faltou" fill={COR_ROSE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engajamento por faixa etária */}
        <div className="col-span-12 lg:col-span-5 rounded-xl border dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm">
          <h3 className="text-sm font-semibold dark:text-slate-200 mb-1">
            Engajamento por faixa etária
          </h3>
          <p className="text-xs dark:text-slate-500 mb-3">
            Distribuição dos comparecimentos por idade.
          </p>
          {dadosPizza.length === 0 ? (
            <p className="text-sm dark:text-slate-500 py-16 text-center">
              Sem dados no período selecionado
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  dataKey="valor"
                  nameKey="faixa"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {dadosPizza.map((_, i) => (
                    <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Insights */}
        <div className="col-span-12 lg:col-span-5 rounded-xl border dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm">
          <h3 className="text-sm font-semibold dark:text-slate-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Insights & ações sugeridas
          </h3>
          <div className="space-y-3">
            {insights.length === 0 && (
              <p className="text-sm dark:text-slate-500">Sem dados suficientes.</p>
            )}
            {insights.map((ins, i) => (
              <div
                key={i}
                className={[
                  "rounded-lg border-l-4 p-3 text-sm",
                  ins.tipo === "alerta"
                    ? "border-l-rose-500 bg-rose-50 text-rose-800"
                    : ins.tipo === "sugestao"
                    ? "border-l-amber-500 bg-amber-50 text-amber-800"
                    : "border-l-blue-500 bg-blue-50 text-blue-800",
                ].join(" ")}
              >
                {ins.texto}
              </div>
            ))}
          </div>
        </div>

        {/* Risco de no-show + contato */}
        <div className="col-span-12 lg:col-span-7 rounded-xl border dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm">
          <h3 className="text-sm font-semibold dark:text-slate-200 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Risco de no-show — pacientes do período
          </h3>
          <p className="text-xs dark:text-slate-500 mb-3">
            Score alto = histórico de faltas e/ou distância elevada.
          </p>
          {risco.length === 0 ? (
            <p className="text-sm dark:text-slate-500 py-10 text-center">
              Nenhum paciente de alto risco neste período.
            </p>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs dark:text-slate-500 border-b">
                    <th className="py-2 font-medium">Paciente</th>
                    <th className="py-2 font-medium">Horário</th>
                    <th className="py-2 font-medium">Faixa</th>
                    <th className="py-2 font-medium">Dist.</th>
                    <th className="py-2 font-medium">Score</th>
                    <th className="py-2 text-right font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {risco.map((p, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 font-medium dark:text-slate-200">{p.nome}</td>
                      <td className="py-2 dark:dark:text-slate-500">{p.horario}</td>
                      <td className="py-2 dark:dark:text-slate-500">{p.faixa}</td>
                      <td className="py-2 dark:dark:text-slate-500">{p.distancia} km</td>
                      <td className="py-2">
                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                            p.score >= 75
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700",
                          ].join(" ")}
                        >
                          {p.score}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <a
                          href={`https://wa.me/${p.telefone}?text=${encodeURIComponent(
                            "Olá! Lembrete de sua consulta. Confirme sua presença por favor."
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] dark:text-slate-500">
        Dados ilustrativos (mock determinístico) para demonstração da tela
        "Up Visual". Integração com dados reais pode ser feita no módulo{" "}
        <code className="bg-slate-100 px-1 rounded">services/upVisualData.ts</code>.
      </p>
    </div>
  );
}

function Kpi({
  icon,
  cor,
  rotulo,
  valor,
  detalhe,
}: {
  icon: React.ReactNode;
  cor: string;
  rotulo: string;
  valor: string;
  detalhe: string;
}) {
  return (
    <div className="rounded-xl border dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className={`w-9 h-9 rounded-lg grid place-items-center mb-3 ${cor}`}>
        {icon}
      </div>
      <p className="text-xs dark:dark:text-slate-500">{rotulo}</p>
      <p className="text-2xl font-bold dark:text-slate-100 mt-0.5">{valor}</p>
      <p className="text-[11px] dark:text-slate-500 mt-0.5">{detalhe}</p>
    </div>
  );
}
