from src.repositories.paciente_repository import PacienteRepository
from src.services.base_service import now
from src.exceptions.validation_exception import ValidationException

class PacienteService:
    def criar(data):
        if not data["nome"] or data["nome"].strip() == "":
            raise ValidationException("O nome do paciente é obrigatório")
 
        return PacienteRepository.criar(data)

    def listar():
        return PacienteRepository.listar()
