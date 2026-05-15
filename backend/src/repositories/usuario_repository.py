from src.repositories.base_repository import BaseRepository
from src.config.database import supabase
from src.services.base_service import now

class UsuarioRepository(BaseRepository):
    table = "usuarios"
    id_field = "usuario_id"

    @classmethod
    def listar(cls):
        response = supabase.table(cls.table).select("usuario_id, email, nome, criado_em, atualizado_em, tiposusuarios(*)").execute()
        return response.data if response and response.data else None

    @classmethod
    def buscar_por_id(cls, value):
        response = ( supabase.table(cls.table).select("usuario_id, email, nome, criado_em, atualizado_em, tiposusuarios(*)").execute() )
        if not response:
            return []
        return response.data if response and response.data else None

    @classmethod
    def buscar_por_email(cls, email):
        response = supabase.table(cls.table).select("usuario_id, email, nome, criado_em, atualizado_em, tiposusuarios(*)").eq("email", email).execute()
        return response.data[0] if response and response.data[0] else None

    @classmethod
    def atualizar(cls, value, data):
        data = cls._to_dict(data, exclude={"criado_em"})
        data = cls._to_dict(data, exclude={"email"})
        data["atualizado_em"] = now()
        response = supabase.table(cls.table).update(data).eq(cls.id_field, value).execute()
        return response.data[0] if response and response.data[0] else None    