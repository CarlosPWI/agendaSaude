# agendamento_repository.py
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