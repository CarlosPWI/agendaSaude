import json
from datetime import date, datetime

from src.config.database import supabase
from src.services.base_service import now


def _serializer(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return str(value)


class BaseRepository:

    table = None
    id_field = None

    @classmethod
    def criar(cls, data):

        payload = cls._to_dict(
            data,
            exclude={"criado_em", "atualizado_em"}
        )

        response = (
            supabase
            .table(cls.table)
            .insert(payload)
            .execute()
        )

        return response.data[0] if response.data else None

    @classmethod
    def listar(
        cls,
        limit: int | None = None,
        offset: int | None = None,
    ):

        query = supabase.table(cls.table).select("*")

        if limit is not None:
            query = query.limit(limit)

        if offset is not None:
            query = query.offset(offset)

        response = query.execute()

        return response.data if response.data else None

    @classmethod
    def buscar_por_id(cls, value):

        response = (
            supabase
            .table(cls.table)
            .select("*")
            .eq(cls.id_field, value)
            .maybe_single()
            .execute()
        )

        return cls._extrair_data(response)

    @staticmethod
    def _extrair_data(response):
        """Retorna os dados de uma resposta PostgREST de forma segura.

        Em consultas com `.maybe_single()`, o cliente supabase-py pode
        retornar `None` quando não há registro — antes isso gerava
        AttributeError (HTTP 500) em vez de "não encontrado".
        """
        return response.data if response and response.data else None

    @classmethod
    def atualizar(cls, value, data):

        payload = cls._to_dict(
            data,
            exclude={"criado_em"}
        )

        payload["atualizado_em"] = now()

        response = (
            supabase
            .table(cls.table)
            .update(payload)
            .eq(cls.id_field, value)
            .execute()
        )

        return response.data[0] if response.data else None

    @classmethod
    def deletar(cls, value):

        response = (
            supabase
            .table(cls.table)
            .delete()
            .eq(cls.id_field, value)
            .execute()
        )

        return response.data[0] if response.data else None

    @staticmethod
    def _to_dict(data, exclude=None):

        exclude = exclude or set()

        if hasattr(data, "model_dump"):
            payload = data.model_dump(
                mode="json",
                exclude=exclude,
                exclude_unset=True
            )

        elif hasattr(data, "dict"):
            payload = data.dict(
                exclude=exclude,
                exclude_unset=True
            )

        elif isinstance(data, dict):
            payload = data

        else:
            raise TypeError("Formato inválido")

        return json.loads(
            json.dumps(payload, default=_serializer)
        )