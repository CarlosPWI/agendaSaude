from src.services.base_service import now
from src.repositories.base_repository import BaseRepository
from src.config.database import supabase

class UsuarioRepository(BaseRepository):
    table = "usuarios"
    id_field = "usuario_id"

    @classmethod
    def listar(cls):
        return (
            supabase
            .table(cls.table)
            .select("usuario_id, email, nome, criado_em, atualizado_em, tiposusuarios(*)")
            .execute()
        )

    @classmethod
    def buscar_por_email(cls, email):
        return(
            supabase
            .table(cls.table)
            .select("*, tiposusuarios(*)")
            .eq("email", email) 
            .execute()
        )
    
    @classmethod
    def atualizar(cls, email, data):
        return (
            supabase
            .table(cls.table)
            .update(data)
            .eq("email", email)
            .execute()
        )