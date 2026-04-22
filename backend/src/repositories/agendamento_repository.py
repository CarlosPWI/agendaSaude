# agendamento_repository.py
from src.repositories.base_repository import BaseRepository
from src.config.database import supabase

class AgendamentoRepository(BaseRepository):
    table = "agendamentos"
    id_field = "agendamento_id"

    @classmethod
    def buscar_conflitos(cls, inicio, fim):
        return supabase.table(cls.table) \
            .select("*") \
            .lte("data_hora_inicio", fim) \
            .gte("data_hora_fim", inicio) \
            .execute()