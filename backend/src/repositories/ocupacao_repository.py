from src.config.database import db


class OcupacaoRepository:
    table = "agenda_ocupacoes"

    @classmethod
    def listar(cls, limit: int | None = None, offset: int | None = None):
        query = db.table(cls.table).select("*").order("data_hora_inicio")

        if limit is not None:
            query = query.limit(limit)
        if offset is not None:
            query = query.offset(offset)

        response = query.execute()
        return response.data if response and response.data else []

    @classmethod
    def criar(cls, payload):
        response = db.table(cls.table).insert(payload).execute()
        return response.data[0] if response and response.data else None

    @classmethod
    def deletar(cls, value):
        response = db.table(cls.table).delete().eq("id", value).execute()
        return response.data[0] if response and response.data else None

    @classmethod
    def buscar_por_id(cls, value):
        response = (
            db.table(cls.table)
            .select("*")
            .eq("id", value)
            .maybe_single()
            .execute()
        )
        return response.data if response and response.data else None

    @classmethod
    def buscar_conflitos(cls, inicio, fim):
        response = (
            db.table(cls.table)
            .select("*")
            .lte("data_hora_inicio", fim)
            .gte("data_hora_fim", inicio)
            .execute()
        )
        return response.data if response and response.data else []
