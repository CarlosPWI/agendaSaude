from src.repositories.tipousuario_repository import TipoUsuarioRepository
from src.models.tipousuario import TipoUsuario
from src.exceptions.validation_exception import ValidationException

class TipoUsuarioService:

    def __init__(self):
        self.repo = TipoUsuarioRepository()

    def cadastrar(self, nome):
        if not nome or nome.strip() == "":
            raise ValidationException("O nome do tipo de usuário é obrigatório")

        if nome.strip().__len__() >= 50:
            raise ValidationException("O nome do tipo de usuário deve ter no máximo 50 caracteres")

        tipo_usuario = TipoUsuario(nome)

        return self.repo.inserir(tipo_usuario.to_dict())

    def listar(self):
        return self.repo.listar()
    
    def buscar_por_id(self, id):
        return self.repo.buscar_por_id(id)
    
    def deletar(self, id):
        return self.repo.deletar(id)