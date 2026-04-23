# tipousuario_service.py
from src.repositories.tipousuario_repository import TipoUsuarioRepository
from src.services.base_service import now
from src.exceptions.validation_exception import ValidationException

class TipoUsuarioService:
    def criar(data):
        if not data["nome"] or data["nome"].strip() == "":
            raise ValidationException("O nome do tipo de usuário é obrigatório")

        if len(data["nome"].strip()) >= 50:
            raise ValidationException("O nome do tipo de usuário deve ter no máximo 50 caracteres")

        return TipoUsuarioRepository.criar(data)

    def listar():
        return TipoUsuarioRepository.listar()
