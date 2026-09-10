import re
from datetime import datetime, timedelta
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
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

    model_config = ConfigDict(
        from_attributes=True
    )


class UsuarioResponse(BaseModel):
    usuario_id: UUID
    nome: str
    email: str | None = None

    tiposusuarios: TipoUsuarioResponse | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class PacienteResponse(BaseModel):
    paciente_id: int
    nome: str

    model_config = ConfigDict(
        from_attributes=True
    )


class StatusAgendamentoResponse(BaseModel):
    statusagendamento_id: int
    nome: str

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================
# BASE
# =========================

class ContatoAgendamento(BaseModel):
    """E-mail e WhatsApp de contato vinculados ao agendamento."""

    email: EmailStr | None = Field(
        default=None,
        description="E-mail de contato para este agendamento"
    )

    whatsapp: str | None = Field(
        default=None,
        max_length=20,
        description="WhatsApp no formato DDD (2) + 9 números"
    )

    model_config = ConfigDict(
        str_strip_whitespace=True
    )

    @field_validator("email", mode="before")
    @classmethod
    def normalizar_email(cls, value):
        if isinstance(value, str) and value.strip() == "":
            return None

        return value

    @field_validator("whatsapp")
    @classmethod
    def validar_whatsapp(cls, value: str | None):
        if value is None:
            return value

        # Remove tudo que não for número
        digitos = re.sub(r"\D", "", value)

        if digitos == "":
            return None

        if len(digitos) != 11:
            raise ValueError(
                "WhatsApp deve ter DDD (2 dígitos) + 9 números (11 no total)"
            )

        ddd = int(digitos[:2])

        if ddd < 11 or ddd > 99:
            raise ValueError("DDD do WhatsApp inválido")

        if digitos[2] != "9":
            raise ValueError(
                "O WhatsApp deve começar com 9 após o DDD"
            )

        return digitos


class AgendamentoBase(ContatoAgendamento):
    usuario_id: UUID

    paciente_id: int = Field(
        ...,
        gt=0
    )

    statusagendamento_id: int = Field(
        ...,
        gt=0
    )

    data_hora_inicio: datetime

    data_hora_fim: datetime | None = None

    observacoes: str | None = Field(
        default=None,
        max_length=250
    )


# =========================
# CREATE
# =========================

class AgendamentoCreate(AgendamentoBase):

    @model_validator(mode="after")
    def definir_data_hora_fim(self):

        # duração fixa de 30 minutos
        self.data_hora_fim = (
            self.data_hora_inicio + timedelta(minutes=30)
        )

        return self


# =========================
# UPDATE
# =========================

class AgendamentoUpdate(ContatoAgendamento):

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

    email: EmailStr | None = None
    whatsapp: str | None = None

    # relacionamentos
    usuarios: UsuarioResponse | None = None
    pacientes: PacienteResponse | None = None
    statusagendamento: StatusAgendamentoResponse | None = None

    model_config = ConfigDict(
        from_attributes=True
    )