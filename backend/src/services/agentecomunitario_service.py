from src.exceptions.validation_exception import ValidationException
from src.repositories.agentecomunitario_repository import AgenteComunitarioRepository
from src.models.agentecomunitario import AgenteComunitario

class AgenteComunitarioService:

    def __init__(self):
        self.repo = AgenteComunitarioRepository()

    def cadastrar(self, nome):

        if nome == "":
            raise ValidationException("Nome obrigatório")

        agenteComunitario = AgenteComunitario(nome)

        return self.repo.inserir(agenteComunitario.to_dict())

    def listar(self):
        return self.repo.listar()

    def buscar_por_id(self, id):
        return self.repo.buscar_por_id(id)
    
    def deletar(self, id):
        return self.repo.deletar(id)