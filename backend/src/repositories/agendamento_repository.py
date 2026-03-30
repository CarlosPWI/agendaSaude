from src.config.database import supabase

class AgendamentoRepository:

    def inserir(self, dados):
        return supabase.table("agendamentos").insert(dados).execute()

    def listar(self):
        return supabase.table("agendamentos").select("*").execute()
    
    def buscar_por_periodo(self, inicio, fim):
        return (
            supabase
            .table("agendamentos")
            .select("*")
            .lte("data_hora_inicio", fim)
            .gte("data_hora_fim", inicio)
            .execute()
        )