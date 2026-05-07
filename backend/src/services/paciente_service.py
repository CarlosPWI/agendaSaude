from src.repositories.paciente_repository import PacienteRepository
from src.repositories.agentecomunitario_repository import AgenteComunitarioRepository

from src.schemas.paciente_schema import (
    PacienteCreate,
    PacienteUpdate
)

from src.exceptions.validation_exception import ValidationException


class PacienteService:

    @staticmethod
    def criar(data: PacienteCreate):
        PacienteService._validar_chaves_estrangeiras(data)
        payload = data.model_dump(mode="json")
        return PacienteRepository.criar(payload)

    @staticmethod
    def listar():
        return PacienteRepository.listar()

    @staticmethod
    def buscar_por_id(id: int):
        paciente = PacienteRepository.buscar_por_id(id)

        if not paciente:
            raise ValidationException("Paciente não encontrado", 404)

        return paciente

    @staticmethod
    def atualizar(id: int, dados: PacienteUpdate):
        PacienteService._buscar_ou_erro(id)
        PacienteService._validar_chaves_estrangeiras(dados)
        payload = dados.model_dump(mode="json")

        return PacienteRepository.atualizar(id, payload)

    @staticmethod
    def deletar(id: int):
        PacienteService._buscar_ou_erro(id)
        return PacienteRepository.deletar(id)

    @staticmethod
    def _buscar_ou_erro(id: int):
        paciente = PacienteRepository.buscar_por_id(id)

        if not paciente:
            raise ValidationException("Paciente não encontrado", 404)

        return paciente

    @staticmethod
    def _validar_chaves_estrangeiras(data):

        agente_id = getattr(data, "agentecomunitario_id", None)

        if agente_id is not None:
            agente = AgenteComunitarioRepository.buscar_por_id(agente_id)

            if not agente:
                raise ValidationException(
                    f"Agente comunitário com ID {agente_id} não encontrado",
                    400
                )
