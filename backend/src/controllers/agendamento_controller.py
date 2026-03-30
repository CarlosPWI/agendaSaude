from src.services.agendamento_service import AgendamentoService
from src.exceptions.validation_exception import ValidationException

class AgendamentoController:

    def __init__(self):
        self.service = AgendamentoService()

    def criar(self, paciente_id, data_hora_inicio, data_hora_fim, status, observacoes):
        try:
            return self.service.agendar(paciente_id, data_hora_inicio, data_hora_fim, status, observacoes)
        except ValidationException as e:
            return {"erro": e.message}

    def listar(self):
        return self.service.listar()
    
    def buscar_por_periodo(self, inicio, fim):
        return self.service.buscar_por_periodo(inicio, fim)

    def buscar_por_id(self, id):
        return self.service.buscar_por_id(id)

    def deletar(self, id):
        return self.service.deletar(id)