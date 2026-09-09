import json
from datetime import date, datetime

from src.config.database import db


def _serializar(valor):
    if isinstance(valor, (datetime, date)):
        return valor.isoformat()
    return str(valor)


class AgendamentoAuditoriaRepository:
    """Registra e consulta a trilha de auditoria dos agendamentos."""

    table = "agendamentos_auditoria"

    @classmethod
    def registrar(
        cls,
        agendamento_id: int,
        usuario_id: str | None,
        acao: str,
        dados: dict | None = None
    ):
        payload = {
            "agendamento_id": agendamento_id,
            "usuario_id": usuario_id,
            "acao": acao,
            "dados": json.loads(
                json.dumps(dados or {}, default=_serializar)
            )
        }

        response = (
            db
            .table(cls.table)
            .insert(payload)
            .execute()
        )

        return response.data[0] if response.data else None

    @classmethod
    def listar_por_agendamento(cls, agendamento_id: int):
        response = (
            db
            .table(cls.table)
            .select("*")
            .eq("agendamento_id", agendamento_id)
            .order("criado_em", desc=False)
            .execute()
        )

        return response.data if response.data else []
