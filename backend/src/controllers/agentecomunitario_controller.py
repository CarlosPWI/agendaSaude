from src.services.agentecomunitario_service import AgenteComunitarioService

class AgenteComunitarioController:

    def __init__(self):
        self.service = AgenteComunitarioService()

    def criar(self, nome):
        return self.service.cadastrar(nome)

    def listar(self):
        return self.service.listar()