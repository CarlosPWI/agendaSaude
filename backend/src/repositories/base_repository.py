from src.services.base_service import now
from src.config.database import supabase

class BaseRepository:

    table = None
    id_field = None

    @classmethod
    def criar(cls, data):
        data.pop("criado_em", None)
        return supabase.table(cls.table).insert(data).execute()

    @classmethod
    def listar(cls):
        return supabase.table(cls.table).select("*").execute()

    @classmethod
    def buscar_por_id(cls, value):
        return supabase.table(cls.table).select("*").eq(cls.id_field, value).single().execute()

    @classmethod
    def atualizar(cls, value, data):
        data.pop("criado_em", None)
        data["atualizado_em"] = now()
        return supabase.table(cls.table).update(data).eq(cls.id_field, value).execute()

    @classmethod
    def deletar(cls, value):
        return supabase.table(cls.table).delete().eq(cls.id_field, value).execute()