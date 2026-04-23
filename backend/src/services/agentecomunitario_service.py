from src.repositories.agentecomunitario_repository import AgenteComunitarioRepository, AgenteRepository
from src.services.base_service import now
from src.exceptions.validation_exception import ValidationException

class AgenteComunitarioService:
    def criar(data):
        if not data["nome"] or data["nome"].strip() == "":
            raise ValidationException("O nome do agente comunitário é obrigatório")

        return AgenteComunitarioRepository.criar(data)

    def listar():
        return AgenteRepository.listar()

