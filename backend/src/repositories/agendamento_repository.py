# agendamento_repository.py
from src.services.base_service import now
from src.repositories.base_repository import BaseRepository
from src.config.database import supabase
class AgendamentoRepository(BaseRepository):
    table = "agendamentos"
    id_field = "agendamento_id"

    @staticmethod
    def buscar_conflitos(inicio, fim):
        return supabase.table("agendamentos") \
            .select("*") \
            .lte("data_hora_inicio", fim) \
            .gte("data_hora_fim", inicio) \
            .execute()
    
    @classmethod
    def atualizar(cls, value, data):

        payload = cls._to_dict(
            data,
            exclude={"criado_em, data_hora_fim"}
        )
        payload["atualizado_em"] = now()

        response = (
            supabase
            .table(cls.table)
            .update(payload)
            .eq(cls.id_field, value)
            .execute()
        )
        return response.data[0] if response and response.data[0] else None

    @classmethod
    def listar(cls):

        response = (
            supabase
            .table(cls.table)
            .select("*, pacientes(*), statusagendamento(*), usuarios(*, tiposusuarios(*))")
            .execute()
        )

        return response.data if response and response.data else None