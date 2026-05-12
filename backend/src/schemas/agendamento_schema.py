from datetime import datetime, timedelta
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

from src.schemas.base_schema import BaseSchema


# =========================
# RELACIONAMENTOS
# =========================

class TipoUsuarioResponse(BaseModel):
    tipousuario_id: int
    nome: str

    model_config = ConfigDict(from_attributes=True)


class UsuarioResponse(BaseModel):
    usuario_id: UUID
    nome: str
    email: str | None = None

    tiposusuarios: TipoUsuarioResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class PacienteResponse(BaseModel):
    paciente_id: int
    nome: str

    model_config = ConfigDict(from_attributes=True)


class StatusAgendamentoResponse(BaseModel):
    statusagendamento_id: int
    nome: str

    model_config = ConfigDict(from_attributes=True)


# =========================
# BASE
# =========================

class AgendamentoBase(BaseModel):
    usuario_id: UUID
    paciente_id: int = Field(..., gt=0)
    statusagendamento_id: int = Field(..., gt=0)

    data_hora_inicio: datetime
    data_hora_fim: datetime | None = None

    observacoes: str | None = Field(
        default=None,
        max_length=250
    )

    model_config = ConfigDict(
        str_strip_whitespace=True
    )

    @field_validator("data_hora_inicio")
    @classmethod
    def validar_data_futura(cls, value: datetime):
        if value <= datetime.now(value.tzinfo):
            raise ValueError(
                "Não é permitido criar agendamento em horário passado"
            )

        return value

    @model_validator(mode="after")
    def validar_regras_agendamento(self):

        # duração fixa de 1 hora
        self.data_hora_fim = (
            self.data_hora_inicio + timedelta(hours=1)
        )

        return self


# =========================
# CREATE
# =========================

class AgendamentoCreate(AgendamentoBase):
    pass


# =========================
# UPDATE
# =========================

class AgendamentoUpdate(BaseModel):
    usuario_id: UUID | None = None

    paciente_id: int | None = Field(
        default=None,
        gt=0
    )

    statusagendamento_id: int | None = Field(
        default=None,
        gt=0
    )

    data_hora_inicio: datetime | None = None

    observacoes: str | None = Field(
        default=None,
        max_length=250
    )

    model_config = ConfigDict(
        str_strip_whitespace=True
    )

    @field_validator("data_hora_inicio")
    @classmethod
    def validar_data_futura(
        cls,
        value: datetime | None
    ):
        if (
            value and
            value <= datetime.now(value.tzinfo)
        ):
            raise ValueError(
                "Não é permitido atualizar para horário passado"
            )

        return value


# =========================
# RESPONSE
# =========================

class AgendamentoResponse(BaseSchema):
    agendamento_id: int

    usuario_id: UUID
    paciente_id: int
    statusagendamento_id: int

    data_hora_inicio: datetime
    data_hora_fim: datetime

    observacoes: str | None = None

    # relacionamentos
    usuarios: UsuarioResponse | None = None
    pacientes: PacienteResponse | None = None
    statusagendamento: StatusAgendamentoResponse | None = None

    model_config = ConfigDict(
        from_attributes=True
    )