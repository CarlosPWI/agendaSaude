from src.repositories.statusagendamento_repository import StatusAgendamentoRepository
from src.services.base_service import now
from src.exceptions.validation_exception import ValidationException
class StatusAgendamentoService:
    def criar(data):
        if not data["nome"] or data["nome"].strip() == "":
            raise ValidationException("O nome do status do agendamento é obrigatório")

        return StatusAgendamentoRepository.criar(data)

    def listar():
        return StatusAgendamentoRepository.listar()
   
