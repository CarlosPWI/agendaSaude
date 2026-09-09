from src.repositories.statusagendamento_repository import StatusAgendamentoRepository
from src.schemas.statusagendamento_schema import (
    StatusAgendamentoCreate,
    StatusAgendamentoUpdate
)
from src.exceptions.validation_exception import ValidationException
class StatusAgendamentoService:

    @staticmethod
    def criar(data: StatusAgendamentoCreate):
        return StatusAgendamentoRepository.criar(data)

    @staticmethod
    def listar(limit: int = 100, offset: int = 0):
        return StatusAgendamentoRepository.listar(limit=limit, offset=offset)

    @staticmethod
    def buscar_por_id(id: int):
        tipo = StatusAgendamentoRepository.buscar_por_id(id)

        if not tipo:
            raise ValidationException("Status do agendamento não encontrado", 404)

        return tipo

    @staticmethod
    def atualizar(id: int, dados: StatusAgendamentoUpdate):
        StatusAgendamentoService._buscar_ou_erro(id)

        return StatusAgendamentoRepository.atualizar(id, dados)

    @staticmethod
    def deletar(id: int):
        StatusAgendamentoService._buscar_ou_erro(id)
        return StatusAgendamentoRepository.deletar(id)

    @staticmethod
    def _buscar_ou_erro(id: int):
        tipo = StatusAgendamentoRepository.buscar_por_id(id)

        if not tipo:
            raise ValidationException("Status do agendamento não encontrado", 404)

        return tipo