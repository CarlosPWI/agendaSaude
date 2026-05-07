from pydantic import BaseModel, Field, ConfigDict
from src.schemas.base_schema import BaseSchema

class StatusAgendamentoBase(BaseModel):
    nome: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Status do agendamento"
    )

    model_config = ConfigDict(str_strip_whitespace=True)
class StatusAgendamentoCreate(StatusAgendamentoBase):
    pass

class StatusAgendamentoUpdate(BaseModel):
    nome: str | None = Field(
        default=None,
        min_length=1,
        max_length=50
    )

    model_config = ConfigDict(str_strip_whitespace=True)

class StatusAgendamentoResponse(BaseSchema):
    statusagendamento_id: int
    nome: str

    model_config = ConfigDict(from_attributes=True)