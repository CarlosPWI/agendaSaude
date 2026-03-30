from datetime import datetime

from src.repositories.agendamento_repository import AgendamentoRepository
from src.models.agendamento import Agendamento
from src.exceptions.validation_exception import ValidationException

class AgendamentoService:

    def __init__(self):
        self.repo = AgendamentoRepository()

    def agendar(self, paciente_id, data_hora_inicio, data_hora_fim, status, observacoes):

        if data_hora_fim <= data_hora_inicio:
            raise ValidationException("Data e hora de fim devem ser posteriores à data e hora de início")

        diferenca = datetime.strptime(data_hora_fim, '%Y-%m-%d %H:%M:%S') - datetime.strptime(data_hora_inicio, '%Y-%m-%d %H:%M:%S')
        if diferenca.total_seconds() < ( 30 * 60 ):
            raise ValidationException("A duração do agendamento deve ser de pelo menos 30 minutos")

        if data_hora_inicio.hour < 8 or data_hora_fim.hour > 18:
            raise ValidationException("Fora do horário de atendimento")

        if data_hora_inicio < datetime.now():
            raise ValidationException("Não é possível agendar no passado")

        conflitos = self.repo.buscar_por_periodo(data_hora_inicio, data_hora_fim)
        if conflitos.data:
            raise ValidationException("Já existe agendamento neste horário")

        agendamento = Agendamento(
            paciente_id,
            data_hora_inicio,
            data_hora_fim,
            status,
            observacoes
        )

        return self.repo.inserir(agendamento.to_dict())

    def listar(self):
        return self.repo.listar()
    
    def buscar_por_periodo(self, inicio, fim):
        return self.repo.buscar_por_periodo(inicio, fim)
    
    def buscar_por_id(self, id):
        return self.repo.buscar_por_id(id)