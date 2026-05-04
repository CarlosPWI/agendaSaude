from src.config.database import supabase

class AuthService:

    @staticmethod
    def login(email: str, password: str):
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if response.user is None:
            raise Exception("Credenciais inválidas")

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": response.user
        }

    @staticmethod
    def register(nome: str, email: str, password: str, tipousuario_id: int):
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        user = auth_response.user

        if user is None:
            raise Exception("Erro ao criar usuário")

        supabase.table("usuarios").insert({
            "usuario_id": user.id,
            "nome": nome,
            "email": email,
            "tipousuario_id": tipousuario_id
        }).execute()

        return {
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email
            }
        }
    
    @staticmethod
    def refresh_token(refresh_token: str):
        response = supabase.auth.refresh_session({
            "refresh_token": refresh_token
        })

        if response.session is None:
            raise Exception("Refresh token inválido ou expirado")

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }