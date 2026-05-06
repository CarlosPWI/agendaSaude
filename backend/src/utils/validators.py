from src.repositories.tiposusuarios_repository import TiposUsuariosRepository
from src.exceptions.validation_exception import ValidationException


def validar_tipousuario_existe(tipousuario_id: int):
    if not TiposUsuariosRepository.buscar_por_id(tipousuario_id):
        raise ValidationException( "Tipo de usuário inválido",400 )