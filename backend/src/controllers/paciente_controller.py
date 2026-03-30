from src.services.paciente_service import PacienteService
from src.exceptions.validation_exception import ValidationException

class PacienteController:

    def __init__(self):
        self.service = PacienteService()

    def criar(self, nome, email, telefone, data_nascimento, observacoes, ativo, agentecomunitario_id):
        return self.service.cadastrar(nome, email, telefone, data_nascimento, observacoes, ativo, agentecomunitario_id)

    def listar(self):
        return self.service.listar()
    
    def buscar_por_id(self, id):
        return self.service.buscar_por_id(id)
    
    def deletar(self, id):
        return self.service.deletar(id)