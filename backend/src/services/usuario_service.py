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
    def get_all():
        return UsuarioRepository.listar()

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
        return UsuarioRepository.deletar(user_id)