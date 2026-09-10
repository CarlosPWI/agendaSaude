from collections import defaultdict
from datetime import datetime, timezone

from src.exceptions.validation_exception import ValidationException
from src.repositories.agendamento_repository import AgendamentoRepository

# mapeia nomes de status (normalizados) para categorias de Perda Primária
STATUS_COMPARECEU = {"realizado", "concluido", "concluído"}
STATUS_NO_SHOW = {"faltou", "expirado", "no_show", "nao realizado", "não realizado"}
STATUS_CANCELADO = {"cancelado"}


def _norm(s: str) -> str:
    return (s or "").strip().lower()


def _categoria(status_nome: str) -> str:
    n = _norm(status_nome)
    if n in STATUS_COMPARECEU:
        return "compareceu"
    if n in STATUS_NO_SHOW:
        return "no_show"
    if n in STATUS_CANCELADO:
        return "cancelado"
    return "marcado"


class PerdaPrimariaService:
    """Agrega a Perda Primária (absenteísmo) a partir dos agendamentos reais.

    Como não há faturamento, a 'perda' é medida em nº de faltas e horas
    produtivas perdidas (cada consulta = 30 min).
    """

    @staticmethod
    def gerar_relatorio(inicio: str | None = None, fim: str | None = None):
        if not inicio or not fim:
            raise ValidationException("Informe inicio e fim (ISO)", 400)

        try:
            d_inicio = datetime.fromisoformat(inicio.replace("Z", "+00:00"))
            d_fim = datetime.fromisoformat(fim.replace("Z", "+00:00"))
        except ValueError:
            raise ValidationException("Datas em formato ISO inválido", 400)

        d_inicio = d_inicio.astimezone(timezone.utc)
        d_fim = d_fim.astimezone(timezone.utc)

        linhas = AgendamentoRepository.listar(limit=1000) or []

        # agendamentos no período (pela data_hora_inicio)
        no_periodo = []
        for a in linhas:
            di = a.get("data_hora_inicio")
            if not di:
                continue
            try:
                dt = datetime.fromisoformat(di.replace("Z", "+00:00"))
            except Exception:
                continue
            dt = dt.astimezone(timezone.utc)
            if d_inicio <= dt <= d_fim:
                no_periodo.append(a)

        total_marcados = 0
        total_compareceu = 0
        total_no_show = 0
        total_cancelado = 0
        horas_perdidas = 0.0
        por_dia = defaultdict(lambda: {"marcados": 0, "compareceu": 0, "perdas": 0, "cancelados": 0})
        por_motivo = defaultdict(int)

        for a in no_periodo:
            status_nome = (a.get("statusagendamento") or {}).get("nome") or ""
            cat = _categoria(status_nome)
            chave = a["data_hora_inicio"][:10]  # dia (UTC)

            # marcados = consultas não canceladas
            if cat != "cancelado":
                total_marcados += 1
                por_dia[chave]["marcados"] += 1
                if cat == "compareceu":
                    total_compareceu += 1
                    por_dia[chave]["compareceu"] += 1
                elif cat == "no_show":
                    total_no_show += 1
                    por_dia[chave]["perdas"] += 1
                    horas_perdidas += 0.5
                    por_motivo["Falta (não compareceu)"] += 1
            else:
                total_cancelado += 1
                por_dia[chave]["cancelados"] += 1
                por_motivo["Cancelamento"] += 1

        perdas = total_no_show + total_cancelado
        taxa_absenteismo = (
            round((perdas / total_marcados) * 100, 1) if total_marcados else 0.0
        )
        taxa_comparecimento = (
            round((total_compareceu / total_marcados) * 100, 1)
            if total_marcados
            else 0.0
        )

        serie_diaria = [
            {
                "dia": dia,
                "marcados": v["marcados"],
                "compareceu": v["compareceu"],
                "perdas": v["perdas"],
                "cancelados": v["cancelados"],
            }
            for dia, v in sorted(por_dia.items())
        ]

        motivos = [{"motivo": m, "qtd": q} for m, q in por_motivo.items()]

        return {
            "kpis": {
                "marcados": total_marcados,
                "compareceu": total_compareceu,
                "no_show": total_no_show,
                "cancelados": total_cancelado,
                "perdas": perdas,
                "taxa_absenteismo": taxa_absenteismo,
                "taxa_comparecimento": taxa_comparecimento,
                "horas_perdidas": horas_perdidas,
            },
            "serie_diaria": serie_diaria,
            "motivos": motivos,
            "funil": [
                {"etapa": "Marcados", "total": total_marcados},
                {"etapa": "Compareceram", "total": total_compareceu},
            ],
        }
