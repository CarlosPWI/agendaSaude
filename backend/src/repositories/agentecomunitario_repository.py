from src.config.database import supabase

class AgenteComunitarioRepository:

    def inserir(self, dados):
        return supabase.table("agentescomunitarios").insert(dados).execute()

    def listar(self):
        return supabase.table("agentescomunitarios").select("*").execute()