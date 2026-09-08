from src.config.database import supabase_admin
from src.repositories.usuario_repository import UsuarioRepository
from src.exceptions.validation_exception import ValidationException
from src.utils.validators import validar_tipousuario_existe
class UsuarioService:

    @staticmethod
    def get_me(user_id: str):
        user = UsuarioRepository.buscar_por_id(user_id)
        if not user:
            raise ValidationException("Usuário não encontrado", 404)
        return user

    @staticmethod
    def get_by_id(user_id: str):
        return UsuarioService.get_me(user_id)

    @staticmethod
    def update(user_id: str, data):

        usuario = UsuarioRepository.buscar_por_id(user_id)
        if not usuario:
            raise ValidationException("Usuário não encontrado", 404)
    
        if hasattr(data, "model_dump"):
            data = data.model_dump(exclude_unset=True)

        data.pop("senha", None)
        data.pop("criado_em", None)

        tipousuario_id = data.get("tipousuario_id")
        if tipousuario_id is not None:
            validar_tipousuario_existe(tipousuario_id)

        if not data:
            raise ValidationException("Nenhum dado enviado para atualização", 400)

        return UsuarioRepository.atualizar(user_id, data)

    @staticmethod
    def delete(user_id: str):
        usuario = UsuarioRepository.buscar_por_id(user_id)
        if not usuario:
            raise ValidationException("Usuário não encontrado", 404)

        if UsuarioRepository.possui_agendamentos(user_id):
            raise ValidationException(
                "Não é possível excluir a conta: existem agendamentos "
                "vinculados a este usuário. Reatribua ou remova os "
                "agendamentos antes de excluir.",
                400
            )

        UsuarioService._deletar_do_auth(user_id)

        return UsuarioRepository.deletar(user_id)

    @staticmethod
    def _deletar_do_auth(user_id: str):
        """Remove a conta do Supabase Auth usando a service role key.

        Sem a chave configurada, a exclusão é bloqueada para não deixar
        contas fantasmas no Auth (pendência A-6).
        """
        if supabase_admin is None:
            raise ValidationException(
                "Exclusão de conta indisponível: SUPABASE_SERVICE_ROLE_KEY "
                "não configurada no backend",
                503
            )

        try:
            supabase_admin.auth.admin.delete_user(user_id)
        except Exception as e:
            # Conta já inexistente no Auth: segue com a remoção da linha
            if "not found" in str(e).lower():
                return

            raise ValidationException(
                f"Erro ao remover usuário do serviço de autenticação: {str(e)}",
                500
            )