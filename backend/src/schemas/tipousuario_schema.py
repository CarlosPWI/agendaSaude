from pydantic import BaseModel

class TipoUsuarioCreate(BaseModel):
    nome: str