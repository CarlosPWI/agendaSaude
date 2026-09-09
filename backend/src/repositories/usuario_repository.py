from src.repositories.base_repository import BaseRepository
from src.config.database import db
from src.services.base_service import now

class UsuarioRepository(BaseRepository):
    table = "usuarios"
    id_field = "usuario_id"

    @classmethod
    def possui_agendamentos(cls, value) -> bool:
        response = (
            db
            .table("agendamentos")
            .select("agendamento_id")
            .eq("usuario_id", value)
            .limit(1)
            .execute()
        )
        return bool(response.data)

    @classmethod
    def buscar_nomes(cls, ids) -> dict:
        """Retorna {usuario_id: {nome, email}} para uma lista de ids."""
        if not ids:
            return {}

        response = (
            db
            .table("usuarios")
            .select("usuario_id, nome, email")
            .in_("usuario_id", list(ids))
            .execute()
        )

        return {
            item["usuario_id"]: item
            for item in (response.data or [])
        }

    @classmethod
    def buscar_por_id(cls, value):
        response = (
            db
            .table(cls.table)
            .select("usuario_id, email, nome, criado_em, atualizado_em, tiposusuarios(*)")
            .eq(cls.id_field, value)
            .maybe_single()
            .execute()
        )
        return cls._extrair_data(response)

    @classmethod
    def buscar_por_email(cls, email):
        response = (
            db
            .table(cls.table)
            .select("usuario_id, email, nome, criado_em, atualizado_em, tiposusuarios(*)")
            .eq("email", email)
            .maybe_single()
            .execute()
        )
        return cls._extrair_data(response)

    @classmethod
    def atualizar(cls, value, data):
        payload = cls._to_dict(data)
        payload["atualizado_em"] = now()
        response = db.table(cls.table).update(payload).eq(cls.id_field, value).execute()
        return response.data[0] if response.data else None