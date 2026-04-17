from src.repositories.usuario_repository import UsuarioRepository
from src.models.usuario import Usuario
from src.exceptions.validation_exception import ValidationException

class AuthService:

    def __init__(self):
        self.repo = UsuarioRepository()

    def registrar(self, nome, email, senha, tipousuario_id):

        if self.repo.buscar_por_email(email).data:
            raise ValidationException("Email já cadastrado")

        senha_hash = hash_senha(senha)

        return self.repo.criar({
            "nome": nome,
            "email": email,
            "senha": senha_hash,
            "tipousuario_id": tipousuario_id
        })

    def login(self, email, senha):

        response = self.repo.buscar_por_email(email)

        if not response.data:
            raise ValidationException("Usuário não encontrado")

        usuario = response.data[0]

        if not verificar_senha(senha, usuario["senha"]):
            raise ValidationException("Senha inválida")

        tipo_nome = usuario["tipos_usuario"]["nome"]

        token = gerar_token(usuario["id"], tipo_nome)

        return {
            "token": token,
            "usuario": usuario
        }