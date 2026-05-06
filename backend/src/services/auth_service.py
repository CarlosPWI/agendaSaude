from src.config.database import supabase
from src.utils.validators import validar_tipousuario_existe
from src.exceptions.validation_exception import ValidationException
class AuthService:

    @staticmethod
    def login(email: str, password: str):
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not response or not response.user:
            raise ValidationException("Credenciais inválidas", 401)


        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": response.user
        }

    @staticmethod
    def register(nome: str, email: str, password: str, tipousuario_id: int):

        validar_tipousuario_existe(tipousuario_id)

        try:
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })

            user = auth_response.user

            if not user:
                raise ValidationException("Erro ao criar usuário", 400)

            response = supabase.table("usuarios").insert({
                "usuario_id": user.id,
                "nome": nome,
                "email": email,
                "tipousuario_id": tipousuario_id
            }).execute()

            if not response or not response.data:
                raise ValidationException("Erro ao salvar usuário", 500)

            return {
                "user": {
                    "id": user.id,
                    "email": user.email
                }
            }

        except Exception as e:
            raise ValidationException(str(e), 400)

    @staticmethod
    def refresh_token(refresh_token: str):
        response = supabase.auth.refresh_session({
            "refresh_token": refresh_token
        })

        if response.session is None:
            raise ValidationException("Refresh token inválido ou expirado", 401)

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }