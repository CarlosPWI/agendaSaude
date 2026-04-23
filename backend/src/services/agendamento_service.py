from src.repositories.agendamento_repository import AgendamentoRepository
from src.services.base_service import now
from src.exceptions.validation_exception import ValidationException

class AgendamentoService:
    def criar(data):

        if not data["data_hora_inicio"] or not data["data_hora_fim"]:
            raise ValidationException("Data e hora de início e fim são obrigatórias")

        if data["data_hora_fim"] <= data["data_hora_inicio"]:
            raise ValidationException("Data e hora de fim devem ser posteriores à data e hora de início")

        if data["data_hora_inicio"] < now():
            raise ValidationException("Não é possível agendar no passado")

        if (data["data_hora_fim"] - data["data_hora_inicio"]).total_seconds() < 30 * 60:
            raise ValidationException("A duração do agendamento deve ser de pelo menos 30 minutos")

        if data["data_hora_inicio"].hour < 8 or data["data_hora_fim"].hour > 18:
            raise ValidationException("Fora do horário de atendimento (8h às 18h)")

        conflitos = AgendamentoRepository.buscar_conflitos(
            data["data_hora_inicio"],
            data["data_hora_fim"]
        )

        if conflitos.data:
            raise Exception("Conflito de horário")

        return AgendamentoRepository.criar(data)

    def listar():
        return AgendamentoRepository.listar()
