from src.config.database import supabase

class AgenteComunitarioRepository:

    def inserir(self, dados):
        return supabase.table("agentescomunitarios").insert(dados).execute()

    def listar(self):
        return supabase.table("agentescomunitarios").select("*").execute()
    
    def buscar_por_id(self, id):
        return supabase.table("agentescomunitarios").select("*").eq("agentecomunitario_id", id).execute()
    
    def deletar(self, id):
        return supabase.table("agentescomunitarios").delete().eq("agentecomunitario_id", id).execute()