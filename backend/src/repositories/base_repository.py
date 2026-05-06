from src.config.database import supabase
from src.services.base_service import now

class BaseRepository:

    table = None
    id_field = None

    @classmethod
    def criar(cls, data):
        data = cls._to_dict(data, exclude={"criado_em", "atualizado_em"})
        response = supabase.table(cls.table).insert(data).execute()
        return response.data[0] if response.data else None

    @classmethod
    def listar(cls):
        response = supabase.table(cls.table).select("*").execute()
        if not response:
            return []
        return response.data or []

    @classmethod
    def buscar_por_id(cls, value):
        response = ( supabase.table(cls.table).select("*").eq(cls.id_field, value).maybe_single().execute() )
        if not response:
            return []
        return response.data or []

    @classmethod
    def atualizar(cls, value, data):
        data = cls._to_dict(data, exclude={"criado_em"})
        data["atualizado_em"] = now()
        response = supabase.table(cls.table).update(data).eq(cls.id_field, value).execute()
        return response.data[0] if response.data else None

    @classmethod
    def deletar(cls, value):
        response = supabase.table(cls.table).delete().eq(cls.id_field, value).execute()
        return response.data[0] if response.data else None
    
    @staticmethod
    def _to_dict(data, exclude=None):
        if hasattr(data, "model_dump"):
            return data.model_dump(exclude=exclude or set(), exclude_unset=True)

        if hasattr(data, "dict"):
            return data.dict(exclude=exclude or set(), exclude_unset=True)

        if isinstance(data, dict):
            return data

        raise TypeError("Formato inválido")