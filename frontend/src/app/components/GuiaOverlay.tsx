import { useLayoutEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

interface Passo {
  titulo: string;
  texto: string;
  alvo?: string; // valor de data-guia a destacar (ex.: "menu-consultas")
}

const PASSOS: Passo[] = [
  {
    titulo: "Bem-vindo ao Guia",
    texto:
      "Este guia explica, passo a passo, as telas e campos. Avance com Próximo. Em cada passo, o item correspondente é DESTACADO na tela para você se localizar.",
    alvo: "cabecalho",
  },
  {
    titulo: "Menu de navegação",
    texto:
      "O menu no topo leva às telas: Planner, Consultas, Novo Agendamento, Pacientes, Agentes e Up Visual. O item atual fica azul.",
    alvo: "menu-planner",
  },
  {
    titulo: "Planner",
    texto:
      "Mostra a agenda em blocos de 30 minutos. Cada horário livre tem botões para marcar Reunião, Grupo ou Bloquear. Os agendados aparecem com o paciente.",
    alvo: "menu-planner",
  },
  {
    titulo: "Consultas",
    texto:
      "Lista todos os agendamentos com filtros. Aqui você reage (Reagendar), cancela, vê o Histórico e o Risco de falta de cada paciente.",
    alvo: "menu-consultas",
  },
  {
    titulo: "Novo Agendamento",
    texto:
      "Cria uma consulta de 30 minutos. Informe paciente, data e horário; o sistema evita conflito e horário ocupado.",
    alvo: "menu-novo-agendamento",
  },
  {
    titulo: "Pacientes",
    texto:
      "Cadastro e listagem de pacientes. O e-mail é obrigatório (usado para envio de confirmação).",
    alvo: "menu-pacientes",
  },
  {
    titulo: "Agentes",
    texto:
      "Lista os agentes comunitários e quantos pacientes cada um atende. Dá para renomear aqui.",
    alvo: "menu-agentes",
  },
  {
    titulo: "Up Visual",
    texto:
      "Painel analítico (provisório). Use o mini-calendário para filtrar os indicadores de um dia.",
    alvo: "menu-up-visual",
  },
  {
    titulo: "Sair",
    texto:
      "O botão Sair encerra a sessão e volta ao login.",
    alvo: "sair",
  },
];

function acharAlvo(alvo?: string): HTMLElement | null {
  if (!alvo) return null;
  return document.querySelector(`[data-guia="${alvo}"]`);
}

export function GuiaOverlay({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: () => void;
}) {
  const [indice, setIndice] = useState(0);
  const [ret, setRet] = useState<DOMRect | null>(null);

  const passo = PASSOS[indice];
  const ultimo = indice === PASSOS.length - 1;

  useLayoutEffect(() => {
    if (!aberto) return;

    const el = acharAlvo(PASSOS[indice].alvo);

    if (el) {
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
      setRet(el.getBoundingClientRect());
    } else {
      setRet(null);
    }
  }, [aberto, indice]);

  if (!aberto) return null;

  const destaque = ret
    ? {
        left: ret.left,
        top: ret.top,
        width: ret.width,
        height: ret.height,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Destaque do elemento: escurece o resto com box-shadow */}
      {destaque && (
        <div
          className="pointer-events-none rounded-lg ring-2 ring-blue-500 ring-offset-2 transition-all"
          style={{
            position: "fixed",
            left: destaque.left - 6,
            top: destaque.top - 6,
            width: destaque.width + 12,
            height: destaque.height + 12,
            boxShadow: "0 0 0 100vmax rgba(15, 23, 42, 0.6)",
          }}
        />
      )}

      {/* Card do guia */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[min(92vw,520px)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Passo {indice + 1} de {PASSOS.length} — {passo.titulo}
            </span>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mb-3">
          <div
            className="h-1.5 rounded-full bg-blue-600 transition-all"
            style={{ width: `${((indice + 1) / PASSOS.length) * 100}%` }}
          />
        </div>

        {!destaque && (
          <p className="text-xs text-amber-600 mb-2">
            (Não encontrei o elemento destacável desta etapa na tela atual — use
            o menu para navegar.)
          </p>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {passo.texto}
        </p>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setIndice((i) => Math.max(0, i - 1))}
            disabled={indice === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {ultimo ? (
            <button
              onClick={onFechar}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
            >
              Concluir
            </button>
          ) : (
            <button
              onClick={() =>
                setIndice((i) => Math.min(PASSOS.length - 1, i + 1))
              }
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
