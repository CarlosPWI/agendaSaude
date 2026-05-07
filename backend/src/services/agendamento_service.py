from datetime import datetime, timedelta

from src.repositories.agendamento_repository import AgendamentoRepository
from src.repositories.paciente_repository import PacienteRepository
from src.repositories.statusagendamento_repository import StatusAgendamentoRepository
from src.repositories.usuario_repository import UsuarioRepository

from src.schemas.agendamento_schema import (
    AgendamentoCreate,
    AgendamentoUpdate
)

from src.exceptions.validation_exception import ValidationException


class AgendamentoService:

    @staticmethod
    def criar(data: AgendamentoCreate):
        AgendamentoService._validar_regras(data)
        AgendamentoService._validar_chaves_estrangeiras(data)

        AgendamentoService._validar_conflito(data.data_hora_inicio)

        payload = data.model_dump(mode="json")
        payload["data_hora_fim"] = data.data_hora_inicio + timedelta(hours=1)

        return AgendamentoRepository.criar(payload)

    @staticmethod
    def listar():
        return AgendamentoRepository.listar()

    @staticmethod
    def buscar_por_id(id: int):
        agendamento = AgendamentoRepository.buscar_por_id(id)

        if not agendamento:
            raise ValidationException("Agendamento não encontrado", 404)

        return agendamento

    @staticmethod
    def atualizar(id: int, dados: AgendamentoUpdate):
        AgendamentoService._buscar_ou_erro(id)

        AgendamentoService._validar_chaves_estrangeiras(dados)

        if dados.data_hora_inicio:
            AgendamentoService._validar_regras(dados)
            AgendamentoService._validar_conflito(dados.data_hora_inicio, ignorar_id=id)

        payload = dados.model_dump(mode="json", exclude_unset=True)

        if "data_hora_inicio" in payload:
            payload["data_hora_fim"] = payload["data_hora_inicio"] + timedelta(hours=1)

        return AgendamentoRepository.atualizar(id, payload)

    @staticmethod
    def deletar(id: int):
        AgendamentoService._buscar_ou_erro(id)
        return AgendamentoRepository.deletar(id)

    @staticmethod
    def _buscar_ou_erro(id: int):
        agendamento = AgendamentoRepository.buscar_por_id(id)

        if not agendamento:
            raise ValidationException("Agendamento não encontrado", 404)

        return agendamento

    @staticmethod
    def _validar_regras(data):
        inicio = data.data_hora_inicio
        agora = datetime.now(inicio.tzinfo)

        if inicio < agora:
            raise ValidationException("Não é permitido agendamento em horário passado")

        if inicio.minute != 0 or inicio.second != 0:
            raise ValidationException("O agendamento deve iniciar em horário cheio")

    @staticmethod
    def _validar_conflito(data_inicio, ignorar_id: int | None = None):
        data_fim = data_inicio + timedelta(hours=1)

        conflitos = AgendamentoRepository.buscar_conflitos(
            data_inicio,
            data_fim
        )

        if conflitos and conflitos.data:
            for agendamento in conflitos.data:
                if ignorar_id and agendamento["agendamento_id"] == ignorar_id:
                    continue

                raise ValidationException("Já existe um agendamento nesse horário")

    @staticmethod
    def _validar_chaves_estrangeiras(data):

        usuario_id = getattr(data, "usuario_id", None)
        if usuario_id is not None:
            usuario = UsuarioRepository.buscar_por_id(usuario_id)

            if not usuario:
                raise ValidationException(
                    f"Usuário com ID {usuario_id} não encontrado",
                    400
                )

        paciente_id = getattr(data, "paciente_id", None)
        if paciente_id is not None:
            paciente = PacienteRepository.buscar_por_id(paciente_id)

            if not paciente:
                raise ValidationException(
                    f"Paciente com ID {paciente_id} não encontrado",
                    400
                )

        status_id = getattr(data, "statusagendamento_id", None)
        if status_id is not None:
            status = StatusAgendamentoRepository.buscar_por_id(status_id)

            if not status:
                raise ValidationException(
                    f"Status de agendamento com ID {status_id} não encontrado",
                    400
                )