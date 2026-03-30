from src.services.agentecomunitario_service import AgenteComunitarioService

class AgenteComunitarioController:

    def __init__(self):
        self.service = AgenteComunitarioService()

    def criar(self, nome):
        return self.service.cadastrar(nome)

    def listar(self):
        return self.service.listar()
    
    def buscar_por_id(self, id):
        return self.service.buscar_por_id(id) 
    
    def deletar(self, id):
        return self.service.deletar(id)