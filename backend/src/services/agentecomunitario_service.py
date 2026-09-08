from src.repositories.agentecomunitario_repository import AgenteComunitarioRepository
from src.schemas.agentecomunitario_schema import (
    AgenteComunitarioCreate,
    AgenteComunitarioUpdate
)
from src.exceptions.validation_exception import ValidationException
class AgenteComunitarioService:
    @staticmethod
    def criar(data: AgenteComunitarioCreate):
        return AgenteComunitarioRepository.criar(data)

    @staticmethod
    def listar(limit: int = 100, offset: int = 0):
        return AgenteComunitarioRepository.listar(limit=limit, offset=offset)

    @staticmethod
    def buscar_por_id(id: int):
        tipo = AgenteComunitarioRepository.buscar_por_id(id)

        if not tipo:
            raise ValidationException("Agente comunitário não encontrado", 404)

        return tipo

    @staticmethod
    def atualizar(id: int, dados: AgenteComunitarioUpdate):
        AgenteComunitarioService._buscar_ou_erro(id)

        return AgenteComunitarioRepository.atualizar(id, dados)

    @staticmethod
    def deletar(id: int):
        AgenteComunitarioService._buscar_ou_erro(id)
        return AgenteComunitarioRepository.deletar(id)

    @staticmethod
    def _buscar_ou_erro(id: int):
        tipo = AgenteComunitarioRepository.buscar_por_id(id)

        if not tipo:
            raise ValidationException("Agente comunitário não encontrado", 404)

        return tipo