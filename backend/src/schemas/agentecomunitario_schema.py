from pydantic import BaseModel, Field, ConfigDict
from src.schemas.base_schema import BaseSchema

class AgenteComunitarioBase(BaseModel):
    nome: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Nome do agente comunitário"
    )

    model_config = ConfigDict(str_strip_whitespace=True)

class AgenteComunitarioCreate(AgenteComunitarioBase):
    pass

class AgenteComunitarioUpdate(AgenteComunitarioBase):
    nome: str | None = Field(
        default=None,
        min_length=1,
        max_length=50
    )

    model_config = ConfigDict(str_strip_whitespace=True)

class AgenteComunitarioResponse(BaseSchema):
    agentecomunitario_id: int
    nome: str

    model_config = ConfigDict(from_attributes=True)