from src.config.database import supabase
from src.utils.validators import validar_tipousuario_existe
from src.exceptions.validation_exception import ValidationException


class AuthService:

    @staticmethod
    def login(email: str, password: str):

        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            if not response.user or not response.session:
                raise ValidationException(
                    "Credenciais inválidas",
                    401
                )

            return {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "user": {
                    "id": response.user.id,
                    "email": response.user.email
                }
            }

        except Exception as e:

            error_message = str(e)

            if (
                "Invalid login credentials"
                in error_message
            ):
                raise ValidationException(
                    "E-mail ou senha inválidos",
                    401
                )

            raise ValidationException(
                f"Erro ao realizar login: {error_message}",
                500
            )