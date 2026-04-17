from src.repositories.statusagendamento_repository import StatusAgendamentoRepository
from src.models.statusagendamento import StatusAgendamento
from src.exceptions.validation_exception import ValidationException

class StatusAgendamentoService:

    def __init__(self):
        self.repo = StatusAgendamentoRepository()

    def cadastrar(self, nome):
        if not nome or nome.strip() == "":
            raise ValidationException("O nome do status do agendamento é obrigatório")

        status_agendamento = StatusAgendamento(nome)

        return self.repo.inserir(status_agendamento.to_dict())

    def listar(self):
        return self.repo.listar()
    
    def buscar_por_id(self, id):
        return self.repo.buscar_por_id(id)
    
    def deletar(self, id):
        return self.repo.deletar(id)