from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from datetime import date
from enum import Enum
import re

from src.schemas.base_schema import BaseSchema


class StatusPaciente(str, Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"


class PacienteBase(BaseModel):
    agentecomunitario_id: int = Field(..., gt=0)

    nome: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Nome completo do paciente"
    )

    numero_sus: str = Field(
        ...,
        min_length=1,
        max_length=20,
        description="Número do SUS"
    )

    email: EmailStr | None = None

    telefone: str | None = Field(
        default=None,
        max_length=20,
        description="Telefone do paciente"
    )

    data_nascimento: date

    observacoes: str | None = Field(
        default=None,
        max_length=500
    )

    status: StatusPaciente = StatusPaciente.ATIVO

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("telefone")
    @classmethod
    def normalizar_telefone(cls, value: str | None):
        if value is None:
            return value

        # Remove tudo que não for número
        telefone_limpo = re.sub(r"\D", "", value)

        return telefone_limpo


class PacienteCreate(PacienteBase):
    pass


class PacienteUpdate(BaseModel):
    agentecomunitario_id: int | None = Field(default=None, gt=0)
    nome: str | None = Field(default=None, min_length=1, max_length=150)
    numero_sus: str | None = Field(default=None, min_length=1, max_length=20)
    email: EmailStr | None = None
    telefone: str | None = Field(default=None, max_length=20)
    data_nascimento: date | None = None
    observacoes: str | None = Field(default=None, max_length=500)
    status: StatusPaciente | None = None

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("telefone")
    @classmethod
    def normalizar_telefone(cls, value: str | None):
        if value is None:
            return value

        return re.sub(r"\D", "", value)


class PacienteResponse(BaseSchema):
    paciente_id: int
    agentecomunitario_id: int
    nome: str
    numero_sus: str
    email: EmailStr | None
    telefone: str | None
    data_nascimento: date
    observacoes: str | None
    status: StatusPaciente

    model_config = ConfigDict(from_attributes=True)