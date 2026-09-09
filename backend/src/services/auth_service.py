import os

from supabase import create_client

from src.config.database import SUPABASE_URL, SUPABASE_KEY, supabase, db
from src.repositories.usuario_repository import UsuarioRepository
from src.utils.validators import validar_tipousuario_existe
from src.exceptions.validation_exception import ValidationException


class AuthService:

    @staticmethod
    def register(nome: str, email: str, password: str, tipousuario_id: int):

        validar_tipousuario_existe(tipousuario_id)

        if len(password) < 6:
            raise ValidationException(
                "A senha deve ter no mínimo 6 caracteres",
                400
            )

        try:
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
        except Exception as e:
            error_message = str(e).lower()

            if (
                "already registered" in error_message
                or "already exists" in error_message
            ):
                raise ValidationException(
                    "E-mail já cadastrado",
                    409
                )

            raise ValidationException(
                f"Erro ao criar usuário: {str(e)}",
                500
            )

        if not auth_response.user:
            raise ValidationException(
                "Erro ao criar usuário no serviço de autenticação",
                500
            )

        user = auth_response.user

        try:
            UsuarioRepository.criar({
                "usuario_id": user.id,
                "nome": nome,
                "email": email,
                "tipousuario_id": tipousuario_id
            })
        except Exception as e:
            raise ValidationException(
                f"Erro ao registrar usuário no banco de dados: {str(e)}",
                500
            )

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "nome": nome
            }
        }

    @staticmethod
    def login(email: str, password: str):

        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
        except Exception as e:
            error_message = str(e)
            error_message_lower = error_message.lower()

            if (
                "invalid login credentials"
                in error_message_lower
            ):
                raise ValidationException(
                    "E-mail ou senha inválidos",
                    401
                )

            if (
                "email not confirmed"
                in error_message_lower
                or "not confirmed" in error_message_lower
            ):
                raise ValidationException(
                    "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
                    403
                )

            raise ValidationException(
                f"Erro ao realizar login: {error_message}",
                500
            )

        if not response.user or not response.session:
            raise ValidationException(
                "Credenciais inválidas",
                401
            )

        usuario_response = (
            db
            .table("usuarios")
            .select("*")
            .eq("usuario_id", response.user.id)
            .maybe_single()
            .execute()
        )

        usuario = (
            usuario_response.data
            if usuario_response and usuario_response.data
            else None
        )

        if not usuario:
            raise ValidationException(
                "Usuário não cadastrado no sistema",
                403
            )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "nome": usuario["nome"]
            }
        }

    @staticmethod
    def refresh(refresh_token: str):

        try:
            response = supabase.auth.refresh_session(refresh_token)
        except Exception:
            raise ValidationException(
                "Sessão expirada. Faça login novamente.",
                401
            )

        if not response.session:
            raise ValidationException(
                "Sessão expirada. Faça login novamente.",
                401
            )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }

    @staticmethod
    def forgot_password(email: str):
        """Dispara o e-mail de recuperação de senha do Supabase.

        Sempre retorna sucesso para não revelar se o e-mail existe.
        """
        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173"
        ).rstrip("/")

        try:
            supabase.auth.reset_password_for_email(
                email,
                options={
                    "redirect_to": f"{frontend_url}/reset-password"
                }
            )
        except Exception:
            # Não expõe se o e-mail existe ou se houve erro interno
            pass

        return {
            "message": (
                "Se o e-mail estiver cadastrado, "
                "você receberá o link de recuperação."
            )
        }

    @staticmethod
    def reset_password(
        access_token: str,
        refresh_token: str,
        password: str
    ):
        """Troca a senha usando os tokens do link de recuperação."""
        if len(password) < 6:
            raise ValidationException(
                "A senha deve ter no mínimo 6 caracteres",
                400
            )

        # Cliente isolado para não poluir a sessão do cliente global
        client = create_client(SUPABASE_URL, SUPABASE_KEY)

        try:
            client.auth.set_session(access_token, refresh_token)
            client.auth.update_user({"password": password})
        except Exception as e:
            raise ValidationException(
                "Link de recuperação inválido ou expirado. "
                "Solicite um novo.",
                401
            )

        return {"message": "Senha alterada com sucesso"}
