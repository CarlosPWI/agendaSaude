import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { UserX, Percent, Clock, CalendarCheck2, Loader2 } from "lucide-react";

import { RelatorioPerdaPrimaria, fetchPerdaPrimaria } from "../../services/perdaService";
import { toast } from "sonner";

const CORES = ["#f43f5e", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

function intervalos(chave: "hoje" | "7d" | "30d" | "mes") {
  const agora = new Date();
  const fim = agora.toISOString();
  let inicio: Date;

  if (chave === "hoje") {
    inicio = new Date(agora);
    inicio.setHours(0, 0, 0, 0);
  } else if (chave === "mes") {
    inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
  } else {
    inicio = new Date(agora);
    inicio.setDate(inicio.getDate() - (chave === "7d" ? 7 : 30));
  }

  return { inicio: inicio.toISOString(), fim };
}

const OPCOES = [
  { chave: "7d", rotulo: "7 dias" },
  { chave: "30d", rotulo: "30 dias" },
  { chave: "mes", rotulo: "Mês" },
] as const;

export function PerdaPrimariaPainel() {
  const [periodo, setPeriodo] = useState<(typeof OPCOES)[number]["chave"]>("mes");
  const [dados, setDados] = useState<RelatorioPerdaPrimaria | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    const { inicio, fim } = intervalos(periodo);

    fetchPerdaPrimaria(inicio, fim)
      .then((r) => {
        if (ativo) setDados(r);
      })
      .catch(() => {
        if (ativo) toast.error("Erro ao carregar Perda Primária");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [periodo]);

  const kpi = dados?.kpis;
  const serie = useMemo(
    () =>
      (dados?.serie_diaria || []).map((d) => ({
        dia: d.dia.slice(5), // MM-DD
        Faltas: d.perdas,
        Cancelamentos: d.cancelados,
      })),
    [dados]
  );
  const motivos = dados?.motivos || [];

  return (
    <div className="rounded-2xl border border-rose-200 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-rose-600 text-white grid place-items-center">
            <UserX className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              Faltas & Perda Primária
            </h3>
            <p className="text-xs text-slate-500">
              Dados reais do sistema (absenteísmo)
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          {OPCOES.map((o) => (
            <button
              key={o.chave}
              onClick={() => setPeriodo(o.chave)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                periodo === o.chave
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
      </div>

      {carregando && (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
        </div>
      )}

      {!carregando && kpi && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card
              icono={<UserX className="w-4 h-4" />}
              cor="bg-rose-50 text-rose-600"
              rotulo="Faltas + Cancelamentos"
              valor={String(kpi.perdas)}
            />
            <Card
              icono={<Percent className="w-4 h-4" />}
              cor={kpi.taxa_absenteismo >= 25 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}
              rotulo="Taxa de absenteísmo"
              valor={`${kpi.taxa_absenteismo}%`}
            />
            <Card
              icono={<Clock className="w-4 h-4" />}
              cor="bg-amber-50 text-amber-600"
              rotulo="Horas produtivas perdidas"
              valor={`${kpi.horas_perdidas}h`}
            />
            <Card
              icono={<CalendarCheck2 className="w-4 h-4" />}
              cor="bg-blue-50 text-blue-600"
              rotulo="Comparecimento"
              valor={`${kpi.taxa_comparecimento}%`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">
                Volume por dia (faltas/cancelamentos)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={serie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dia" fontSize={10} />
                  <YAxis allowDecimals={false} fontSize={10} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Legend />
                  <Bar dataKey="Faltas" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Cancelamentos" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">
                Motivos da perda
              </p>
              {motivos.length === 0 ? (
                <p className="text-sm text-slate-400 py-12 text-center">
                  Nenhuma perda no período
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={motivos.map((m) => ({ name: m.motivo, value: m.qtd }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                    >
                      {motivos.map((_, i) => (
                        <Cell key={i} fill={CORES[i % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Card({
  icono,
  cor,
  rotulo,
  valor,
}: {
  icono: React.ReactNode;
  cor: string;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
      <div className={`w-8 h-8 rounded-lg grid place-items-center mb-2 ${cor}`}>
        {icono}
      </div>
      <p className="text-[11px] text-slate-500">{rotulo}</p>
      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{valor}</p>
    </div>
  );
}
