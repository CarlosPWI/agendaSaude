from src.repositories.agentecomunitario_repository import AgenteComunitarioRepository
from src.models.agentecomunitario import AgenteComunitario

class AgenteComunitarioService:

    def __init__(self):
        self.repo = AgenteComunitarioRepository()

    def cadastrar(self, nome):

        if nome == "":
            raise Exception("Nome obrigatório")

        agenteComunitario = AgenteComunitario(nome)

        return self.repo.inserir(agenteComunitario.to_dict())

    def listar(self):
        return self.repo.listar()