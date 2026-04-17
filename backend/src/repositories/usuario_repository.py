from src.repositories.base_repository import BaseRepository
from src.config.database import supabase

class UsuarioRepository(BaseRepository):
    table = "usuarios"
    id_field = "usuario_id"

    @staticmethod
    def buscar_por_email(email):
        return (
            supabase
            .table("usuarios")
            .select("*, tiposusuarios(*)")
            .eq("email", email) 
            .execute()
        )    