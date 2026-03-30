from src.repositories.paciente_repository import PacienteRepository
from src.models.paciente import Paciente
from src.exceptions.validation_exception import ValidationException

class PacienteService:

    def __init__(self):
        self.repo = PacienteRepository()

    def cadastrar(self, nome, email, telefone, data_nascimento,observacoes,ativo, agentecomunitario_id):

        # validações do paciente
        if not nome or nome.strip() == "":
            raise ValidationException("O nome do paciente é obrigatório")

        paciente = Paciente(nome, email, telefone, data_nascimento, observacoes, ativo, agentecomunitario_id)

        return self.repo.inserir(paciente.to_dict())

    def listar(self):
        return self.repo.listar()
    
    def buscar_por_id(self, id):
        return self.repo.buscar_por_id(id)
    
    def deletar(self, id):
        return self.repo.deletar(id)