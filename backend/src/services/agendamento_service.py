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

        AgendamentoService._validar_chaves_estrangeiras(data)

        inicio = AgendamentoService._normalizar_datetime(
            data.data_hora_inicio
        )

        AgendamentoService._validar_horario(
            inicio
        )

        AgendamentoService._validar_conflito(
            inicio
        )

        payload = data.model_dump(exclude_unset=True)

        payload["data_hora_inicio"] = inicio

        payload["data_hora_fim"] = (
            inicio + timedelta(hours=1)
        )

        return AgendamentoRepository.criar(payload)

    @staticmethod
    def listar():
        return AgendamentoRepository.listar()

    @staticmethod
    def buscar_por_id(id: int):

        agendamento = AgendamentoRepository.buscar_por_id(id)

        if not agendamento:
            raise ValidationException(
                "Agendamento não encontrado",
                404
            )

        return agendamento

    @staticmethod
    def atualizar(id: int, dados: AgendamentoUpdate):

        agendamento_atual = (
            AgendamentoService._buscar_ou_erro(id)
        )

        AgendamentoService._validar_chaves_estrangeiras(
            dados
        )

        payload = dados.model_dump(
            exclude_unset=True
        )

        novo_inicio = payload.get(
            "data_hora_inicio"
        )

        inicio_atual = (
            agendamento_atual["data_hora_inicio"]
        )

        # Normaliza data atual do banco
        inicio_atual_normalizado = (
            AgendamentoService._normalizar_datetime(
                inicio_atual
            )
        )

        horario_foi_alterado = False

        if novo_inicio is not None:

            novo_inicio_normalizado = (
                AgendamentoService._normalizar_datetime(
                    novo_inicio
                )
            )

            # Verifica se realmente mudou
            horario_foi_alterado = (
                novo_inicio_normalizado
                !=
                inicio_atual_normalizado
            )

            if horario_foi_alterado:

                AgendamentoService._validar_horario(
                    novo_inicio_normalizado
                )

                AgendamentoService._validar_conflito(
                    novo_inicio_normalizado,
                    ignorar_id=id
                )

                payload["data_hora_inicio"] = (
                    novo_inicio_normalizado
                )

                payload["data_hora_fim"] = (
                    novo_inicio_normalizado
                    + timedelta(hours=1)
                )

        return AgendamentoRepository.atualizar(
            id,
            payload
        )

    @staticmethod
    def deletar(id: int):

        AgendamentoService._buscar_ou_erro(id)

        return AgendamentoRepository.deletar(id)

    @staticmethod
    def _buscar_ou_erro(id: int):

        agendamento = (
            AgendamentoRepository.buscar_por_id(id)
        )

        if not agendamento:
            raise ValidationException(
                "Agendamento não encontrado",
                404
            )

        return agendamento

    @staticmethod
    def _normalizar_datetime(data):

        if isinstance(data, str):

            # Remove Z do UTC para compatibilidade
            data = data.replace("Z", "+00:00")

            data = datetime.fromisoformat(data)

        return data.replace(
            tzinfo=None,
            microsecond=0
        )

    @staticmethod
    def _validar_horario(inicio: datetime):

        agora = datetime.now().replace(
            microsecond=0
        )

        # Não permite passado
        if inicio < agora:
            raise ValidationException(
                "Não é permitido agendamento em horário passado"
            )

        # Apenas horários cheios
        if (
            inicio.minute != 0
            or
            inicio.second != 0
        ):
            raise ValidationException(
                "O agendamento deve iniciar em horário cheio"
            )

    @staticmethod
    def _validar_conflito(
        data_inicio,
        ignorar_id: int | None = None
    ):

        data_fim = (
            data_inicio + timedelta(hours=1)
        )

        conflitos = (
            AgendamentoRepository.buscar_conflitos(
                data_inicio,
                data_fim
            )
        )

        if conflitos and conflitos.data:

            for agendamento in conflitos.data:

                if (
                    ignorar_id
                    and
                    agendamento["agendamento_id"] == ignorar_id
                ):
                    continue

                raise ValidationException(
                    "Já existe um agendamento nesse horário"
                )

    @staticmethod
    def _validar_chaves_estrangeiras(data):

        usuario_id = getattr(
            data,
            "usuario_id",
            None
        )

        if usuario_id is not None:

            usuario = (
                UsuarioRepository.buscar_por_id(
                    usuario_id
                )
            )

            if not usuario:
                raise ValidationException(
                    f"Usuário com ID {usuario_id} não encontrado",
                    400
                )

        paciente_id = getattr(
            data,
            "paciente_id",
            None
        )

        if paciente_id is not None:

            paciente = (
                PacienteRepository.buscar_por_id(
                    paciente_id
                )
            )

            if not paciente:
                raise ValidationException(
                    f"Paciente com ID {paciente_id} não encontrado",
                    400
                )

        status_id = getattr(
            data,
            "statusagendamento_id",
            None
        )

        if status_id is not None:

            status = (
                StatusAgendamentoRepository.buscar_por_id(
                    status_id
                )
            )

            if not status:
                raise ValidationException(
                    f"Status de agendamento com ID {status_id} não encontrado",
                    400
                )