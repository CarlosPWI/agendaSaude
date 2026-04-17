from src.config.database import supabase

class UsuarioRepository:

    def inserir(self, dados):
        return supabase.table("usuarios").insert(dados).execute()
    
    def listar(self):
        return supabase.table("usuarios").select("*, tiposusuarios(*)").execute()

    def buscar_por_email(self, email):
        return (
            supabase
            .table("usuarios")
            .select("*, tiposusuarios(*)")
            .eq("email", email) 
            .execute()
        )
        
    def buscar_por_id(self, id):
        return (
            supabase
            .table("usuarios")
            .select("*, tiposusuarios(*)")
            .eq("usuario_id", id) 
            .execute()
        )
    
    def deletar(self, id):
        return supabase.table("usuarios").delete().eq("usuario_id", id).execute()