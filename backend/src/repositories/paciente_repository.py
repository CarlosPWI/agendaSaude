from src.config.database import supabase

class PacienteRepository:

    def inserir(self, dados):
        return supabase.table("pacientes").insert(dados).execute()

    def listar(self):
        return supabase.table("pacientes").select("*").execute()
    
    def buscar_por_id(self, id):
        return supabase.table("pacientes").select("*").eq("paciente_id", id).execute()
    
    def deletar(self, id):
        return supabase.table("pacientes").delete().eq("paciente_id", id).execute()