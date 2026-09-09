# agendamento_repository.py
from src.services.base_service import now
from src.repositories.base_repository import BaseRepository
from src.config.database import db
class AgendamentoRepository(BaseRepository):
    table = "agendamentos"
    id_field = "agendamento_id"

    @staticmethod
    def buscar_conflitos(inicio, fim):
        return db.table("agendamentos") \
            .select("*") \
            .lte("data_hora_inicio", fim) \
            .gte("data_hora_fim", inicio) \
            .eq("cancelado", False) \
            .execute()

    @classmethod
    def cancelar(cls, value):
        payload = {"cancelado": True}
        payload["atualizado_em"] = now()

        response = (
            db
            .table(cls.table)
            .update(payload)
            .eq(cls.id_field, value)
            .execute()
        )
        return response.data[0] if response.data else None
    
    @classmethod
    def atualizar(cls, value, data):

        payload = cls._to_dict(
            data,
            exclude={"criado_em"}
        )
        payload["atualizado_em"] = now()

        response = (
            db
            .table(cls.table)
            .update(payload)
            .eq(cls.id_field, value)
            .execute()
        )
        return response.data[0] if response.data else None

    @classmethod
    def listar(
        cls,
        limit: int | None = None,
        offset: int | None = None,
    ):

        query = (
            db
            .table(cls.table)
            .select("*, pacientes(*), statusagendamento(*), usuarios(*, tiposusuarios(*))")
        )

        if limit is not None:
            query = query.limit(limit)

        if offset is not None:
            query = query.offset(offset)

        response = query.execute()

        return response.data if response.data else None