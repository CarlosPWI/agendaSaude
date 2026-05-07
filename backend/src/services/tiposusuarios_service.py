from src.repositories.tiposusuarios_repository import TiposUsuariosRepository
from src.schemas.tiposusuarios_schema import (
    TiposUsuariosCreate,
    TiposUsuariosUpdate
)
from src.exceptions.validation_exception import ValidationException
class TiposUsuariosService:

    @staticmethod
    def criar(data: TiposUsuariosCreate):
        return TiposUsuariosRepository.criar(data)

    @staticmethod
    def listar():
        return TiposUsuariosRepository.listar()

    @staticmethod
    def buscar_por_id(id: int):
        tipo = TiposUsuariosRepository.buscar_por_id(id)

        if not tipo:
            raise ValidationException("Tipo de usuário não encontrado", 404)

        return tipo

    @staticmethod
    def atualizar(id: int, dados: TiposUsuariosUpdate):
        TiposUsuariosService._buscar_ou_erro(id)

        return TiposUsuariosRepository.atualizar(id, dados)

    @staticmethod
    def deletar(id: int):
        TiposUsuariosService._buscar_ou_erro(id)
        return TiposUsuariosRepository.deletar(id)

    @staticmethod
    def _buscar_ou_erro(id: int):
        tipo = TiposUsuariosRepository.buscar_por_id(id)

        if not tipo:
            raise ValidationException("Tipo de usuário não encontrado", 404)

        return tipo