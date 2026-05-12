import json

from src.config.database import supabase
from src.services.base_service import now


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
    def listar(cls):

        response = (
            supabase
            .table(cls.table)
            .select("*")
            .execute()
        )

        return response.data or []

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

        return response.data or None

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

        return json.loads(json.dumps(payload, default=str))