from src.config.database import supabase
from datetime import datetime, timezone

class UsuarioService:

    @staticmethod
    def get_me(user_id: str):
        return supabase.table("usuarios") \
            .select("*") \
            .eq("usuario_id", user_id) \
            .single() \
            .execute().data


    @staticmethod
    def get_by_id(user_id: str):
        return supabase.table("usuarios") \
            .select("*") \
            .eq("usuario_id", user_id) \
            .single() \
            .execute().data


    @staticmethod
    def get_all():
        return supabase.table("usuarios") \
            .select("*") \
            .execute().data


    @staticmethod
    def update(user_id: str, data: dict):
        data.pop("criado_em", None)
        data.pop("password", None)
        data["atualizado_em"] = datetime.now(timezone.utc).isoformat()

        return supabase.table("usuarios") \
            .update(data) \
            .eq("usuario_id", user_id) \
            .execute().data


    @staticmethod
    def delete(user_id: str):
        return supabase.table("usuarios") \
            .delete() \
            .eq("usuario_id", user_id) \
            .execute().data