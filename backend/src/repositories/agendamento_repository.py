from src.config.database import supabase

class AgendamentoRepository:

    def inserir(self, dados):
        return supabase.table("agendamentos").insert(dados).execute()

    def listar(self):
        return supabase.table("agendamentos").select("*, statusagendamentos(*)").execute()
    
    def buscar_por_periodo(self, inicio, fim):
        return (
            supabase
            .table("agendamentos")
            .select("*")
            .lte("data_hora_inicio", fim)
            .gte("data_hora_fim", inicio)
            .execute()
        )
    
    def buscar_por_id(self, id):
        return supabase.table("agendamentos").select("*").eq("agendamento_id", id).execute()
    
    def deletar(self, id):
        return supabase.table("agendamentos").delete().eq("agendamento_id", id).execute()