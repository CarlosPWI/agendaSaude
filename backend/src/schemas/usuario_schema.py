from pydantic import BaseModel
from datetime import datetime

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str
    tipousuario_id: int

class UsuarioResponse(BaseModel):
    usuario_id: int
    nome: str
    email: str
    tipousuario_id: int
    criado_em: datetime
    alterado_em: datetime

class UsuarioUpdate(BaseModel):
    nome: str | None = None
    email: str | None = None
    senha: str | None = None
    tipousuario_id: int | None = None
    alterado_em: datetime | None = None