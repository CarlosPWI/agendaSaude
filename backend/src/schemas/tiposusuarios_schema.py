from pydantic import BaseModel, Field, ConfigDict
from src.schemas.base_schema import BaseSchema

class TiposUsuariosBase(BaseModel):
    nome: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Nome do tipo de usuário"
    )

    model_config = ConfigDict(str_strip_whitespace=True)

class TiposUsuariosCreate(TiposUsuariosBase):
    pass

class TiposUsuariosUpdate(BaseModel):
    nome: str | None = Field(
        default=None,
        min_length=1,
        max_length=50
    )

    model_config = ConfigDict(str_strip_whitespace=True)

class TiposUsuariosResponse(BaseSchema):
    tipousuario_id: int
    nome: str

    model_config = ConfigDict(from_attributes=True)