from src.repositories.base_repository import BaseRepository
from src.config.database import supabase

class UsuarioRepository(BaseRepository):
    table = "usuarios"
    id_field = "usuario_id"

    @classmethod
    def buscar_por_email(cls, email):
        return(
            supabase
            .table(cls.table)
            .select("*, tiposusuarios(*)")
            .eq("email", email) 
            .execute()
        )