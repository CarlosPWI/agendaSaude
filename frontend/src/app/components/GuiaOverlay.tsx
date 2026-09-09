import { useState } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

interface Passo {
  titulo: string;
  texto: string;
}

const PASSOS: Passo[] = [
  {
    titulo: "Bem-vindo ao Guia",
    texto:
      "Este guia explica, passo a passo, os campos e telas do Agenda Saúde. Use os botões Anterior / Próximo para navegar.",
  },
  {
    titulo: "Menu de navegação",
    texto:
      "No topo você vê: Planner (visão da agenda), Consultas (todos os agendamentos), Novo Agendamento, Pacientes, Agentes e Up Visual.",
  },
  {
    titulo: "Planner",
    texto:
      "Mostra os agendamentos do dia ou da semana. Clique em 'Novo Agendamento' para criar um atendimento em horário livre.",
  },
  {
    titulo: "Consultas",
    texto:
      "Lista todos os agendamentos com filtros por período, paciente e status. Use 'Reagendar' para mudar horário, 'Cancelar' para cancelar e 'Histórico' para ver a trilha de alterações.",
  },
  {
    titulo: "Novo Agendamento",
    texto:
      "Preencha o paciente, a data e o horário. O sistema valida o horário cheio e evita conflitos com outros agendamentos.",
  },
  {
    titulo: "Pacientes",
    texto:
      "Cadastro e listagem de pacientes. O campo E-mail é obrigatório — é usado para enviar a confirmação de consulta.",
  },
  {
    titulo: "Agentes",
    texto:
      "Lista os agentes comunitários e quantos pacientes cada um atende. Você pode renomear um agente aqui.",
  },
  {
    titulo: "Up Visual",
    texto:
      "Painel analítico (provisório, com dados ilustrativos). Use o mini-calendário para filtrar os indicadores de um dia.",
  },
  {
    titulo: "Sair",
    texto:
      "O botão 'Sair' encerra a sessão e volta para a tela de login.",
  },
];

export function GuiaOverlay({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const [indice, setIndice] = useState(0);

  if (!aberto) return null;

  const passo = PASSOS[indice];
  const ultimo = indice === PASSOS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-blue-600 text-white grid place-items-center">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Guia do sistema
            </h3>
          </div>
          <button
            onClick={onFechar}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* barra de progresso */}
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mb-5">
          <div
            className="h-1.5 rounded-full bg-blue-600 transition-all"
            style={{ width: `${((indice + 1) / PASSOS.length) * 100}%` }}
          />
        </div>

        <div className="min-h-[120px]">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Passo {indice + 1} de {PASSOS.length}
          </p>
          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {passo.titulo}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {passo.texto}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6">
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
              onClick={() => setIndice((i) => Math.min(PASSOS.length - 1, i + 1))}
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
