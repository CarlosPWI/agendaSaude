from src.config.database import supabase

class StatusAgendamentoRepository:

    def inserir(self, dados):
        return supabase.table("statusagendamentos").insert(dados).execute()

    def listar(self):
        return supabase.table("statusagendamentos").select("*").execute()
    
    def buscar_por_id(self, id):
        return supabase.table("statusagendamentos").select("*").eq("statusagendamento_id", id).execute()
    
    def deletar(self, id):
        return supabase.table("statusagendamentos").delete().eq("statusagendamento_id", id).execute()