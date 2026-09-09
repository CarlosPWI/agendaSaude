import {
  addDays,
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  DiaOcupacao,
  DIAS_SEMANA,
  corOcupacao,
} from "../../services/upVisualData";

interface Props {
  ano: number;
  mes: number; // 1-12
  ocupacao: DiaOcupacao[];
  selecionado: Date | null;
  onSelecionar: (dia: number) => void;
}

export function OcupacaoCalendar({
  ano,
  mes,
  ocupacao,
  selecionado,
  onSelecionar,
}: Props) {
  const porDia = new Map<number, DiaOcupacao>();
  for (const d of ocupacao) porDia.set(d.dia, d);

  const primeiro = startOfMonth(new Date(ano, mes - 1, 1));
  const gridInicio = startOfWeek(primeiro, { weekStartsOn: 0 });
  const gridFim = endOfWeek(endOfMonth(primeiro), { weekStartsOn: 0 });

  const dias = [];
  let cursor = gridInicio;
  while (cursor <= gridFim) {
    dias.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return (
    <div className="rounded-xl border dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold dark:text-slate-200">
          Ocupação —{" "}
          <span className="capitalize">
            {format(primeiro, "MMMM yyyy", { locale: ptBR })}
          </span>
        </h3>
        <div className="flex items-center gap-2 text-[10px] dark:dark:text-slate-500">
          <span className="flex items-center gap-1">
            <i className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            &lt;50%
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block w-2 h-2 rounded-full bg-amber-400" />
            50–89%
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block w-2 h-2 rounded-full bg-rose-500" />
            ≥90%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_SEMANA.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium dark:text-slate-500 py-1"
          >
            {d}
          </div>
        ))}

        {dias.map((dia) => {
          const noMes = dia.getMonth() === mes - 1;
          const info = porDia.get(dia.getDate());
          const selecionadoHoje = selecionado && isSameDay(dia, selecionado);

          return (
            <button
              key={dia.toISOString()}
              type="button"
              disabled={!noMes}
              onClick={() => noMes && onSelecionar(dia.getDate())}
              title={
                noMes && info
                  ? `${dia.getDate()}/${mes} — ${Math.round(
                      info.ocupacao * 100
                    )}% ocupado · ${info.cancelados} cancelados`
                  : "Sem agenda"
              }
              className={[
                "aspect-square rounded-md flex flex-col items-center justify-center text-xs transition",
                noMes ? "cursor-pointer" : "opacity-20 cursor-default",
                info
                  ? `${corOcupacao(info.ocupacao)} text-white`
                  : "dark:bg-slate-800 dark:text-slate-500",
                selecionadoHoje
                  ? "ring-2 ring-blue-600 ring-offset-1"
                  : "hover:scale-105",
              ].join(" ")}
            >
              <span className="font-medium">{dia.getDate()}</span>
              {info && (
                <span className="text-[8px] leading-none opacity-90">
                  {Math.round(info.ocupacao * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
